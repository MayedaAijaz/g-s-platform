import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BatchesPage } from "./pages/BatchesPage";
import { TraceabilityPage } from "./pages/TraceabilityPage";
import { ProductsPage } from "./pages/ProductsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { ProductionOrdersPage } from "./pages/ProductionOrdersPage";
import { QCPage } from "./pages/QCPage";
import { SterilizationPage } from "./pages/SterilizationPage";
import { DispatchPage } from "./pages/DispatchPage";
import { AuditPage } from "./pages/AuditPage";
import { SuppliersPage } from "./pages/SuppliersPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/batches" element={<BatchesPage />} />
                  <Route path="/traceability" element={<TraceabilityPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/materials" element={<MaterialsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/production-orders" element={<ProductionOrdersPage />} />
                  <Route path="/qc" element={<QCPage />} />
                  <Route path="/sterilization" element={<SterilizationPage />} />
                  <Route path="/dispatch" element={<DispatchPage />} />
                  <Route path="/audit" element={<AuditPage />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
