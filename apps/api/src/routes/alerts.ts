import { Router } from "express";
import { db } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { PaginationSchema, buildPaginatedResponse } from "@gs-medcure/shared";
import { validateQuery } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as { page: number; limit: number };
    const [data, total] = await Promise.all([
      db.alert.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.alert.count(),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const alert = await db.alert.update({
      where: { id: req.params["id"] },
      data: { isRead: true },
    });
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

export default router;
