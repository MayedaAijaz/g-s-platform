import { Router } from "express";
import {
  CreateProductionOrderSchema,
  UpdateProductionOrderSchema,
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
      ? { orderNumber: { contains: search, mode: "insensitive" as const } }
      : {};
    const [data, total] = await Promise.all([
      db.productionOrder.findMany({
        where,
        include: {
          productVariant: { include: { product: true } },
          productionLine: true,
          batches: { select: { id: true, batchNumber: true, status: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.productionOrder.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await db.productionOrder.findUnique({
      where: { id: req.params["id"] },
      include: {
        productVariant: { include: { product: true } },
        productionLine: true,
        batches: {
          include: {
            operators: { include: { user: { select: { id: true, name: true } } } },
            machine: true,
          },
        },
      },
    });
    if (!order) throw AppError.notFound("Production order not found");
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(CreateProductionOrderSchema),
  async (req, res, next) => {
    try {
      const order = await db.productionOrder.create({
        data: req.body,
        include: { productVariant: true, productionLine: true },
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "CREATE",
        entityType: "ProductionOrder",
        entityId: order.id,
        newState: { orderNumber: order.orderNumber },
        ipAddress: req.ip,
      });
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(UpdateProductionOrderSchema),
  async (req, res, next) => {
    try {
      const order = await db.productionOrder.update({
        where: { id: req.params["id"] },
        data: req.body,
      });
      res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
