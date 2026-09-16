import { z } from "zod";
import { SterilizationMethod, SterilizationStatus } from "../enums";

export const CreateSterilizationCycleSchema = z.object({
  cycleNumber: z.string().min(1).max(100),
  method: z.nativeEnum(SterilizationMethod),
  equipmentId: z.string().optional(),
  operatorId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  temperature: z.number().optional(),
  pressure: z.number().optional(),
  duration: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const AddBatchToSterilizationSchema = z.object({
  cycleId: z.string().uuid(),
  batchId: z.string().uuid(),
  quantityLoaded: z.number().int().positive(),
});

export const UpdateSterilizationStatusSchema = z.object({
  status: z.nativeEnum(SterilizationStatus),
  biIndicatorResult: z.string().optional(),
  chemIndicatorResult: z.string().optional(),
  doseReceived: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateSterilizationCycleInput = z.infer<
  typeof CreateSterilizationCycleSchema
>;
export type AddBatchToSterilizationInput = z.infer<
  typeof AddBatchToSterilizationSchema
>;
export type UpdateSterilizationStatusInput = z.infer<
  typeof UpdateSterilizationStatusSchema
>;
