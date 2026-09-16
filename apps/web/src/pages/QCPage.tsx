import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qcApi } from "../lib/api";
import { ClipboardCheck } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "badge-yellow",
    IN_PROGRESS: "badge-blue",
    PASSED: "badge-green",
    FAILED: "badge-red",
    CONDITIONALLY_RELEASED: "badge-purple",
  };
  return <span className={map[status] ?? "badge-gray"}>{status.replace(/_/g, " ")}</span>;
}

export function QCPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["qc-inspections", page],
    queryFn: () => qcApi.inspections({ page, limit: 20 }),
  });
  const inspections = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ClipboardCheck size={22} /> QC Inspections
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Batch</th>
                <th className="table-header">Product</th>
                <th className="table-header">Inspector</th>
                <th className="table-header">Sample</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {inspections.map((ins) => {
                const insp = ins as Record<string, unknown>;
                const batch = insp["batch"] as Record<string, unknown> | undefined;
                const po = batch?.["productionOrder"] as Record<string, unknown> | undefined;
                const pv = po?.["productVariant"] as Record<string, unknown> | undefined;
                const product = pv?.["product"] as Record<string, unknown> | undefined;
                const inspector = insp["inspector"] as Record<string, unknown> | undefined;
                return (
                  <tr key={String(insp["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm font-semibold text-brand-600">
                      {String(batch?.["batchNumber"] ?? "—")}
                    </td>
                    <td className="table-cell text-xs">{String(product?.["name"] ?? "—")} / {String(pv?.["name"] ?? "")}</td>
                    <td className="table-cell">{String(inspector?.["name"] ?? "—")}</td>
                    <td className="table-cell">{String(insp["sampleSize"] ?? "—")}</td>
                    <td className="table-cell"><StatusBadge status={String(insp["overallStatus"])} /></td>
                    <td className="table-cell text-xs text-gray-500">
                      {new Date(String(insp["inspectionDate"])).toLocaleDateString()}
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
