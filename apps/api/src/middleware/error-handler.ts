import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "./app-error.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Plain Error objects augmented with statusCode (from validate middleware)
  if (err instanceof Error && "statusCode" in err) {
    const augmented = err as Error & { statusCode: number; details?: unknown };
    res.status(augmented.statusCode).json({
      error: augmented.message,
      ...(augmented.details ? { details: augmented.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Prisma unique constraint
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  ) {
    res.status(409).json({ error: "A record with this value already exists." });
    return;
  }

  // Prisma record not found
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  ) {
    res.status(404).json({ error: "Record not found." });
    return;
  }

  console.error("[Unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
}
