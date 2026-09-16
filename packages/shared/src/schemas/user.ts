import { z } from "zod";
import { UserRole } from "../enums";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  employeeId: z.string().optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({
  password: true,
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  employeeId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
