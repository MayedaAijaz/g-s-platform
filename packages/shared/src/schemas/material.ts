import { z } from "zod";

export const CreateMaterialSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  materialType: z.string(),
  unitOfMeasure: z.string().min(1).max(20),
  reorderPoint: z.number().nonnegative().optional(),
  standardCost: z.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateMaterialSchema = CreateMaterialSchema.partial();

export const CreateMaterialLotSchema = z.object({
  materialId: z.string().uuid(),
  lotNumber: z.string().min(1).max(100),
  supplierId: z.string().uuid().optional(),
  supplierLotNumber: z.string().optional(),
  manufacturingDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  initialQuantity: z.number().positive(),
  locationId: z.string().uuid().optional(),
  certificateOfAnalysis: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateMaterialInput = z.infer<typeof CreateMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;
export type CreateMaterialLotInput = z.infer<typeof CreateMaterialLotSchema>;
