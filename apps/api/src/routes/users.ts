import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
  PaginationSchema,
} from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { AppError } from "../middleware/app-error.js";
import { requireAuth, requireAnyRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { createAuditLog } from "../services/audit.service.js";
import { buildPaginatedResponse } from "@gs-medcure/shared";

const router = Router();
router.use(requireAuth);

// GET /api/v1/users
router.get(
  "/",
  requireAnyRole("QC_MANAGER", "PRODUCTION_MANAGER", "WAREHOUSE_MANAGER"),
  validateQuery(PaginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit, search } = req.query as {
        page: number;
        limit: number;
        search?: string;
      };
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};
      const [data, total] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            employeeId: true,
            isActive: true,
            createdAt: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.user.count({ where }),
      ]);
      res.json(buildPaginatedResponse(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/users
router.post(
  "/",
  requireAnyRole(),
  validateBody(CreateUserSchema),
  async (req, res, next) => {
    try {
      const body = req.body as {
        email: string;
        name: string;
        password: string;
        role: string;
        employeeId?: string;
      };
      const passwordHash = await bcrypt.hash(body.password, 12);
      const user = await db.user.create({
        data: {
          email: body.email,
          name: body.name,
          passwordHash,
          role: body.role as never,
          employeeId: body.employeeId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          employeeId: true,
          isActive: true,
          createdAt: true,
        },
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        newState: { email: user.email, role: user.role },
        ipAddress: req.ip,
      });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/users/:id
router.get("/:id", async (req, res, next) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.params["id"] },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw AppError.notFound("User not found");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/:id
router.patch(
  "/:id",
  requireAnyRole(),
  validateBody(UpdateUserSchema),
  async (req, res, next) => {
    try {
      const existing = await db.user.findUnique({
        where: { id: req.params["id"] },
      });
      if (!existing) throw AppError.notFound("User not found");

      const user = await db.user.update({
        where: { id: req.params["id"] },
        data: req.body,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          employeeId: true,
          isActive: true,
          createdAt: true,
        },
      });
      const authed = req as AuthenticatedRequest;
      await createAuditLog({
        userId: authed.user.id,
        userEmail: authed.user.email,
        action: "UPDATE",
        entityType: "User",
        entityId: user.id,
        previousState: {
          role: existing.role,
          isActive: existing.isActive,
        },
        newState: { role: user.role, isActive: user.isActive },
        ipAddress: req.ip,
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
