import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import suppliersRouter from "./routes/suppliers.js";
import materialsRouter from "./routes/materials.js";
import purchaseOrdersRouter from "./routes/purchase-orders.js";
import inventoryRouter from "./routes/inventory.js";
import productionLinesRouter from "./routes/production-lines.js";
import machinesRouter from "./routes/machines.js";
import productionOrdersRouter from "./routes/production-orders.js";
import batchesRouter from "./routes/batches.js";
import qcRouter from "./routes/qc.js";
import sterilizationRouter from "./routes/sterilization.js";
import warehouseRouter from "./routes/warehouse.js";
import dispatchRouter from "./routes/dispatch.js";
import traceabilityRouter from "./routes/traceability.js";
import dashboardRouter from "./routes/dashboard.js";
import auditRouter from "./routes/audit.js";
import alertsRouter from "./routes/alerts.js";

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Body / logging ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(compression());
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
const api = express.Router();

api.use("/auth", authLimiter, authRouter);
api.use("/users", usersRouter);
api.use("/products", productsRouter);
api.use("/suppliers", suppliersRouter);
api.use("/materials", materialsRouter);
api.use("/purchase-orders", purchaseOrdersRouter);
api.use("/inventory", inventoryRouter);
api.use("/production-lines", productionLinesRouter);
api.use("/machines", machinesRouter);
api.use("/production-orders", productionOrdersRouter);
api.use("/batches", batchesRouter);
api.use("/qc", qcRouter);
api.use("/sterilization", sterilizationRouter);
api.use("/warehouse", warehouseRouter);
api.use("/dispatch", dispatchRouter);
api.use("/traceability", traceabilityRouter);
api.use("/dashboard", dashboardRouter);
api.use("/audit", auditRouter);
api.use("/alerts", alertsRouter);

app.use("/api/v1", api);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
