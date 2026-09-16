import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { suppliersApi } from "../lib/api";
import { Users } from "lucide-react";

export function SuppliersPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page],
    queryFn: () => suppliersApi.list({ page, limit: 20 }),
  });
  const suppliers = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users size={22} /> Suppliers
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
                <th className="table-header">Country</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {suppliers.map((s) => {
                const sup = s as Record<string, unknown>;
                return (
                  <tr key={String(sup["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{String(sup["code"])}</td>
                    <td className="table-cell font-medium">{String(sup["name"])}</td>
                    <td className="table-cell">{String(sup["country"] ?? "—")}</td>
                    <td className="table-cell text-xs">{String(sup["contactEmail"] ?? "—")}</td>
                    <td className="table-cell">
                      <span className={sup["isApproved"] ? "badge-green" : "badge-yellow"}>
                        {sup["isApproved"] ? "Approved" : "Pending"}
                      </span>
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
