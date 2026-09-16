import { z } from "zod";
import { DispatchStatus } from "../enums";

export const CreateDispatchSchema = z.object({
  dispatchNumber: z.string().min(1).max(50),
  customerId: z.string().optional(),
  customerName: z.string().min(1).max(200),
  destinationAddress: z.string().optional(),
  plannedDispatchDate: z.coerce.date(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      finishedGoodId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ),
});

export const UpdateDispatchStatusSchema = z.object({
  status: z.nativeEnum(DispatchStatus),
  actualDispatchDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type CreateDispatchInput = z.infer<typeof CreateDispatchSchema>;
export type UpdateDispatchStatusInput = z.infer<
  typeof UpdateDispatchStatusSchema
>;
