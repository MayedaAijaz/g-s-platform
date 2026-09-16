import { Router } from "express";
import { db } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalBatches,
      activeBatches,
      releasedBatches,
      qcHoldBatches,
      rejectedBatches,
      totalMaterials,
      lowStockMaterials,
      openPOs,
      recentDispatches,
      batchesByStatus,
      monthlyProduction,
      qcPassRate,
      unreadAlerts,
    ] = await Promise.all([
      db.productionBatch.count(),
      db.productionBatch.count({ where: { status: "IN_PRODUCTION" } }),
      db.productionBatch.count({ where: { status: "RELEASED" } }),
      db.productionBatch.count({ where: { status: "QC_HOLD" } }),
      db.productionBatch.count({ where: { status: "REJECTED" } }),
      db.material.count({ where: { isActive: true } }),
      db.inventoryBalance.count({ where: { quantity: { lt: 100 } } }),
      db.purchaseOrder.count({
        where: { status: { in: ["DRAFT", "SUBMITTED", "PARTIALLY_RECEIVED"] } },
      }),
      db.dispatch.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      db.productionBatch.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      db.productionBatch.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          createdAt: true,
          producedQuantity: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      db.qCInspection.groupBy({
        by: ["overallStatus"],
        _count: { _all: true },
      }),
      db.alert.count({ where: { isRead: false } }),
    ]);

    // Compute QC pass rate
    const totalInspections = qcPassRate.reduce((sum, r) => sum + r._count._all, 0);
    const passedInspections = qcPassRate
      .filter((r) => r.overallStatus === "PASSED" || r.overallStatus === "CONDITIONALLY_RELEASED")
      .reduce((sum, r) => sum + r._count._all, 0);

    res.json({
      _disclaimer: "SYNTHETIC / DEMO DATA",
      kpis: {
        totalBatches,
        activeBatches,
        releasedBatches,
        qcHoldBatches,
        rejectedBatches,
        totalMaterials,
        lowStockMaterials,
        openPOs,
        unreadAlerts,
        qcPassRatePct:
          totalInspections > 0
            ? Math.round((passedInspections / totalInspections) * 100)
            : null,
      },
      batchesByStatus: batchesByStatus.map((b) => ({
        status: b.status,
        count: b._count._all,
      })),
      monthlyProduction,
      recentDispatches,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
