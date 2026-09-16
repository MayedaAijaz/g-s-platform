import { Router } from "express";
import { AuditLogQuerySchema, buildPaginatedResponse } from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  requireAnyRole("QC_MANAGER", "PRODUCTION_MANAGER"),
  validateQuery(AuditLogQuerySchema),
  async (req, res, next) => {
    try {
      const q = req.query as {
        entityType?: string;
        entityId?: string;
        userId?: string;
        action?: string;
        from?: Date;
        to?: Date;
        page: number;
        limit: number;
      };

      const where = {
        ...(q.entityType ? { entityType: q.entityType } : {}),
        ...(q.entityId ? { entityId: q.entityId } : {}),
        ...(q.userId ? { userId: q.userId } : {}),
        ...(q.action ? { action: { contains: q.action, mode: "insensitive" as const } } : {}),
        ...(q.from || q.to
          ? {
              createdAt: {
                ...(q.from ? { gte: q.from } : {}),
                ...(q.to ? { lte: q.to } : {}),
              },
            }
          : {}),
      };

      const [data, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          include: { user: { select: { id: true, name: true, email: true } } },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
          orderBy: { createdAt: "desc" },
        }),
        db.auditLog.count({ where }),
      ]);

      res.json(buildPaginatedResponse(data, total, q.page, q.limit));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
