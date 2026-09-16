import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { purchaseOrdersApi } from "../lib/api";
import { ShoppingCart } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "badge-gray",
    SUBMITTED: "badge-blue",
    PARTIALLY_RECEIVED: "badge-yellow",
    RECEIVED: "badge-green",
    CANCELLED: "badge-red",
  };
  return <span className={map[status] ?? "badge-gray"}>{status.replace(/_/g, " ")}</span>;
}

export function PurchaseOrdersPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders", page],
    queryFn: () => purchaseOrdersApi.list({ page, limit: 20 }),
  });
  const orders = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart size={22} /> Purchase Orders
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">PO Number</th>
                <th className="table-header">Supplier</th>
                <th className="table-header">Status</th>
                <th className="table-header">Order Date</th>
                <th className="table-header">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {orders.map((o) => {
                const ord = o as Record<string, unknown>;
                const supplier = ord["supplier"] as Record<string, unknown> | undefined;
                const items = (ord["items"] as unknown[]) ?? [];
                return (
                  <tr key={String(ord["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono font-semibold text-brand-600">{String(ord["poNumber"])}</td>
                    <td className="table-cell">{String(supplier?.["name"] ?? "—")}</td>
                    <td className="table-cell"><StatusBadge status={String(ord["status"])} /></td>
                    <td className="table-cell text-xs">{new Date(String(ord["orderDate"])).toLocaleDateString()}</td>
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
