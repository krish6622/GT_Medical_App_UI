import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useFetch } from "../lib/useFetch";
import { date } from "../lib/format";
import { Async, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";

interface Row {
  product_id: number; product_code: string; name: string;
  on_hand: number; reserved: number; available: number;
  reorder_level: number; is_low: boolean; nearest_expiry: string | null;
}

function expiryTone(d: string | null): string {
  if (!d) return "text-muted";
  const days = (new Date(d).getTime() - Date.now()) / 86400000;
  if (days < 90) return "text-rose-500 font-medium";
  if (days < 180) return "text-amber-600 dark:text-amber-400";
  return "text-muted";
}

export default function Inventory() {
  const [lowOnly, setLowOnly] = useState(false);
  const state = useFetch<Row[]>(`/inventory?low_only=${lowOnly}`, [lowOnly]);

  const columns: Column<Row>[] = [
    { key: "name", header: "Product", render: (r) => <div><div className="font-medium text-ink">{r.name}</div><div className="text-xs text-faint">{r.product_code}</div></div> },
    { key: "on_hand", header: "On hand", align: "right", value: (r) => r.on_hand },
    { key: "reserved", header: "Reserved", align: "right", value: (r) => r.reserved, render: (r) => <span className="text-muted">{r.reserved}</span> },
    { key: "available", header: "Available", align: "right", value: (r) => r.available, render: (r) => (
        <span className={`inline-flex items-center gap-1 font-semibold ${r.is_low ? "text-amber-600 dark:text-amber-400" : "text-ink"}`}>
          {r.is_low && <AlertTriangle size={13} />}{r.available}
        </span>
      ) },
    { key: "reorder_level", header: "Reorder", align: "right", value: (r) => r.reorder_level, render: (r) => <span className="text-muted">{r.reorder_level}</span> },
    { key: "nearest_expiry", header: "Nearest expiry", value: (r) => r.nearest_expiry || "", render: (r) => <span className={expiryTone(r.nearest_expiry)}>{date(r.nearest_expiry)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock levels with FEFO expiry tracking"
        action={
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only
          </label>
        } />
      <Async state={state} empty="No inventory data.">
        {(rows) => <DataTable columns={columns} rows={rows} rowKey={(r) => r.product_id} exportName="inventory" searchPlaceholder="Search products…" pageSize={12} />}
      </Async>
    </div>
  );
}
