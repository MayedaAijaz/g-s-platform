import { z } from "zod";

export const CreateSupplierSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  country: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  isApproved: z.boolean().default(false),
  notes: z.string().optional(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
