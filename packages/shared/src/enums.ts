// ─── Domain Enumerations ──────────────────────────────────────────────────────

export const UserRole = {
  ADMIN: "ADMIN",
  PRODUCTION_MANAGER: "PRODUCTION_MANAGER",
  PRODUCTION_OPERATOR: "PRODUCTION_OPERATOR",
  QC_MANAGER: "QC_MANAGER",
  QC_INSPECTOR: "QC_INSPECTOR",
  WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
  WAREHOUSE_OPERATOR: "WAREHOUSE_OPERATOR",
  PROCUREMENT_OFFICER: "PROCUREMENT_OFFICER",
  STERILIZATION_OPERATOR: "STERILIZATION_OPERATOR",
  VIEWER: "VIEWER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const BatchStatus = {
  DRAFT: "DRAFT",
  IN_PRODUCTION: "IN_PRODUCTION",
  QC_HOLD: "QC_HOLD",
  RELEASED: "RELEASED",
  REJECTED: "REJECTED",
} as const;
export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus];

export const PurchaseOrderStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;
export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export const InventoryTransactionType = {
  GOODS_RECEIPT: "GOODS_RECEIPT",
  BATCH_CONSUMPTION: "BATCH_CONSUMPTION",
  ADJUSTMENT: "ADJUSTMENT",
  TRANSFER: "TRANSFER",
  RETURN: "RETURN",
  SCRAP: "SCRAP",
} as const;
export type InventoryTransactionType =
  (typeof InventoryTransactionType)[keyof typeof InventoryTransactionType];

export const QCStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  PASSED: "PASSED",
  FAILED: "FAILED",
  CONDITIONALLY_RELEASED: "CONDITIONALLY_RELEASED",
} as const;
export type QCStatus = (typeof QCStatus)[keyof typeof QCStatus];

export const SterilizationMethod = {
  ETHYLENE_OXIDE: "ETHYLENE_OXIDE",
  GAMMA_IRRADIATION: "GAMMA_IRRADIATION",
  STEAM_AUTOCLAVE: "STEAM_AUTOCLAVE",
  DRY_HEAT: "DRY_HEAT",
  E_BEAM: "E_BEAM",
} as const;
export type SterilizationMethod =
  (typeof SterilizationMethod)[keyof typeof SterilizationMethod];

export const SterilizationStatus = {
  PENDING: "PENDING",
  IN_CYCLE: "IN_CYCLE",
  PASSED: "PASSED",
  FAILED: "FAILED",
} as const;
export type SterilizationStatus =
  (typeof SterilizationStatus)[keyof typeof SterilizationStatus];

export const DispatchStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  DISPATCHED: "DISPATCHED",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
} as const;
export type DispatchStatus =
  (typeof DispatchStatus)[keyof typeof DispatchStatus];

export const AlertSeverity = {
  INFO: "INFO",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const MachineStatus = {
  OPERATIONAL: "OPERATIONAL",
  MAINTENANCE: "MAINTENANCE",
  BREAKDOWN: "BREAKDOWN",
  IDLE: "IDLE",
} as const;
export type MachineStatus = (typeof MachineStatus)[keyof typeof MachineStatus];
