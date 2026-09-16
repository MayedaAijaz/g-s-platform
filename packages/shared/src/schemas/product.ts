import { z } from "zod";

export const CreateProductSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  productFamily: z.string().optional(),
  regulatoryClass: z.string().optional(),
  draRegistrationNo: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateProductVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  size: z.string().optional(),
  needleGauge: z.string().optional(),
  barrelCapacityMl: z.number().positive().optional(),
  packagingConfig: z.string().optional(),
  unitsPerBox: z.number().int().positive().optional(),
  boxesPerCarton: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateProductVariantSchema =
  CreateProductVariantSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateProductVariantInput = z.infer<
  typeof CreateProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof UpdateProductVariantSchema
>;
