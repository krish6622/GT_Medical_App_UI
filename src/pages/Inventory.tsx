import { useState } from "react";
import { useFetch } from "../lib/useFetch";
import { date } from "../lib/format";
import { Async, PageHeader } from "../components/ui";

interface Row {
  product_id: number; product_code: string; name: string;
  on_hand: number; reserved: number; available: number;
  reorder_level: number; is_low: boolean; nearest_expiry: string | null;
}

export default function Inventory() {
  const [lowOnly, setLowOnly] = useState(false);
  const state = useFetch<Row[]>(`/inventory?low_only=${lowOnly}`, [lowOnly]);
  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Stock levels with FEFO expiry tracking"
        action={
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
            Low stock only
          </label>
        }
      />
      <Async state={state} empty="No inventory data.">
        {(rows) => (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="th">Product</th><th className="th text-right">On hand</th>
                  <th className="th text-right">Reserved</th><th className="th text-right">Available</th>
                  <th className="th text-right">Reorder</th><th className="th">Nearest expiry</th>
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.product_id} className={r.is_low ? "bg-amber-50/50" : ""}>
                      <td className="td">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-slate-400">{r.product_code}</div>
                      </td>
                      <td className="td text-right">{r.on_hand}</td>
                      <td className="td text-right text-slate-500">{r.reserved}</td>
                      <td className={`td text-right font-medium ${r.is_low ? "text-amber-600" : ""}`}>{r.available}</td>
                      <td className="td text-right text-slate-500">{r.reorder_level}</td>
                      <td className="td text-slate-500">{date(r.nearest_expiry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
