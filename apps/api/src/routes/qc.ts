import { Router } from "express";
import {
  CreateQCTemplateSchema,
  CreateQCInspectionSchema,
  SubmitQCResultsSchema,
  CreateNonConformanceSchema,
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

// ─── QC Templates ─────────────────────────────────────────────────────────────

router.get(
  "/templates",
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as { page: number; limit: number };
      const [data, total] = await Promise.all([
        db.qCTemplate.findMany({
          include: {
            productVariant: { include: { product: true } },
            parameters: { orderBy: { sortOrder: "asc" } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.qCTemplate.count(),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

router.get("/templates/:id", async (req, res, next) => {
  try {
    const tmpl = await db.qCTemplate.findUnique({
      where: { id: req.params["id"] },
      include: {
        parameters: { orderBy: { sortOrder: "asc" } },
        productVariant: { include: { product: true } },
      },
    });
    if (!tmpl) throw AppError.notFound("QC template not found");
    res.json(tmpl);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/templates",
  requireAnyRole("QC_MANAGER"),
  validateBody(CreateQCTemplateSchema),
  async (req, res, next) => {
    try {
      const { parameters, ...tmplData } = req.body as {
        name: string;
        productVariantId?: string;
        version: string;
        isActive: boolean;
        parameters: Array<{
          parameterName: string;
          parameterCode: string;
          unit?: string;
          minValue?: number;
          maxValue?: number;
          expectedValue?: string;
          isCritical: boolean;
        }>;
      };
      const tmpl = await db.qCTemplate.create({
        data: { ...tmplData, parameters: { create: parameters } },
        include: { parameters: true },
      });
      res.status(201).json(tmpl);
    } catch (err) {
      next(err);
    }
  }
);

// ─── QC Inspections ───────────────────────────────────────────────────────────

router.get(
  "/inspections",
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as { page: number; limit: number };
      const [data, total] = await Promise.all([
        db.qCInspection.findMany({
          include: {
            batch: {
              include: {
                productionOrder: {
                  include: { productVariant: { include: { product: true } } },
                },
              },
            },
            inspector: { select: { id: true, name: true } },
            template: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.qCInspection.count(),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

router.get("/inspections/:id", async (req, res, next) => {
  try {
    const inspection = await db.qCInspection.findUnique({
      where: { id: req.params["id"] },
      include: {
        batch: {
          include: {
            productionOrder: {
              include: { productVariant: { include: { product: true } } },
            },
          },
        },
        inspector: { select: { id: true, name: true } },
        template: { include: { parameters: { orderBy: { sortOrder: "asc" } } } },
        results: {
          include: { parameter: true },
          orderBy: { recordedAt: "asc" },
        },
      },
    });
    if (!inspection) throw AppError.notFound("Inspection not found");
    res.json(inspection);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/inspections",
  requireAnyRole("QC_MANAGER", "QC_INSPECTOR"),
  validateBody(CreateQCInspectionSchema),
  async (req, res, next) => {
    try {
      const inspection = await db.qCInspection.create({
        data: {
          ...req.body,
          overallStatus: "IN_PROGRESS",
        },
        include: {
          template: { include: { parameters: true } },
          inspector: { select: { id: true, name: true } },
        },
      });
      res.status(201).json(inspection);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/inspections/:id/results",
  requireAnyRole("QC_MANAGER", "QC_INSPECTOR"),
  validateBody(SubmitQCResultsSchema),
  async (req, res, next) => {
    try {
      const authed = req as AuthenticatedRequest;
      const { results, overallStatus, notes } = req.body as {
        inspectionId: string;
        results: Array<{
          parameterId: string;
          actualValue: string;
          passed: boolean;
          notes?: string;
        }>;
        overallStatus: string;
        notes?: string;
      };

      const existing = await db.qCInspection.findUnique({
        where: { id: req.params["id"] },
      });
      if (!existing) throw AppError.notFound("Inspection not found");

      // QC results are immutable once submitted — never allow silent mutation
      if (existing.overallStatus !== "IN_PROGRESS" && existing.overallStatus !== "PENDING") {
        throw AppError.unprocessable(
          "Cannot modify QC results: inspection is already finalized"
        );
      }

      const updated = await db.$transaction(async (tx) => {
        await tx.qCResult.createMany({ data: results.map((r) => ({ ...r, inspectionId: req.params["id"]! })) });
        return tx.qCInspection.update({
          where: { id: req.params["id"] },
          data: { overallStatus: overallStatus as never, notes },
          include: { results: { include: { parameter: true } } },
        });
      });

      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "QC_RESULTS_SUBMITTED",
        entityType: "QCInspection",
        entityId: existing.id,
        newState: { overallStatus, resultCount: results.length },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Non-Conformances ─────────────────────────────────────────────────────────

router.get(
  "/ncrs",
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as { page: number; limit: number };
      const [data, total] = await Promise.all([
        db.nonConformance.findMany({
          include: {
            batch: { include: { productionOrder: { include: { productVariant: { include: { product: true } } } } } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.nonConformance.count(),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/ncrs",
  requireAnyRole("QC_MANAGER", "QC_INSPECTOR"),
  validateBody(CreateNonConformanceSchema),
  async (req, res, next) => {
    try {
      const ncr = await db.nonConformance.create({ data: req.body });
      res.status(201).json(ncr);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
