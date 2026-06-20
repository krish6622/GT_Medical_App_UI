import { useState } from "react";
import { LayoutGrid, Table2, FileText, ArrowRight } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr, dateTime } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import type { Order, Page } from "../lib/types";

const BOARD = ["PLACED", "APPROVED", "PACKED", "DISPATCHED", "DELIVERED"];

export default function Orders() {
  const [view, setView] = useState<"table" | "board">("table");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const state = useFetch<Page<Order>>("/orders?page_size=100");
  const rows = state.data?.items ?? [];

  const columns: Column<Order>[] = [
    { key: "order_number", header: "Order #", render: (o) => <span className="font-medium text-ink">{o.order_number}</span> },
    { key: "created_at", header: "Placed", value: (o) => o.placed_at || o.created_at, render: (o) => <span className="text-muted">{dateTime(o.placed_at || o.created_at)}</span> },
    { key: "status", header: "Status", render: (o) => <Badge status={o.status} /> },
    { key: "grand_total", header: "Total", align: "right", value: (o) => Number(o.grand_total), render: (o) => <span className="font-semibold">{inr(o.grand_total)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track and manage the full order lifecycle"
        action={
          <div className="flex items-center rounded-xl border border-line bg-card p-1">
            <button className={`btn-icon ${view === "table" ? "bg-surface text-ink" : ""}`} onClick={() => setView("table")} title="Table"><Table2 size={17} /></button>
            <button className={`btn-icon ${view === "board" ? "bg-surface text-ink" : ""}`} onClick={() => setView("board")} title="Board"><LayoutGrid size={17} /></button>
          </div>
        }
      />

      <Async state={state} empty="No orders yet.">
        {() =>
          view === "table" ? (
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(o) => o.id}
              exportName="orders"
              searchPlaceholder="Search orders…"
              onRowClick={(o) => setSelectedId(o.id)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {BOARD.map((st) => {
                const col = rows.filter((o) => o.status === st);
                return (
                  <div key={st} className="bg-surface/50 rounded-xl p-3 min-h-[120px]">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <Badge status={st} />
                      <span className="text-xs font-semibold text-muted">{col.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {col.map((o) => (
                        <button key={o.id} onClick={() => setSelectedId(o.id)}
                          className="w-full text-left card p-3 hover:shadow-pop hover:-translate-y-0.5 transition-all">
                          <div className="font-medium text-ink text-sm">{o.order_number}</div>
                          <div className="text-xs text-faint mt-0.5">{dateTime(o.placed_at || o.created_at)}</div>
                          <div className="mt-2 font-semibold text-accent-600 dark:text-accent-400">{inr(o.grand_total)}</div>
                        </button>
                      ))}
                      {col.length === 0 && <div className="text-xs text-faint text-center py-3">—</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </Async>

      <OrderDrawer orderId={selectedId} onClose={() => setSelectedId(null)} onChanged={() => state.reload()} />
    </div>
  );
}

function OrderDrawer({ orderId, onClose, onChanged }: { orderId: number | null; onClose: () => void; onChanged: () => void }) {
  const { can, isCustomer } = useAuth();
  const state = useFetch<Order>(orderId ? `/orders/${orderId}` : null, [orderId]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function act(path: string, body?: any) {
    setBusy(true); setMsg(null);
    try { await api.post(`/orders/${orderId}/${path}`, body); await state.reload(); onChanged(); }
    catch (e) { setMsg(apiError(e)); } finally { setBusy(false); }
  }
  async function genInvoice() {
    setBusy(true); setMsg(null);
    try { const r = await api.post(`/invoices/from-order/${orderId}`); setMsg(`Invoice ${r.data.invoice_number} generated.`); }
    catch (e) { setMsg(apiError(e)); } finally { setBusy(false); }
  }

  const o = state.data;
  return (
    <Drawer open={orderId != null} onClose={onClose} title={o?.order_number ?? "Order"} subtitle={o ? dateTime(o.placed_at || o.created_at) : ""}>
      {!o ? <div className="skeleton h-40 w-full" /> : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge status={o.status} />
            <div className="text-right"><div className="text-xs text-muted">Grand total</div><div className="text-xl font-bold text-ink">{inr(o.grand_total)}</div></div>
          </div>

          {msg && <div className="rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 text-sm px-3.5 py-2.5">{msg}</div>}

          {/* Timeline */}
          <div className="flex items-center gap-1">
            {BOARD.map((st, i) => {
              const reached = BOARD.indexOf(o.status) >= i || ["DELIVERED"].includes(o.status);
              return (
                <div key={st} className="flex-1 flex items-center gap-1">
                  <div className={`h-2 flex-1 rounded-full ${reached ? "bg-accent-500" : "bg-surface"}`} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-faint -mt-3">
            {BOARD.map((s) => <span key={s}>{s[0] + s.slice(1).toLowerCase()}</span>)}
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface/60"><tr><th className="th">Item</th><th className="th text-center">Qty</th><th className="th text-right">Total</th></tr></thead>
              <tbody>
                {o.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="td"><div className="font-medium">{it.product_name}</div><div className="text-xs text-faint">HSN {it.hsn_code} · {inr(it.unit_rate)}</div></td>
                    <td className="td text-center">{it.quantity}</td>
                    <td className="td text-right font-medium">{inr(it.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            {can("order:approve") && o.status === "PLACED" && <>
              <button className="btn-success" disabled={busy} onClick={() => act("approve")}>Approve</button>
              <button className="btn-danger" disabled={busy} onClick={() => act("reject", { reason: "Rejected by staff" })}>Reject</button>
            </>}
            {can("order:fulfil") && o.status === "APPROVED" && <button className="btn-primary" disabled={busy} onClick={() => act("pack")}>Mark Packed</button>}
            {can("order:fulfil") && o.status === "PACKED" && <button className="btn-primary" disabled={busy} onClick={() => act("dispatch")}>Dispatch</button>}
            {can("order:fulfil") && o.status === "DISPATCHED" && <button className="btn-success" disabled={busy} onClick={() => act("deliver")}>Mark Delivered</button>}
            {can("invoice:create") && ["PACKED", "DISPATCHED", "DELIVERED"].includes(o.status) &&
              <button className="btn-ghost" disabled={busy} onClick={genInvoice}><FileText size={16} /> Generate Invoice</button>}
            {isCustomer && ["DRAFT", "PLACED", "APPROVED"].includes(o.status) &&
              <button className="btn-danger" disabled={busy} onClick={() => act("cancel")}>Cancel Order</button>}
          </div>
        </div>
      )}
    </Drawer>
  );
}
