import { Router } from "express";
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
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
      db.supplier.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      db.supplier.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const supplier = await db.supplier.findUnique({
      where: { id: req.params["id"] },
    });
    if (!supplier) throw AppError.notFound("Supplier not found");
    res.json(supplier);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PROCUREMENT_OFFICER"),
  validateBody(CreateSupplierSchema),
  async (req, res, next) => {
    try {
      const supplier = await db.supplier.create({ data: req.body });
      res.status(201).json(supplier);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  requireAnyRole("PROCUREMENT_OFFICER"),
  validateBody(UpdateSupplierSchema),
  async (req, res, next) => {
    try {
      const supplier = await db.supplier.update({
        where: { id: req.params["id"] },
        data: req.body,
      });
      res.json(supplier);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
