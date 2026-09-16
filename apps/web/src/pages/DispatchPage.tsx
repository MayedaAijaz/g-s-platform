import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dispatchApi } from "../lib/api";
import { Truck } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "badge-gray",
    PENDING: "badge-yellow",
    DISPATCHED: "badge-blue",
    DELIVERED: "badge-green",
    RETURNED: "badge-red",
  };
  return <span className={map[status] ?? "badge-gray"}>{status}</span>;
}

export function DispatchPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["dispatch", page],
    queryFn: () => dispatchApi.list({ page, limit: 20 }),
  });
  const dispatches = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Truck size={22} /> Dispatch
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Dispatch #</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Status</th>
                <th className="table-header">Planned Date</th>
                <th className="table-header">Carrier</th>
                <th className="table-header">Tracking</th>
                <th className="table-header">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {dispatches.map((d) => {
                const dis = d as Record<string, unknown>;
                const items = (dis["items"] as unknown[]) ?? [];
                return (
                  <tr key={String(dis["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono font-semibold text-brand-600">{String(dis["dispatchNumber"])}</td>
                    <td className="table-cell font-medium">{String(dis["customerName"])}</td>
                    <td className="table-cell"><StatusBadge status={String(dis["status"])} /></td>
                    <td className="table-cell text-xs">{new Date(String(dis["plannedDispatchDate"])).toLocaleDateString()}</td>
                    <td className="table-cell">{String(dis["carrier"] ?? "—")}</td>
                    <td className="table-cell font-mono text-xs">{String(dis["trackingNumber"] ?? "—")}</td>
                    <td className="table-cell">{items.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
