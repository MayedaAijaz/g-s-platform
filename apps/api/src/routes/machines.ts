import { Router } from "express";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { PaginationSchema, buildPaginatedResponse } from "@gs-medcure/shared";
import { validateQuery } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as { page: number; limit: number };
    const [data, total] = await Promise.all([
      db.machine.findMany({
        include: { productionLine: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: "asc" },
      }),
      db.machine.count(),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const machine = await db.machine.findUnique({
      where: { id: req.params["id"] },
      include: {
        productionLine: true,
        maintenanceRecords: {
          orderBy: { startTime: "desc" },
          take: 10,
        },
      },
    });
    if (!machine) throw AppError.notFound("Machine not found");
    res.json(machine);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PRODUCTION_MANAGER"),
  async (req, res, next) => {
    try {
      const machine = await db.machine.create({ data: req.body });
      res.status(201).json(machine);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id/status",
  requireAnyRole("PRODUCTION_MANAGER"),
  async (req, res, next) => {
    try {
      const machine = await db.machine.update({
        where: { id: req.params["id"] },
        data: { status: req.body.status },
      });
      res.json(machine);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
