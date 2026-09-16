import { z } from "zod";
import { InventoryTransactionType } from "../enums";

export const CreateWarehouseSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateWarehouseLocationSchema = z.object({
  warehouseId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().optional(),
  zone: z.string().optional(),
  aisle: z.string().optional(),
  rack: z.string().optional(),
  bin: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateInventoryTransactionSchema = z.object({
  materialLotId: z.string().uuid(),
  fromLocationId: z.string().uuid().optional(),
  toLocationId: z.string().uuid().optional(),
  transactionType: z.nativeEnum(InventoryTransactionType),
  quantity: z.number(),
  referenceId: z.string().uuid().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateWarehouseInput = z.infer<typeof CreateWarehouseSchema>;
export type CreateWarehouseLocationInput = z.infer<
  typeof CreateWarehouseLocationSchema
>;
export type CreateInventoryTransactionInput = z.infer<
  typeof CreateInventoryTransactionSchema
>;
