import { z } from "zod";
import { PurchaseOrderStatus } from "../enums";

export const POLineSchema = z.object({
  materialId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  currency: z.string().length(3).default("USD"),
  expectedDeliveryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const CreatePurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  poNumber: z.string().min(1).max(50),
  orderDate: z.coerce.date(),
  notes: z.string().optional(),
  items: z.array(POLineSchema).min(1),
});

export const UpdatePurchaseOrderSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus),
  notes: z.string().optional(),
});

export const CreateGoodsReceiptSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  receivedAt: z.coerce.date().optional(),
  receivedBy: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      poItemId: z.string().uuid(),
      quantityReceived: z.number().positive(),
      lotNumber: z.string().min(1).max(100),
      expiryDate: z.coerce.date().optional(),
      locationId: z.string().uuid().optional(),
      notes: z.string().optional(),
    })
  ),
});

export type POLineInput = z.infer<typeof POLineSchema>;
export type CreatePurchaseOrderInput = z.infer<
  typeof CreatePurchaseOrderSchema
>;
export type UpdatePurchaseOrderInput = z.infer<
  typeof UpdatePurchaseOrderSchema
>;
export type CreateGoodsReceiptInput = z.infer<typeof CreateGoodsReceiptSchema>;
