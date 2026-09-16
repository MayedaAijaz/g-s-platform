import { Router } from "express";
import { PaginationSchema, buildPaginatedResponse } from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

// GET /api/v1/inventory/balances
router.get(
  "/balances",
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as { page: number; limit: number };
      const [data, total] = await Promise.all([
        db.inventoryBalance.findMany({
          include: {
            material: true,
            location: { include: { warehouse: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: "desc" },
        }),
        db.inventoryBalance.count(),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/inventory/lots
router.get(
  "/lots",
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit, search } = req.query as {
        page: number;
        limit: number;
        search?: string;
      };
      const where = search
        ? { lotNumber: { contains: search, mode: "insensitive" as const } }
        : {};
      const [data, total] = await Promise.all([
        db.materialLot.findMany({
          where,
          include: {
            material: true,
            supplier: true,
            location: { include: { warehouse: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.materialLot.count({ where }),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/inventory/lots/:id
router.get("/lots/:id", async (req, res, next) => {
  try {
    const lot = await db.materialLot.findUnique({
      where: { id: req.params["id"] },
      include: {
        material: true,
        supplier: true,
        location: { include: { warehouse: true } },
        transactions: { orderBy: { createdAt: "desc" } },
        batchMaterials: {
          include: {
            batch: { include: { productionOrder: { include: { productVariant: { include: { product: true } } } } } },
          },
        },
      },
    });
    if (!lot) {
      res.status(404).json({ error: "Lot not found" });
      return;
    }
    res.json(lot);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/inventory/transactions
router.get(
  "/transactions",
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as { page: number; limit: number };
      const [data, total] = await Promise.all([
        db.inventoryTransaction.findMany({
          include: {
            materialLot: { include: { material: true } },
            fromLocation: true,
            toLocation: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.inventoryTransaction.count(),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
