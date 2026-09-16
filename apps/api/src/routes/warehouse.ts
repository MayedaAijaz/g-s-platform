import { Router } from "express";
import {
  CreateWarehouseSchema,
  CreateWarehouseLocationSchema,
  PaginationSchema,
  buildPaginatedResponse,
} from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as { page: number; limit: number };
    const [data, total] = await Promise.all([
      db.warehouse.findMany({
        include: { locations: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: "asc" },
      }),
      db.warehouse.count(),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const wh = await db.warehouse.findUnique({
      where: { id: req.params["id"] },
      include: { locations: true },
    });
    if (!wh) throw AppError.notFound("Warehouse not found");
    res.json(wh);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("WAREHOUSE_MANAGER"),
  validateBody(CreateWarehouseSchema),
  async (req, res, next) => {
    try {
      const wh = await db.warehouse.create({ data: req.body });
      res.status(201).json(wh);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:id/locations",
  requireAnyRole("WAREHOUSE_MANAGER"),
  validateBody(CreateWarehouseLocationSchema),
  async (req, res, next) => {
    try {
      const loc = await db.warehouseLocation.create({
        data: { ...req.body, warehouseId: req.params["id"] },
      });
      res.status(201).json(loc);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
