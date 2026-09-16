import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";
import { UserRole } from "@gs-medcure/shared";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(AppError.unauthorized("No token provided"));
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authedReq = req as AuthenticatedRequest;
    if (!authedReq.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(authedReq.user.role)) {
      next(
        AppError.forbidden(
          `Role ${authedReq.user.role} is not authorized for this action`
        )
      );
      return;
    }
    next();
  };
}

/** Convenience: ADMIN can do anything any role can. */
export function requireAnyRole(...roles: UserRole[]) {
  return requireRole(UserRole.ADMIN, ...roles);
}
