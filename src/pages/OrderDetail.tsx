import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr, dateTime } from "../lib/format";
import { Async, Badge, PageHeader, Card } from "../components/ui";
import type { Order } from "../lib/types";

const STEPS = ["PLACED", "APPROVED", "PACKED", "DISPATCHED", "DELIVERED"];

export default function OrderDetail() {
  const { id } = useParams();
  const { can, isCustomer } = useAuth();
  const state = useFetch<Order>(`/orders/${id}`);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function act(path: string, body?: any) {
    setBusy(true); setMsg(null);
    try { await api.post(`/orders/${id}/${path}`, body); await state.reload(); }
    catch (e) { setMsg(apiError(e)); } finally { setBusy(false); }
  }
  async function generateInvoice() {
    setBusy(true); setMsg(null);
    try { const r = await api.post(`/invoices/from-order/${id}`); setMsg(`Invoice ${r.data.invoice_number} generated.`); }
    catch (e) { setMsg(apiError(e)); } finally { setBusy(false); }
  }

  return (
    <div>
      <Link to="/orders" className="text-sm text-accent-600 dark:text-accent-400 inline-flex items-center gap-1 mb-3 font-medium">
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <Async state={state}>
        {(o) => {
          const s = o.status;
          const idx = STEPS.indexOf(s);
          return (
            <div className="space-y-5">
              <PageHeader title={o.order_number} subtitle={`Placed ${dateTime(o.placed_at || o.created_at)}`} action={<Badge status={s} />} />
              {msg && <div className="rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 text-sm px-3.5 py-2.5">{msg}</div>}

              <Card className="p-5">
                <div className="flex items-center">
                  {STEPS.map((st, i) => (
                    <div key={st} className="flex-1 flex items-center">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold shrink-0 ${i <= idx ? "bg-accent-500 text-white" : "bg-surface text-faint"}`}>{i + 1}</div>
                      {i < STEPS.length - 1 && <div className={`h-1 flex-1 ${i < idx ? "bg-accent-500" : "bg-surface"}`} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-muted">
                  {STEPS.map((st) => <span key={st}>{st[0] + st.slice(1).toLowerCase()}</span>)}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface/60"><tr>
                      <th className="th">Product</th><th className="th">HSN</th><th className="th text-center">Qty</th>
                      <th className="th text-right">Rate</th><th className="th text-right">GST</th><th className="th text-right">Total</th>
                    </tr></thead>
                    <tbody>
                      {o.items?.map((it) => (
                        <tr key={it.id} className="row-hover">
                          <td className="td font-medium">{it.product_name}</td>
                          <td className="td text-muted">{it.hsn_code}</td>
                          <td className="td text-center">{it.quantity}</td>
                          <td className="td text-right">{inr(it.unit_rate)}</td>
                          <td className="td text-right">{inr(it.line_tax)}</td>
                          <td className="td text-right font-semibold">{inr(it.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <Card className="p-4">
                  <div className="flex gap-8 text-sm">
                    <div><div className="text-muted">Subtotal</div><div className="font-semibold text-ink">{inr(o.subtotal)}</div></div>
                    <div><div className="text-muted">Tax</div><div className="font-semibold text-ink">{inr(o.tax_total)}</div></div>
                    <div><div className="text-muted">Grand Total</div><div className="font-bold text-accent-600 dark:text-accent-400 text-base">{inr(o.grand_total)}</div></div>
                  </div>
                </Card>

                <div className="flex flex-wrap gap-2">
                  {can("order:approve") && s === "PLACED" && <>
                    <button className="btn-success" disabled={busy} onClick={() => act("approve")}>Approve</button>
                    <button className="btn-danger" disabled={busy} onClick={() => act("reject", { reason: "Rejected by staff" })}>Reject</button>
                  </>}
                  {can("order:fulfil") && s === "APPROVED" && <button className="btn-primary" disabled={busy} onClick={() => act("pack")}>Mark Packed</button>}
                  {can("order:fulfil") && s === "PACKED" && <button className="btn-primary" disabled={busy} onClick={() => act("dispatch")}>Dispatch</button>}
                  {can("order:fulfil") && s === "DISPATCHED" && <button className="btn-success" disabled={busy} onClick={() => act("deliver")}>Mark Delivered</button>}
                  {can("invoice:create") && ["DISPATCHED", "DELIVERED", "PACKED"].includes(s) &&
                    <button className="btn-ghost" disabled={busy} onClick={generateInvoice}><FileText size={16} /> Generate Invoice</button>}
                  {isCustomer && ["DRAFT", "PLACED", "APPROVED"].includes(s) &&
                    <button className="btn-danger" disabled={busy} onClick={() => act("cancel")}>Cancel Order</button>}
                </div>
              </div>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
