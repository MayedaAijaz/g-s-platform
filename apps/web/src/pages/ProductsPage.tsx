import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../lib/api";
import { Beaker } from "lucide-react";

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: () => productsApi.list({ page, limit: 20 }),
  });
  const products = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Beaker size={22} /> Products
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
                <th className="table-header">Family</th>
                <th className="table-header">DRAP Reg.</th>
                <th className="table-header">Variants</th>
                <th className="table-header">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              {products.map((p) => {
                const prod = p as Record<string, unknown>;
                const variants = (prod["variants"] as unknown[]) ?? [];
                return (
                  <tr key={String(prod["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm font-semibold">{String(prod["code"])}</td>
                    <td className="table-cell font-medium">{String(prod["name"])}</td>
                    <td className="table-cell text-gray-500">{String(prod["productFamily"] ?? "—")}</td>
                    <td className="table-cell text-xs font-mono">{String(prod["draRegistrationNo"] ?? "—")}</td>
                    <td className="table-cell">{variants.length}</td>
                    <td className="table-cell">
                      <span className={prod["isActive"] ? "badge-green" : "badge-gray"}>
                        {prod["isActive"] ? "Active" : "Inactive"}
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
