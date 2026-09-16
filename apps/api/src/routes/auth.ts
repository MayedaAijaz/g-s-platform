import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginSchema } from "@gs-medcure/shared";
import { db } from "../db/client.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/app-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", validateBody(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const authed = req as AuthenticatedRequest;
    const user = await db.user.findUnique({
      where: { id: authed.user.id },
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

export default router;
