import { Router } from "express";
import {
  CreateSterilizationCycleSchema,
  AddBatchToSterilizationSchema,
  UpdateSterilizationStatusSchema,
  PaginationSchema,
  buildPaginatedResponse,
} from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createAuditLog } from "../services/audit.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/cycles", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as { page: number; limit: number };
    const [data, total] = await Promise.all([
      db.sterilizationCycle.findMany({
        include: {
          operator: { select: { id: true, name: true } },
          batches: { include: { batch: { select: { id: true, batchNumber: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startTime: "desc" },
      }),
      db.sterilizationCycle.count(),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/cycles/:id", async (req, res, next) => {
  try {
    const cycle = await db.sterilizationCycle.findUnique({
      where: { id: req.params["id"] },
      include: {
        operator: { select: { id: true, name: true } },
        batches: {
          include: {
            batch: {
              include: {
                productionOrder: {
                  include: { productVariant: { include: { product: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!cycle) throw AppError.notFound("Sterilization cycle not found");
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/cycles",
  requireAnyRole("STERILIZATION_OPERATOR"),
  validateBody(CreateSterilizationCycleSchema),
  async (req, res, next) => {
    try {
      const cycle = await db.sterilizationCycle.create({ data: req.body });
      res.status(201).json(cycle);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/cycles/:id/batches",
  requireAnyRole("STERILIZATION_OPERATOR"),
  validateBody(AddBatchToSterilizationSchema),
  async (req, res, next) => {
    try {
      const sb = await db.sterilizationBatch.create({
        data: { cycleId: req.params["id"], ...req.body },
        include: { batch: { select: { id: true, batchNumber: true } } },
      });
      res.status(201).json(sb);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/cycles/:id/status",
  requireAnyRole("STERILIZATION_OPERATOR"),
  validateBody(UpdateSterilizationStatusSchema),
  async (req, res, next) => {
    try {
      const authed = req as AuthenticatedRequest;
      const existing = await db.sterilizationCycle.findUnique({
        where: { id: req.params["id"] },
      });
      if (!existing) throw AppError.notFound("Cycle not found");

      const cycle = await db.sterilizationCycle.update({
        where: { id: req.params["id"] },
        data: {
          ...req.body,
          ...(req.body.status === "PASSED" || req.body.status === "FAILED"
            ? { endTime: existing.endTime ?? new Date() }
            : {}),
        },
      });

      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "STATUS_CHANGE",
        entityType: "SterilizationCycle",
        entityId: cycle.id,
        previousState: { status: existing.status },
        newState: { status: cycle.status },
        ipAddress: req.ip,
      });

      res.json(cycle);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
