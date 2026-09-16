import { Router } from "express";
import {
  CreateDispatchSchema,
  UpdateDispatchStatusSchema,
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

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit, search } = req.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const where = search
      ? {
          OR: [
            { dispatchNumber: { contains: search, mode: "insensitive" as const } },
            { customerName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      db.dispatch.findMany({
        where,
        include: {
          items: {
            include: {
              finishedGood: {
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
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.dispatch.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const dispatch = await db.dispatch.findUnique({
      where: { id: req.params["id"] },
      include: {
        items: {
          include: {
            finishedGood: {
              include: {
                batch: {
                  include: {
                    productionOrder: {
                      include: { productVariant: { include: { product: true } } },
                    },
                  },
                },
                location: { include: { warehouse: true } },
              },
            },
          },
        },
      },
    });
    if (!dispatch) throw AppError.notFound("Dispatch not found");
    res.json(dispatch);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("WAREHOUSE_MANAGER"),
  validateBody(CreateDispatchSchema),
  async (req, res, next) => {
    try {
      const { items, ...dispatchData } = req.body as {
        dispatchNumber: string;
        customerName: string;
        plannedDispatchDate: Date;
        items: Array<{ finishedGoodId: string; quantity: number }>;
        [key: string]: unknown;
      };
      const dispatch = await db.dispatch.create({
        data: {
          ...dispatchData,
          items: { create: items },
        },
        include: { items: true },
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "CREATE",
        entityType: "Dispatch",
        entityId: dispatch.id,
        newState: { dispatchNumber: dispatch.dispatchNumber, status: dispatch.status },
        ipAddress: req.ip,
      });
      res.status(201).json(dispatch);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id/status",
  requireAnyRole("WAREHOUSE_MANAGER"),
  validateBody(UpdateDispatchStatusSchema),
  async (req, res, next) => {
    try {
      const authed = req as AuthenticatedRequest;
      const existing = await db.dispatch.findUnique({
        where: { id: req.params["id"] },
      });
      if (!existing) throw AppError.notFound("Dispatch not found");

      const dispatch = await db.dispatch.update({
        where: { id: req.params["id"] },
        data: req.body,
      });

      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "STATUS_CHANGE",
        entityType: "Dispatch",
        entityId: dispatch.id,
        previousState: { status: existing.status },
        newState: { status: dispatch.status },
        ipAddress: req.ip,
      });

      res.json(dispatch);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
