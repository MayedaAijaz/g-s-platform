import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FlaskConical,
  Search,
  Package,
  Beaker,
  ShoppingCart,
  Factory,
  ClipboardCheck,
  Thermometer,
  Truck,
  BarChart3,
  ShieldCheck,
  Users,
  Menu,
  X,
  LogOut,
  AlertTriangle,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/batches", label: "Batches", icon: FlaskConical },
  { to: "/traceability", label: "Traceability", icon: Search },
  { to: "/production-orders", label: "Production Orders", icon: Factory },
  { to: "/qc", label: "Quality Control", icon: ClipboardCheck },
  { to: "/sterilization", label: "Sterilization", icon: Thermometer },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { to: "/dispatch", label: "Dispatch", icon: Truck },
  { to: "/products", label: "Products", icon: Beaker },
  { to: "/materials", label: "Materials", icon: BarChart3 },
  { to: "/suppliers", label: "Suppliers", icon: Users },
  { to: "/audit", label: "Audit Log", icon: ShieldCheck },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-700">
          <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center text-white font-bold text-sm">
            GS
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">GS Medcure</div>
            <div className="text-xs text-gray-400 leading-tight">MFG Intelligence</div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo badge */}
        <div className="mx-3 mt-3 px-2 py-1.5 bg-yellow-900/50 border border-yellow-700 rounded text-xs text-yellow-300 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          Synthetic demo data only
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={16} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-700 p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-medium uppercase">
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white p-1 rounded"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-900"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-gray-900 text-sm">GS Medcure</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
