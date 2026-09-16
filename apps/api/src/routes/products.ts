import { Router } from "express";
import {
  CreateProductSchema,
  UpdateProductSchema,
  CreateProductVariantSchema,
  UpdateProductVariantSchema,
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

// ─── Products ─────────────────────────────────────────────────────────────────

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
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { variants: { where: { isActive: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: "asc" },
      }),
      db.product.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await db.product.findUnique({
      where: { id: req.params["id"] },
      include: { variants: true },
    });
    if (!product) throw AppError.notFound("Product not found");
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(CreateProductSchema),
  async (req, res, next) => {
    try {
      const product = await db.product.create({ data: req.body });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "CREATE",
        entityType: "Product",
        entityId: product.id,
        newState: req.body,
        ipAddress: req.ip,
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(UpdateProductSchema),
  async (req, res, next) => {
    try {
      const product = await db.product.update({
        where: { id: req.params["id"] },
        data: req.body,
      });
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Variants ─────────────────────────────────────────────────────────────────

router.get("/:productId/variants", async (req, res, next) => {
  try {
    const variants = await db.productVariant.findMany({
      where: { productId: req.params["productId"] },
    });
    res.json(variants);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:productId/variants",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(CreateProductVariantSchema),
  async (req, res, next) => {
    try {
      const variant = await db.productVariant.create({
        data: { ...req.body, productId: req.params["productId"] },
      });
      res.status(201).json(variant);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/variants/:id",
  requireAnyRole("PRODUCTION_MANAGER"),
  validateBody(UpdateProductVariantSchema),
  async (req, res, next) => {
    try {
      const variant = await db.productVariant.update({
        where: { id: req.params["id"] },
        data: req.body,
      });
      res.json(variant);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
