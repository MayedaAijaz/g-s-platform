import { Router } from "express";
import { BatchTraceabilityQuerySchema } from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/v1/traceability/batch
 * Returns a full genealogy for a batch: product, order, line, machine,
 * operators, material lots, supplier/PO, production logs, QC, sterilization,
 * finished goods, and dispatch records.
 */
router.get("/batch", validateQuery(BatchTraceabilityQuerySchema), async (req, res, next) => {
  try {
    const { batchId, batchNumber } = req.query as {
      batchId?: string;
      batchNumber?: string;
    };
    if (!batchId && !batchNumber) {
      throw AppError.badRequest("Provide batchId or batchNumber");
    }

    const where = batchId ? { id: batchId } : { batchNumber: batchNumber! };

    const batch = await db.productionBatch.findFirst({
      where,
      include: {
        // ─ Production order & product
        productionOrder: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
            productionLine: true,
          },
        },
        // ─ Machine
        machine: {
          include: { productionLine: true },
        },
        // ─ Operators
        operators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                employeeId: true,
                role: true,
              },
            },
          },
        },
        // ─ Material lots → supplier & purchase order chain
        batchMaterials: {
          include: {
            materialLot: {
              include: {
                material: true,
                supplier: true,
              },
            },
          },
        },
        // ─ Production logs
        productionLogs: {
          orderBy: { logTime: "asc" },
          include: {
            operator: { select: { id: true, name: true } },
          },
        },
        // ─ QC inspections & results
        qcInspections: {
          include: {
            inspector: { select: { id: true, name: true } },
            template: {
              include: {
                parameters: { orderBy: { sortOrder: "asc" } },
              },
            },
            results: {
              include: { parameter: true },
              orderBy: { recordedAt: "asc" },
            },
          },
          orderBy: { inspectionDate: "asc" },
        },
        // ─ Non-conformances
        nonConformances: {
          orderBy: { createdAt: "asc" },
        },
        // ─ Sterilization
        sterilizationBatches: {
          include: {
            cycle: {
              include: {
                operator: { select: { id: true, name: true } },
              },
            },
          },
        },
        // ─ Finished goods → warehouse location
        finishedGoods: {
          include: {
            location: {
              include: { warehouse: true },
            },
            dispatchItems: {
              include: {
                dispatch: true,
              },
            },
          },
        },
      },
    });

    if (!batch) throw AppError.notFound("Batch not found");

    // Enrich: look up PO lines for each material lot
    const lotMaterialIds = batch.batchMaterials.map(
      (bm) => bm.materialLot.materialId
    );
    const poItems = await db.purchaseOrderItem.findMany({
      where: {
        materialId: { in: lotMaterialIds },
      },
      include: {
        purchaseOrder: { include: { supplier: true } },
        material: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      _disclaimer: "SYNTHETIC / DEMO DATA — not connected to any real manufacturing system",
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        status: batch.status,
        plannedQuantity: batch.plannedQuantity,
        producedQuantity: batch.producedQuantity,
        rejectedQuantity: batch.rejectedQuantity,
        startTime: batch.startTime,
        endTime: batch.endTime,
        releasedAt: batch.releasedAt,
        notes: batch.notes,
        createdAt: batch.createdAt,
      },
      product: batch.productionOrder.productVariant.product,
      productVariant: batch.productionOrder.productVariant,
      productionOrder: {
        id: batch.productionOrder.id,
        orderNumber: batch.productionOrder.orderNumber,
        plannedQuantity: batch.productionOrder.plannedQuantity,
        plannedStartDate: batch.productionOrder.plannedStartDate,
      },
      productionLine: batch.productionOrder.productionLine,
      machine: batch.machine,
      operators: batch.operators.map((o) => o.user),
      materialLots: batch.batchMaterials.map((bm) => ({
        lotNumber: bm.materialLot.lotNumber,
        material: bm.materialLot.material,
        supplier: bm.materialLot.supplier,
        expiryDate: bm.materialLot.expiryDate,
        plannedQuantity: bm.plannedQuantity,
        actualQuantity: bm.actualQuantity,
        relatedPurchaseOrders: poItems
          .filter((p) => p.materialId === bm.materialLot.materialId)
          .map((p) => ({
            poNumber: p.purchaseOrder.poNumber,
            supplier: p.purchaseOrder.supplier,
          })),
      })),
      productionLogs: batch.productionLogs,
      qcInspections: batch.qcInspections,
      nonConformances: batch.nonConformances,
      sterilization: batch.sterilizationBatches,
      finishedGoods: batch.finishedGoods,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
