import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = Object.assign(new Error("Validation error"), {
        statusCode: 400,
        details: result.error.flatten().fieldErrors,
      });
      next(err);
      return;
    }
    req.body = result.data as typeof req.body;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const err = Object.assign(new Error("Validation error"), {
        statusCode: 400,
        details: result.error.flatten().fieldErrors,
      });
      next(err);
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
