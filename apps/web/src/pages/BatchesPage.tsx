import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { batchesApi } from "../lib/api";
import { FlaskConical, ChevronLeft, ChevronRight } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "badge-gray",
    IN_PRODUCTION: "badge-blue",
    QC_HOLD: "badge-yellow",
    RELEASED: "badge-green",
    REJECTED: "badge-red",
  };
  return <span className={map[status] ?? "badge-gray"}>{status}</span>;
}

type Batch = {
  id: string;
  batchNumber: string;
  status: string;
  plannedQuantity: number;
  producedQuantity: number;
  startTime: string | null;
  createdAt: string;
  productionOrder?: {
    orderNumber: string;
    productVariant?: {
      name: string;
      product?: { name: string };
    };
  };
  machine?: { name: string };
};

export function BatchesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["batches", page, search],
    queryFn: () => batchesApi.list({ page, limit: 20, search: search || undefined }),
  });

  const batches: Batch[] = (data as { data?: Batch[] } | undefined)?.data ?? [];
  const meta = (data as { meta?: { totalPages: number; total: number } } | undefined)?.meta;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical size={22} />
            Production Batches
          </h1>
          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 mt-1 inline-block">
            ⚠️ Synthetic demo data
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <input
            type="text"
            className="input w-52"
            placeholder="Search batch number…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Batch #</th>
                <th className="table-header">Product</th>
                <th className="table-header">Status</th>
                <th className="table-header">Planned</th>
                <th className="table-header">Produced</th>
                <th className="table-header">Start</th>
                <th className="table-header">Machine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              {error && (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-red-500 py-8">
                    Failed to load batches.
                  </td>
                </tr>
              )}
              {!isLoading && batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-gray-400 py-8">
                    No batches found.
                  </td>
                </tr>
              )}
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono font-semibold text-brand-600">
                    {batch.batchNumber}
                  </td>
                  <td className="table-cell">
                    <div className="text-xs text-gray-500">
                      {batch.productionOrder?.productVariant?.product?.name}
                    </div>
                    <div>{batch.productionOrder?.productVariant?.name}</div>
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={batch.status} />
                  </td>
                  <td className="table-cell">{batch.plannedQuantity.toLocaleString()}</td>
                  <td className="table-cell">{batch.producedQuantity.toLocaleString()}</td>
                  <td className="table-cell text-xs text-gray-500">
                    {batch.startTime
                      ? new Date(batch.startTime).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="table-cell text-xs">{batch.machine?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {meta.total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-2 py-1 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-gray-700">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="btn-secondary px-2 py-1 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
