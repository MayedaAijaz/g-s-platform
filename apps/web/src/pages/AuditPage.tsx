import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../lib/api";
import { ShieldCheck } from "lucide-react";

export function AuditPage() {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["audit", page],
    queryFn: () => auditApi.list({ page, limit: 30 }),
  });
  const logs = (data as { data?: unknown[] } | undefined)?.data ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ShieldCheck size={22} /> Audit Log
      </h1>
      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 inline-block">
        ⚠️ Synthetic demo data
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Time</th>
                <th className="table-header">User</th>
                <th className="table-header">Action</th>
                <th className="table-header">Entity Type</th>
                <th className="table-header">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                ))}</tr>
              ))}
              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-gray-400 py-8">
                    No audit log entries found. Entries appear after state changes.
                  </td>
                </tr>
              )}
              {logs.map((l) => {
                const log = l as Record<string, unknown>;
                const user = log["user"] as Record<string, unknown> | undefined;
                return (
                  <tr key={String(log["id"])} className="hover:bg-gray-50">
                    <td className="table-cell text-xs text-gray-500">
                      {new Date(String(log["createdAt"])).toLocaleString()}
                    </td>
                    <td className="table-cell text-xs">
                      {String(user?.["email"] ?? log["userEmail"] ?? "—")}
                    </td>
                    <td className="table-cell">
                      <span className="badge-blue">{String(log["action"])}</span>
                    </td>
                    <td className="table-cell text-xs">{String(log["entityType"])}</td>
                    <td className="table-cell font-mono text-xs text-gray-400">
                      {String(log["entityId"]).slice(0, 8)}…
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
