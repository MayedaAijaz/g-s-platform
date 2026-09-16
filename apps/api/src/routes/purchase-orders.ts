import { Router } from "express";
import {
  CreatePurchaseOrderSchema,
  UpdatePurchaseOrderSchema,
  CreateGoodsReceiptSchema,
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

router.get("/", validateQuery(PaginationSchema), async (req, res, next) => {
  try {
    const { page, limit, search } = req.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const where = search
      ? { poNumber: { contains: search, mode: "insensitive" as const } }
      : {};
    const [data, total] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        include: { supplier: true, items: { include: { material: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.purchaseOrder.count({ where }),
    ]);
    res.json(buildPaginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const po = await db.purchaseOrder.findUnique({
      where: { id: req.params["id"] },
      include: {
        supplier: true,
        items: { include: { material: true, receiptItems: true } },
        goodsReceipts: { include: { items: true, receivedBy: { select: { id: true, name: true } } } },
      },
    });
    if (!po) throw AppError.notFound("Purchase order not found");
    res.json(po);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAnyRole("PROCUREMENT_OFFICER"),
  validateBody(CreatePurchaseOrderSchema),
  async (req, res, next) => {
    try {
      const { items, ...poData } = req.body as {
        supplierId: string;
        poNumber: string;
        orderDate: Date;
        notes?: string;
        items: Array<{
          materialId: string;
          quantity: number;
          unitPrice: number;
          currency: string;
          expectedDeliveryDate?: Date;
          notes?: string;
        }>;
      };
      const po = await db.purchaseOrder.create({
        data: {
          ...poData,
          items: { create: items },
        },
        include: { items: true },
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "CREATE",
        entityType: "PurchaseOrder",
        entityId: po.id,
        newState: { poNumber: po.poNumber, status: po.status },
        ipAddress: req.ip,
      });
      res.status(201).json(po);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id/status",
  requireAnyRole("PROCUREMENT_OFFICER"),
  validateBody(UpdatePurchaseOrderSchema),
  async (req, res, next) => {
    try {
      const existing = await db.purchaseOrder.findUnique({
        where: { id: req.params["id"] },
      });
      if (!existing) throw AppError.notFound("Purchase order not found");

      const po = await db.purchaseOrder.update({
        where: { id: req.params["id"] },
        data: req.body,
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "STATUS_CHANGE",
        entityType: "PurchaseOrder",
        entityId: po.id,
        previousState: { status: existing.status },
        newState: { status: po.status },
        ipAddress: req.ip,
      });
      res.json(po);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Goods Receipt ────────────────────────────────────────────────────────────

router.post(
  "/goods-receipts",
  requireAnyRole("WAREHOUSE_MANAGER", "WAREHOUSE_OPERATOR", "PROCUREMENT_OFFICER"),
  validateBody(CreateGoodsReceiptSchema),
  async (req, res, next) => {
    try {
      const body = req.body as {
        purchaseOrderId: string;
        receivedAt?: Date;
        receivedBy: string;
        notes?: string;
        items: Array<{
          poItemId: string;
          quantityReceived: number;
          lotNumber: string;
          expiryDate?: Date;
          locationId?: string;
          notes?: string;
        }>;
      };

      const receipt = await db.$transaction(async (tx) => {
        const gr = await tx.goodsReceipt.create({
          data: {
            purchaseOrderId: body.purchaseOrderId,
            receivedAt: body.receivedAt ?? new Date(),
            receivedById: body.receivedBy,
            notes: body.notes,
            items: { create: body.items },
          },
          include: { items: true },
        });

        // Create material lots and update inventory for each received item
        for (const item of body.items) {
          const poItem = await tx.purchaseOrderItem.findUniqueOrThrow({
            where: { id: item.poItemId },
          });

          await tx.materialLot.create({
            data: {
              materialId: poItem.materialId,
              lotNumber: item.lotNumber,
              supplierId: (
                await tx.purchaseOrder.findUniqueOrThrow({
                  where: { id: body.purchaseOrderId },
                })
              ).supplierId,
              expiryDate: item.expiryDate,
              initialQuantity: item.quantityReceived,
              remainingQuantity: item.quantityReceived,
              locationId: item.locationId,
            },
          });

          await tx.purchaseOrderItem.update({
            where: { id: item.poItemId },
            data: {
              receivedQuantity: {
                increment: item.quantityReceived,
              },
            },
          });

          // Update inventory balance
          if (item.locationId) {
            await tx.inventoryBalance.upsert({
              where: {
                materialId_locationId: {
                  materialId: poItem.materialId,
                  locationId: item.locationId,
                },
              },
              create: {
                materialId: poItem.materialId,
                locationId: item.locationId,
                quantity: item.quantityReceived,
              },
              update: {
                quantity: { increment: item.quantityReceived },
              },
            });
          }
        }

        // Update PO status
        const allItems = await tx.purchaseOrderItem.findMany({
          where: { purchaseOrderId: body.purchaseOrderId },
        });
        const allReceived = allItems.every((i) =>
          i.receivedQuantity.greaterThanOrEqualTo(i.quantity)
        );
        await tx.purchaseOrder.update({
          where: { id: body.purchaseOrderId },
          data: {
            status: allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
          },
        });

        return gr;
      });

      res.status(201).json(receipt);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
