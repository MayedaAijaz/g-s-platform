import { z } from "zod";

export const BatchTraceabilityQuerySchema = z.object({
  batchId: z.string().uuid().optional(),
  batchNumber: z.string().optional(),
});

export type BatchTraceabilityQuery = z.infer<
  typeof BatchTraceabilityQuerySchema
>;
