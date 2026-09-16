import { z } from "zod";
import { BatchStatus } from "../enums";

export const CreateProductionOrderSchema = z.object({
  productVariantId: z.string().uuid(),
  productionLineId: z.string().uuid(),
  orderNumber: z.string().min(1).max(50),
  plannedQuantity: z.number().int().positive(),
  plannedStartDate: z.coerce.date(),
  plannedEndDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const UpdateProductionOrderSchema =
  CreateProductionOrderSchema.partial();

export const CreateProductionBatchSchema = z.object({
  productionOrderId: z.string().uuid(),
  batchNumber: z.string().min(1).max(100),
  machineId: z.string().uuid().optional(),
  operatorIds: z.array(z.string().uuid()).min(1),
  plannedQuantity: z.number().int().positive(),
  startTime: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const UpdateBatchStatusSchema = z.object({
  status: z.nativeEnum(BatchStatus),
  reason: z.string().optional(),
});

export const AddBatchMaterialSchema = z.object({
  materialLotId: z.string().uuid(),
  plannedQuantity: z.number().positive(),
  actualQuantity: z.number().positive().optional(),
});

export const CreateProductionLogSchema = z.object({
  batchId: z.string().uuid(),
  logTime: z.coerce.date().optional(),
  eventType: z.string().min(1),
  description: z.string().min(1),
  value: z.string().optional(),
  unit: z.string().optional(),
  operatorId: z.string().uuid().optional(),
});

export type CreateProductionOrderInput = z.infer<
  typeof CreateProductionOrderSchema
>;
export type CreateProductionBatchInput = z.infer<
  typeof CreateProductionBatchSchema
>;
export type UpdateBatchStatusInput = z.infer<typeof UpdateBatchStatusSchema>;
export type AddBatchMaterialInput = z.infer<typeof AddBatchMaterialSchema>;
export type CreateProductionLogInput = z.infer<
  typeof CreateProductionLogSchema
>;
