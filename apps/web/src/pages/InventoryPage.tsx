import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../lib/api";
import { Package } from "lucide-react";

export function InventoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["inventory-balances", page],
    queryFn: () => inventoryApi.balances({ page, limit: 20 }),
  });
  const balances = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Package size={22} /> Inventory Balances
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Material</th>
                <th className="table-header">Location</th>
                <th className="table-header">Warehouse</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              {balances.map((b) => {
                const bal = b as Record<string, unknown>;
                const material = bal["material"] as Record<string, unknown> | undefined;
                const location = bal["location"] as Record<string, unknown> | undefined;
                const warehouse = location?.["warehouse"] as Record<string, unknown> | undefined;
                return (
                  <tr key={String(bal["id"])} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium">{String(material?.["name"] ?? "—")}</div>
                      <div className="text-xs text-gray-500 font-mono">{String(material?.["code"] ?? "")}</div>
                    </td>
                    <td className="table-cell">{String(location?.["name"] ?? location?.["code"] ?? "—")}</td>
                    <td className="table-cell">{String(warehouse?.["name"] ?? "—")}</td>
                    <td className="table-cell font-semibold">
                      {String(bal["quantity"])} {String(material?.["unitOfMeasure"] ?? "")}
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {bal["updatedAt"] ? new Date(String(bal["updatedAt"])).toLocaleDateString() : "—"}
                    </td>
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
