import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productionOrdersApi } from "../lib/api";
import { Factory } from "lucide-react";

export function ProductionOrdersPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["production-orders", page],
    queryFn: () => productionOrdersApi.list({ page, limit: 20 }),
  });
  const orders = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Factory size={22} /> Production Orders
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Order #</th>
                <th className="table-header">Product Variant</th>
                <th className="table-header">Line</th>
                <th className="table-header">Planned Qty</th>
                <th className="table-header">Produced</th>
                <th className="table-header">Start Date</th>
                <th className="table-header">Batches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {orders.map((o) => {
                const ord = o as Record<string, unknown>;
                const pv = ord["productVariant"] as Record<string, unknown> | undefined;
                const product = pv?.["product"] as Record<string, unknown> | undefined;
                const line = ord["productionLine"] as Record<string, unknown> | undefined;
                const batches = (ord["batches"] as unknown[]) ?? [];
                return (
                  <tr key={String(ord["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono font-semibold">{String(ord["orderNumber"])}</td>
                    <td className="table-cell">
                      <div className="text-xs text-gray-500">{String(product?.["name"] ?? "")}</div>
                      <div>{String(pv?.["name"] ?? "—")}</div>
                    </td>
                    <td className="table-cell">{String(line?.["name"] ?? "—")}</td>
                    <td className="table-cell">{Number(ord["plannedQuantity"]).toLocaleString()}</td>
                    <td className="table-cell">{Number(ord["producedQuantity"]).toLocaleString()}</td>
                    <td className="table-cell text-xs">{new Date(String(ord["plannedStartDate"])).toLocaleDateString()}</td>
                    <td className="table-cell">{batches.length}</td>
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
