import { Router } from "express";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { PaginationSchema, buildPaginatedResponse } from "@gs-medcure/shared";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as { page: number; limit: number };
    const [data, total] = await Promise.all([
      db.productionLine.findMany({
        include: { machines: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: "asc" },
      }),
      db.productionLine.count(),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const line = await db.productionLine.findUnique({
      where: { id: req.params["id"] },
      include: { machines: true },
    });
    if (!line) throw AppError.notFound("Production line not found");
    res.json(line);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PRODUCTION_MANAGER"),
  async (req, res, next) => {
    try {
      const line = await db.productionLine.create({ data: req.body });
      res.status(201).json(line);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
