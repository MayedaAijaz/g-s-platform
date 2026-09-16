import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sterilizationApi } from "../lib/api";
import { Thermometer } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "badge-yellow",
    IN_CYCLE: "badge-blue",
    PASSED: "badge-green",
    FAILED: "badge-red",
  };
  return <span className={map[status] ?? "badge-gray"}>{status}</span>;
}

export function SterilizationPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["sterilization-cycles", page],
    queryFn: () => sterilizationApi.cycles({ page, limit: 20 }),
  });
  const cycles = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Thermometer size={22} /> Sterilization Cycles
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Cycle #</th>
                <th className="table-header">Method</th>
                <th className="table-header">Operator</th>
                <th className="table-header">Status</th>
                <th className="table-header">Batches</th>
                <th className="table-header">BI Result</th>
                <th className="table-header">Start</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {cycles.map((c) => {
                const cyc = c as Record<string, unknown>;
                const operator = cyc["operator"] as Record<string, unknown> | undefined;
                const batches = (cyc["batches"] as unknown[]) ?? [];
                return (
                  <tr key={String(cyc["id"])} className="hover:bg-gray-50">
                    <td className="table-cell font-mono font-semibold">{String(cyc["cycleNumber"])}</td>
                    <td className="table-cell">
                      <span className="badge-purple">{String(cyc["method"]).replace(/_/g, " ")}</span>
                    </td>
                    <td className="table-cell">{String(operator?.["name"] ?? "—")}</td>
                    <td className="table-cell"><StatusBadge status={String(cyc["status"])} /></td>
                    <td className="table-cell">{batches.length}</td>
                    <td className="table-cell">
                      {cyc["biIndicatorResult"] ? (
                        <span className={cyc["biIndicatorResult"] === "PASS" ? "badge-green" : "badge-red"}>
                          {String(cyc["biIndicatorResult"])}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {new Date(String(cyc["startTime"])).toLocaleDateString()}
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
