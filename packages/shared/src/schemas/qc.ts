import { z } from "zod";
import { QCStatus } from "../enums";

export const CreateQCTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  productVariantId: z.string().uuid().optional(),
  version: z.string().default("1.0"),
  isActive: z.boolean().default(true),
  parameters: z.array(
    z.object({
      parameterName: z.string().min(1),
      parameterCode: z.string().min(1),
      unit: z.string().optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      expectedValue: z.string().optional(),
      isCritical: z.boolean().default(false),
    })
  ),
});

export const CreateQCInspectionSchema = z.object({
  batchId: z.string().uuid(),
  templateId: z.string().uuid(),
  inspectorId: z.string().uuid(),
  sampleSize: z.number().int().positive(),
  inspectionDate: z.coerce.date().optional(),
});

export const SubmitQCResultsSchema = z.object({
  inspectionId: z.string().uuid(),
  results: z.array(
    z.object({
      parameterId: z.string().uuid(),
      actualValue: z.string(),
      passed: z.boolean(),
      notes: z.string().optional(),
    })
  ),
  overallStatus: z.nativeEnum(QCStatus),
  notes: z.string().optional(),
});

export const CreateNonConformanceSchema = z.object({
  batchId: z.string().uuid(),
  inspectionId: z.string().uuid().optional(),
  description: z.string().min(1),
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]),
  disposition: z
    .enum(["REWORK", "SCRAP", "USE_AS_IS", "RETURN_TO_SUPPLIER"])
    .optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
});

export type CreateQCTemplateInput = z.infer<typeof CreateQCTemplateSchema>;
export type CreateQCInspectionInput = z.infer<typeof CreateQCInspectionSchema>;
export type SubmitQCResultsInput = z.infer<typeof SubmitQCResultsSchema>;
export type CreateNonConformanceInput = z.infer<
  typeof CreateNonConformanceSchema
>;
