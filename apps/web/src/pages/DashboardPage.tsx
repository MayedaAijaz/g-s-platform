import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { dashboardApi } from "../lib/api";
import {
  FlaskConical,
  ClipboardCheck,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#9ca3af",
  IN_PRODUCTION: "#3b82f6",
  QC_HOLD: "#f59e0b",
  RELEASED: "#10b981",
  REJECTED: "#ef4444",
};

function KpiCard({
  label,
  value,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: number | string | null;
  icon: React.ElementType;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    red: "text-red-600 bg-red-50",
    gray: "text-gray-600 bg-gray-50",
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${colorMap[color] ?? colorMap["blue"]}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">
          {value ?? "—"}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="card p-6 text-center text-red-600">
          Failed to load dashboard data.
        </div>
      </div>
    );
  }

  const kpis = data?.kpis ?? {};
  const batchesByStatus: Array<{ status: string; count: number }> =
    data?.batchesByStatus ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-1 inline-block">
          ⚠️ SYNTHETIC DEMO DATA — not real operational data
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Active Batches"
          value={kpis.activeBatches}
          icon={FlaskConical}
          color="blue"
        />
        <KpiCard
          label="Released Batches"
          value={kpis.releasedBatches}
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          label="QC Hold"
          value={kpis.qcHoldBatches}
          icon={Clock}
          color="yellow"
        />
        <KpiCard
          label="Rejected"
          value={kpis.rejectedBatches}
          icon={XCircle}
          color="red"
        />
        <KpiCard
          label="QC Pass Rate"
          value={kpis.qcPassRatePct != null ? `${kpis.qcPassRatePct}%` : "—"}
          icon={ClipboardCheck}
          color="green"
        />
        <KpiCard
          label="Open POs"
          value={kpis.openPOs}
          icon={ShoppingCart}
          color="blue"
        />
        <KpiCard
          label="Low Stock Items"
          value={kpis.lowStockMaterials}
          icon={AlertTriangle}
          color="yellow"
        />
        <KpiCard
          label="Unread Alerts"
          value={kpis.unreadAlerts}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Status Pie */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Batches by Status
          </h2>
          {batchesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={batchesByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {batchesByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? "#9ca3af"}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No batch data
            </div>
          )}
        </div>

        {/* Total vs KPIs bar */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Production Summary
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { name: "Total", value: kpis.totalBatches ?? 0 },
                { name: "Released", value: kpis.releasedBatches ?? 0 },
                { name: "In Prod.", value: kpis.activeBatches ?? 0 },
                { name: "QC Hold", value: kpis.qcHoldBatches ?? 0 },
                { name: "Rejected", value: kpis.rejectedBatches ?? 0 },
              ]}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
