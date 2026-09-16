import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { traceabilityApi } from "../lib/api";
import {
  Search,
  Package,
  FlaskConical,
  Users,
  ClipboardCheck,
  Thermometer,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";

// ─── Status badge helpers ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "badge-gray",
    IN_PRODUCTION: "badge-blue",
    QC_HOLD: "badge-yellow",
    RELEASED: "badge-green",
    REJECTED: "badge-red",
    PASSED: "badge-green",
    FAILED: "badge-red",
    PENDING: "badge-yellow",
    IN_CYCLE: "badge-blue",
    DISPATCHED: "badge-blue",
    DELIVERED: "badge-green",
  };
  return <span className={map[status] ?? "badge-gray"}>{status}</span>;
}

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Icon size={16} className="text-gray-500 shrink-0" />
        <span className="font-semibold text-gray-800 text-sm flex-1">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 font-medium">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{value ?? "—"}</dd>
    </div>
  );
}

type TraceData = Record<string, unknown>;

export function TraceabilityPage() {
  const [searchInput, setSearchInput] = useState("BATCH-2024-001");
  const [query, setQuery] = useState<string | null>(null);

  const { data, isLoading, error, isFetching } = useQuery<TraceData>({
    queryKey: ["traceability", query],
    queryFn: () => traceabilityApi.getBatch({ batchNumber: query! }),
    enabled: !!query,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchInput.trim();
    if (val) setQuery(val);
  };

  const batch = data?.["batch"] as Record<string, unknown> | undefined;
  const product = data?.["product"] as Record<string, unknown> | undefined;
  const productVariant = data?.["productVariant"] as Record<string, unknown> | undefined;
  const productionOrder = data?.["productionOrder"] as Record<string, unknown> | undefined;
  const productionLine = data?.["productionLine"] as Record<string, unknown> | undefined;
  const machine = data?.["machine"] as Record<string, unknown> | undefined;
  const operators = (data?.["operators"] as Record<string, unknown>[]) ?? [];
  const materialLots = (data?.["materialLots"] as Record<string, unknown>[]) ?? [];
  const productionLogs = (data?.["productionLogs"] as Record<string, unknown>[]) ?? [];
  const qcInspections = (data?.["qcInspections"] as Record<string, unknown>[]) ?? [];
  const nonConformances = (data?.["nonConformances"] as Record<string, unknown>[]) ?? [];
  const sterilization = (data?.["sterilization"] as Record<string, unknown>[]) ?? [];
  const finishedGoods = (data?.["finishedGoods"] as Record<string, unknown>[]) ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search size={22} />
          Batch Traceability
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Full genealogy reconstruction for any production batch.
        </p>
        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-1 inline-block">
          ⚠️ SYNTHETIC DEMO DATA
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="Enter batch number (e.g. BATCH-2024-001)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Batch number"
        />
        <button type="submit" className="btn-primary" disabled={isLoading || isFetching}>
          <Search size={16} />
          {isFetching ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="card p-5 border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <XCircle size={16} />
          {(error as { message?: string }).message ?? "Batch not found"}
        </div>
      )}

      {/* Loading */}
      {isFetching && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {data && !isFetching && (
        <div className="space-y-4">
          {/* Batch summary */}
          <div className="card p-5 bg-brand-50 border-brand-200">
            <div className="flex items-center gap-3 mb-3">
              <FlaskConical size={20} className="text-brand-600" />
              <h2 className="text-lg font-bold text-brand-900">
                Batch {String(batch?.["batchNumber"] ?? "")}
              </h2>
              <StatusBadge status={String(batch?.["status"] ?? "")} />
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Planned Qty" value={String(batch?.["plannedQuantity"] ?? "—")} />
              <Field label="Produced Qty" value={String(batch?.["producedQuantity"] ?? "—")} />
              <Field label="Rejected Qty" value={String(batch?.["rejectedQuantity"] ?? "—")} />
              <Field
                label="Released At"
                value={
                  batch?.["releasedAt"]
                    ? new Date(String(batch["releasedAt"])).toLocaleDateString()
                    : "—"
                }
              />
              <Field
                label="Start"
                value={
                  batch?.["startTime"]
                    ? new Date(String(batch["startTime"])).toLocaleString()
                    : "—"
                }
              />
              <Field
                label="End"
                value={
                  batch?.["endTime"]
                    ? new Date(String(batch["endTime"])).toLocaleString()
                    : "—"
                }
              />
            </dl>
          </div>

          {/* Product */}
          <Section title="Product" icon={Package}>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Product Code" value={String(product?.["code"] ?? "—")} />
              <Field label="Product Name" value={String(product?.["name"] ?? "—")} />
              <Field label="Product Family" value={String(product?.["productFamily"] ?? "—")} />
              <Field label="SKU" value={String(productVariant?.["sku"] ?? "—")} />
              <Field label="Variant" value={String(productVariant?.["name"] ?? "—")} />
              <Field label="DRAP Reg. No." value={String(product?.["draRegistrationNo"] ?? "—")} />
            </dl>
          </Section>

          {/* Production Order & Line */}
          <Section title="Production Order & Line" icon={Building2}>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Order No." value={String(productionOrder?.["orderNumber"] ?? "—")} />
              <Field label="Planned Qty" value={String(productionOrder?.["plannedQuantity"] ?? "—")} />
              <Field label="Line" value={String(productionLine?.["name"] ?? "—")} />
              <Field label="Machine" value={String(machine?.["name"] ?? "—")} />
              <Field label="Machine Type" value={String(machine?.["machineType"] ?? "—")} />
            </dl>
          </Section>

          {/* Operators */}
          <Section title="Operators" icon={Users}>
            {operators.length === 0 ? (
              <p className="text-sm text-gray-400">No operators recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {operators.map((op) => (
                  <span key={String(op["id"])} className="badge-blue text-sm px-3 py-1">
                    {String(op["name"])} ({String(op["employeeId"] ?? op["role"] ?? "")})
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Material Lots */}
          <Section title="Material Lots & Supply Chain" icon={Package}>
            {materialLots.length === 0 ? (
              <p className="text-sm text-gray-400">No material lots recorded.</p>
            ) : (
              <div className="space-y-4">
                {materialLots.map((lot, i) => {
                  const material = lot["material"] as Record<string, unknown> | undefined;
                  const supplier = lot["supplier"] as Record<string, unknown> | undefined;
                  const pos = lot["relatedPurchaseOrders"] as Array<Record<string, unknown>> | undefined;
                  return (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {String(lot["lotNumber"] ?? "—")}
                        </span>
                        <span className="badge-gray">{String(material?.["code"] ?? "")}</span>
                      </div>
                      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Field label="Material" value={String(material?.["name"] ?? "—")} />
                        <Field label="Supplier" value={String(supplier?.["name"] ?? "—")} />
                        <Field label="Planned Qty" value={String(lot["plannedQuantity"] ?? "—")} />
                        <Field label="Actual Qty" value={String(lot["actualQuantity"] ?? "—")} />
                      </dl>
                      {pos && pos.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            Related Purchase Orders:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {pos.map((po, pi) => {
                              const poSupplier = po["supplier"] as Record<string, unknown> | undefined;
                              return (
                                <span key={pi} className="badge-blue">
                                  {String(po["poNumber"])} — {String(poSupplier?.["name"] ?? "?")}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Production Logs */}
          <Section title="Production Logs" icon={FlaskConical} defaultOpen={false}>
            {productionLogs.length === 0 ? (
              <p className="text-sm text-gray-400">No production logs.</p>
            ) : (
              <div className="space-y-2">
                {productionLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-400 text-xs w-36 shrink-0">
                      {log["logTime"]
                        ? new Date(String(log["logTime"])).toLocaleString()
                        : "—"}
                    </span>
                    <span className="badge-blue shrink-0">{String(log["eventType"])}</span>
                    <span className="text-gray-700">{String(log["description"])}</span>
                    {log["value"] && (
                      <span className="text-gray-500">
                        {String(log["value"])} {String(log["unit"] ?? "")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* QC Inspections */}
          <Section title="QC Inspections" icon={ClipboardCheck}>
            {qcInspections.length === 0 ? (
              <p className="text-sm text-gray-400">No QC inspections recorded.</p>
            ) : (
              <div className="space-y-4">
                {qcInspections.map((insp, i) => {
                  const inspector = insp["inspector"] as Record<string, unknown> | undefined;
                  const results = insp["results"] as Array<Record<string, unknown>> | undefined;
                  const template = insp["template"] as Record<string, unknown> | undefined;
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <StatusBadge status={String(insp["overallStatus"])} />
                        <span className="text-sm text-gray-700">
                          Inspector: {String(inspector?.["name"] ?? "—")}
                        </span>
                        <span className="text-sm text-gray-500">
                          Sample: {String(insp["sampleSize"] ?? "—")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Template: {String(template?.["name"] ?? "—")} v{String(template?.["version"] ?? "")}
                      </p>
                      {results && results.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-1.5 pr-4 font-medium text-gray-500">
                                  Parameter
                                </th>
                                <th className="text-left py-1.5 pr-4 font-medium text-gray-500">
                                  Actual
                                </th>
                                <th className="text-left py-1.5 font-medium text-gray-500">
                                  Result
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((r, ri) => {
                                const param = r["parameter"] as Record<string, unknown> | undefined;
                                return (
                                  <tr key={ri} className="border-b border-gray-100 last:border-0">
                                    <td className="py-1.5 pr-4 text-gray-700">
                                      {String(param?.["parameterName"] ?? "—")}
                                      {param?.["isCritical"] && (
                                        <span className="ml-1 text-red-500 text-xs">*</span>
                                      )}
                                    </td>
                                    <td className="py-1.5 pr-4 font-mono text-gray-900">
                                      {String(r["actualValue"])}
                                    </td>
                                    <td className="py-1.5">
                                      {r["passed"] ? (
                                        <CheckCircle size={14} className="text-green-500" />
                                      ) : (
                                        <XCircle size={14} className="text-red-500" />
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {insp["notes"] && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Notes: {String(insp["notes"])}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Non-Conformances */}
          {nonConformances.length > 0 && (
            <Section title={`Non-Conformances (${nonConformances.length})`} icon={AlertTriangle}>
              <div className="space-y-3">
                {nonConformances.map((ncr, i) => (
                  <div key={i} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-red">{String(ncr["severity"])}</span>
                      {ncr["disposition"] && (
                        <span className="badge-yellow">{String(ncr["disposition"])}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{String(ncr["description"])}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Sterilization */}
          <Section title="Sterilization" icon={Thermometer}>
            {sterilization.length === 0 ? (
              <p className="text-sm text-gray-400">No sterilization cycles recorded.</p>
            ) : (
              <div className="space-y-3">
                {sterilization.map((sb, i) => {
                  const cycle = sb["cycle"] as Record<string, unknown> | undefined;
                  const operator = cycle?.["operator"] as Record<string, unknown> | undefined;
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Field label="Cycle No." value={String(cycle?.["cycleNumber"] ?? "—")} />
                        <Field label="Method" value={String(cycle?.["method"] ?? "—")} />
                        <Field label="Status" value={<StatusBadge status={String(cycle?.["status"] ?? "")} />} />
                        <Field label="Operator" value={String(operator?.["name"] ?? "—")} />
                        <Field label="Loaded Qty" value={String(sb["quantityLoaded"] ?? "—")} />
                        <Field label="BI Result" value={String(cycle?.["biIndicatorResult"] ?? "—")} />
                        <Field label="CI Result" value={String(cycle?.["chemIndicatorResult"] ?? "—")} />
                      </dl>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Finished Goods & Dispatch */}
          <Section title="Finished Goods & Dispatch" icon={Truck}>
            {finishedGoods.length === 0 ? (
              <p className="text-sm text-gray-400">No finished goods recorded.</p>
            ) : (
              <div className="space-y-4">
                {finishedGoods.map((fg, i) => {
                  const location = fg["location"] as Record<string, unknown> | undefined;
                  const warehouse = location?.["warehouse"] as Record<string, unknown> | undefined;
                  const dispatchItems = (fg["dispatchItems"] as Array<Record<string, unknown>>) ?? [];
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <Field label="Lot Number" value={String(fg["lotNumber"] ?? "—")} />
                        <Field label="Quantity" value={`${String(fg["quantity"])} ${String(fg["unitOfMeasure"] ?? "")}`} />
                        <Field label="Location" value={String(location?.["name"] ?? "—")} />
                        <Field label="Warehouse" value={String(warehouse?.["name"] ?? "—")} />
                      </dl>
                      {dispatchItems.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-2">
                            Dispatch Records:
                          </p>
                          <div className="space-y-1">
                            {dispatchItems.map((di, dii) => {
                              const dispatch = di["dispatch"] as Record<string, unknown> | undefined;
                              return (
                                <div
                                  key={dii}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <span className="font-mono text-gray-800">
                                    {String(dispatch?.["dispatchNumber"] ?? "—")}
                                  </span>
                                  <StatusBadge status={String(dispatch?.["status"] ?? "")} />
                                  <span className="text-gray-600">
                                    → {String(dispatch?.["customerName"] ?? "—")}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    Qty: {String(di["quantity"] ?? "—")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* Empty state */}
      {!data && !isLoading && !error && (
        <div className="card p-10 text-center text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a batch number above to trace its genealogy.</p>
          <p className="text-xs mt-1 text-gray-300">Try: BATCH-2024-001</p>
        </div>
      )}
    </div>
  );
}
