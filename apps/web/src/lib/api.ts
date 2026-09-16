import { apiClient } from "../lib/api-client";
import type { PaginatedResponse } from "@gs-medcure/shared";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }).then((r) => r.data),
  me: () => apiClient.get("/auth/me").then((r) => r.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => apiClient.get("/dashboard").then((r) => r.data),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/products", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/products/${id}`).then((r) => r.data),
  create: (body: unknown) => apiClient.post("/products", body).then((r) => r.data),
  update: (id: string, body: unknown) =>
    apiClient.patch(`/products/${id}`, body).then((r) => r.data),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/suppliers", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/suppliers/${id}`).then((r) => r.data),
};

// ─── Materials ────────────────────────────────────────────────────────────────
export const materialsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/materials", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/materials/${id}`).then((r) => r.data),
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────
export const purchaseOrdersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/purchase-orders", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/purchase-orders/${id}`).then((r) => r.data),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryApi = {
  balances: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/inventory/balances", { params }).then((r) => r.data),
  lots: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/inventory/lots", { params }).then((r) => r.data),
  getLot: (id: string) => apiClient.get(`/inventory/lots/${id}`).then((r) => r.data),
  transactions: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/inventory/transactions", { params }).then((r) => r.data),
};

// ─── Production Orders ────────────────────────────────────────────────────────
export const productionOrdersApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/production-orders", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/production-orders/${id}`).then((r) => r.data),
};

// ─── Batches ─────────────────────────────────────────────────────────────────
export const batchesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/batches", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/batches/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch(`/batches/${id}/status`, { status, reason }).then((r) => r.data),
};

// ─── QC ──────────────────────────────────────────────────────────────────────
export const qcApi = {
  templates: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/qc/templates", { params }).then((r) => r.data),
  inspections: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/qc/inspections", { params }).then((r) => r.data),
  getInspection: (id: string) =>
    apiClient.get(`/qc/inspections/${id}`).then((r) => r.data),
  ncrs: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/qc/ncrs", { params }).then((r) => r.data),
};

// ─── Sterilization ────────────────────────────────────────────────────────────
export const sterilizationApi = {
  cycles: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/sterilization/cycles", { params }).then((r) => r.data),
  getCycle: (id: string) =>
    apiClient.get(`/sterilization/cycles/${id}`).then((r) => r.data),
};

// ─── Dispatch ────────────────────────────────────────────────────────────────
export const dispatchApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/dispatch", { params }).then((r) => r.data),
  get: (id: string) => apiClient.get(`/dispatch/${id}`).then((r) => r.data),
};

// ─── Traceability ─────────────────────────────────────────────────────────────
export const traceabilityApi = {
  getBatch: (params: { batchId?: string; batchNumber?: string }) =>
    apiClient.get("/traceability/batch", { params }).then((r) => r.data),
};

// ─── Audit ───────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/audit", { params }).then((r) => r.data),
};

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const alertsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>("/alerts", { params }).then((r) => r.data),
  markRead: (id: string) =>
    apiClient.patch(`/alerts/${id}/read`).then((r) => r.data),
};
