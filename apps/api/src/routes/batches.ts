import { Router } from "express";
import {
  CreateProductionBatchSchema,
  UpdateBatchStatusSchema,
  AddBatchMaterialSchema,
  CreateProductionLogSchema,
  PaginationSchema,
  buildPaginatedResponse,
} from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createAuditLog } from "../services/audit.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

// ─── Batch state-machine transitions ────────────────────────────────────────
// DRAFT -> IN_PRODUCTION (PRODUCTION_MANAGER, PRODUCTION_OPERATOR)
// IN_PRODUCTION -> QC_HOLD (QC_MANAGER, QC_INSPECTOR)
// QC_HOLD -> RELEASED (QC_MANAGER only — requires passed QC)
// QC_HOLD -> REJECTED (QC_MANAGER)
// IN_PRODUCTION -> REJECTED (PRODUCTION_MANAGER)

const ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
  DRAFT: { IN_PRODUCTION: ["ADMIN", "PRODUCTION_MANAGER", "PRODUCTION_OPERATOR"] },
  IN_PRODUCTION: {
    QC_HOLD: ["ADMIN", "QC_MANAGER", "QC_INSPECTOR", "PRODUCTION_MANAGER"],
    REJECTED: ["ADMIN", "PRODUCTION_MANAGER"],
  },
  QC_HOLD: {
    RELEASED: ["ADMIN", "QC_MANAGER"],
    REJECTED: ["ADMIN", "QC_MANAGER"],
  },
};

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit, search } = req.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const where = search
      ? { batchNumber: { contains: search, mode: "insensitive" as const } }
      : {};
    const [data, total] = await Promise.all([
      db.productionBatch.findMany({
        where,
        include: {
          productionOrder: {
            include: { productVariant: { include: { product: true } } },
          },
          machine: true,
          operators: { include: { user: { select: { id: true, name: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.productionBatch.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const batch = await db.productionBatch.findUnique({
      where: { id: req.params["id"] },
      include: {
        productionOrder: {
          include: {
            productVariant: { include: { product: true } },
            productionLine: true,
          },
        },
        machine: true,
        operators: { include: { user: { select: { id: true, name: true, employeeId: true } } } },
        batchMaterials: {
          include: {
            materialLot: {
              include: { material: true, supplier: true },
            },
          },
        },
        productionLogs: {
          orderBy: { logTime: "asc" },
          include: { operator: { select: { id: true, name: true } } },
        },
        qcInspections: {
          include: {
            inspector: { select: { id: true, name: true } },
            results: { include: { parameter: true } },
          },
        },
        sterilizationBatches: {
          include: { cycle: true },
        },
        nonConformances: true,
        finishedGoods: { include: { location: { include: { warehouse: true } } } },
      },
    });
    if (!batch) throw AppError.notFound("Batch not found");
    res.json(batch);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(CreateProductionBatchSchema),
  async (req, res, next) => {
    try {
      const { operatorIds, ...batchData } = req.body as {
        productionOrderId: string;
        batchNumber: string;
        machineId?: string;
        operatorIds: string[];
        plannedQuantity: number;
        startTime?: Date;
        notes?: string;
      };

      const batch = await db.productionBatch.create({
        data: {
          ...batchData,
          operators: { create: operatorIds.map((id) => ({ userId: id })) },
        },
        include: {
          operators: { include: { user: { select: { id: true, name: true } } } },
        },
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "CREATE",
        entityType: "ProductionBatch",
        entityId: batch.id,
        newState: { batchNumber: batch.batchNumber, status: batch.status },
        ipAddress: req.ip,
      });
      res.status(201).json(batch);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /batches/:id/status — state machine
router.patch(
  "/:id/status",
  requireAuth,
  validateBody(UpdateBatchStatusSchema),
  async (req, res, next) => {
    try {
      const authed = req as AuthenticatedRequest;
      const { status: newStatus, reason } = req.body as {
        status: string;
        reason?: string;
      };

      const batch = await db.productionBatch.findUnique({
        where: { id: req.params["id"] },
        include: { qcInspections: true },
      });
      if (!batch) throw AppError.notFound("Batch not found");

      const allowed = ALLOWED_TRANSITIONS[batch.status]?.[newStatus];
      if (!allowed) {
        throw AppError.unprocessable(
          `Transition from ${batch.status} to ${newStatus} is not allowed`
        );
      }
      if (!allowed.includes(authed.user.role)) {
        throw AppError.forbidden(
          `Role ${authed.user.role} cannot perform this transition`
        );
      }

      // Release requires at least one passed QC inspection
      if (newStatus === "RELEASED") {
        const passedQC = batch.qcInspections.some(
          (i) => i.overallStatus === "PASSED" || i.overallStatus === "CONDITIONALLY_RELEASED"
        );
        if (!passedQC) {
          throw AppError.unprocessable(
            "Cannot release batch: no passed QC inspection found"
          );
        }
      }

      const updated = await db.productionBatch.update({
        where: { id: req.params["id"] },
        data: {
          status: newStatus as never,
          ...(newStatus === "RELEASED"
            ? { releasedAt: new Date(), releasedById: authed.user.id }
            : {}),
          ...(newStatus === "IN_PRODUCTION" && !batch.startTime
            ? { startTime: new Date() }
            : {}),
          ...(["RELEASED", "REJECTED"].includes(newStatus)
            ? { endTime: new Date() }
            : {}),
        },
      });

      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "STATUS_CHANGE",
        entityType: "ProductionBatch",
        entityId: batch.id,
        previousState: { status: batch.status },
        newState: { status: newStatus, reason },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// POST /batches/:id/materials
router.post(
  "/:id/materials",
  requireAnyRole("PRODUCTION_OPERATOR", "PRODUCTION_MANAGER"),
  validateBody(AddBatchMaterialSchema),
  async (req, res, next) => {
    try {
      const bm = await db.batchMaterial.create({
        data: { batchId: req.params["id"], ...req.body },
        include: { materialLot: { include: { material: true } } },
      });
      res.status(201).json(bm);
    } catch (err) {
      next(err);
    }
  }
);

// POST /batches/:id/logs
router.post(
  "/:id/logs",
  requireAnyRole("PRODUCTION_OPERATOR", "PRODUCTION_MANAGER"),
  validateBody(CreateProductionLogSchema),
  async (req, res, next) => {
    try {
      const log = await db.productionLog.create({ data: req.body });
      res.status(201).json(log);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
