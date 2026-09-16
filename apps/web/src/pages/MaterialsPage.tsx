import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { materialsApi } from "../lib/api";
import { BarChart3 } from "lucide-react";

export function MaterialsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["materials", page],
    queryFn: () => materialsApi.list({ page, limit: 20 }),
  });
  const materials = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 size={22} /> Materials
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">UoM</th>
                <th className="table-header">Reorder Point</th>
                <th className="table-header">Lots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              {materials.map((m) => {
                const mat = m as Record<string, unknown>;
                const lots = (mat["lots"] as unknown[]) ?? [];
                return (
                  <tr key={String(mat["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm font-semibold">{String(mat["code"])}</td>
                    <td className="table-cell font-medium">{String(mat["name"])}</td>
                    <td className="table-cell">
                      <span className="badge-blue">{String(mat["materialType"])}</span>
                    </td>
                    <td className="table-cell">{String(mat["unitOfMeasure"])}</td>
                    <td className="table-cell">{String(mat["reorderPoint"] ?? "—")}</td>
                    <td className="table-cell">{lots.length}</td>
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
