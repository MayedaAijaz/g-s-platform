import { Router } from "express";
import {
  CreateMaterialSchema,
  UpdateMaterialSchema,
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
      db.material.findMany({
        where,
        include: {
          inventoryBalances: { include: { location: { include: { warehouse: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: "asc" },
      }),
      db.material.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const material = await db.material.findUnique({
      where: { id: req.params["id"] },
      include: {
        lots: {
          include: { supplier: true, location: true },
          orderBy: { createdAt: "desc" },
        },
        inventoryBalances: {
          include: { location: { include: { warehouse: true } } },
        },
      },
    });
    if (!material) throw AppError.notFound("Material not found");
    res.json(material);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PROCUREMENT_OFFICER", "PRODUCTION_MANAGER"),
  validateBody(CreateMaterialSchema),
  async (req, res, next) => {
    try {
      const material = await db.material.create({ data: req.body });
      res.status(201).json(material);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  requireAnyRole("PROCUREMENT_OFFICER", "PRODUCTION_MANAGER"),
  validateBody(UpdateMaterialSchema),
  async (req, res, next) => {
    try {
      const material = await db.material.update({
        where: { id: req.params["id"] },
        data: req.body,
      });
      res.json(material);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Lots ─────────────────────────────────────────────────────────────────────

router.get("/:id/lots", async (req, res, next) => {
  try {
    const lots = await db.materialLot.findMany({
      where: { materialId: req.params["id"] },
      include: { supplier: true, location: { include: { warehouse: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(lots);
  } catch (err) {
    next(err);
  }
});

export default router;
