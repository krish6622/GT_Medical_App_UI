import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr, dateTime } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import type { Order } from "../lib/types";

export default function OrderDetail() {
  const { id } = useParams();
  const { can, isCustomer } = useAuth();
  const state = useFetch<Order>(`/orders/${id}`);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function act(path: string, body?: any) {
    setBusy(true); setMsg(null);
    try {
      await api.post(`/orders/${id}/${path}`, body);
      await state.reload();
    } catch (e) {
      setMsg(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  async function generateInvoice() {
    setBusy(true); setMsg(null);
    try {
      const r = await api.post(`/invoices/from-order/${id}`);
      setMsg(`Invoice ${r.data.invoice_number} generated.`);
    } catch (e) {
      setMsg(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Link to="/orders" className="text-sm text-primary-600 inline-flex items-center gap-1 mb-3">
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <Async state={state}>
        {(o) => {
          const s = o.status;
          return (
            <div className="space-y-5">
              <PageHeader
                title={o.order_number}
                subtitle={`Placed ${dateTime(o.placed_at || o.created_at)}`}
                action={<Badge status={s} />}
              />

              {msg && <div className="rounded-lg bg-primary-50 text-primary-700 text-sm px-3 py-2">{msg}</div>}

              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead><tr>
                    <th className="th">Product</th><th className="th">HSN</th>
                    <th className="th text-center">Qty</th><th className="th text-right">Rate</th>
                    <th className="th text-right">GST</th><th className="th text-right">Total</th>
                  </tr></thead>
                  <tbody>
                    {o.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="td font-medium">{it.product_name}</td>
                        <td className="td text-slate-500">{it.hsn_code}</td>
                        <td className="td text-center">{it.quantity}</td>
                        <td className="td text-right">{inr(it.unit_rate)}</td>
                        <td className="td text-right">{inr(it.line_tax)}</td>
                        <td className="td text-right font-medium">{inr(it.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="card p-4 text-sm">
                  <div className="flex gap-8">
                    <div><div className="text-slate-400">Subtotal</div><div className="font-medium">{inr(o.subtotal)}</div></div>
                    <div><div className="text-slate-400">Tax</div><div className="font-medium">{inr(o.tax_total)}</div></div>
                    <div><div className="text-slate-400">Grand Total</div><div className="font-semibold text-primary-700 text-base">{inr(o.grand_total)}</div></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {can("order:approve") && s === "PLACED" && (
                    <>
                      <button className="btn-accent" disabled={busy} onClick={() => act("approve")}>Approve</button>
                      <button className="btn-danger" disabled={busy}
                        onClick={() => act("reject", { reason: "Rejected by staff" })}>Reject</button>
                    </>
                  )}
                  {can("order:fulfil") && s === "APPROVED" && (
                    <button className="btn-primary" disabled={busy} onClick={() => act("pack")}>Mark Packed</button>
                  )}
                  {can("order:fulfil") && s === "PACKED" && (
                    <button className="btn-primary" disabled={busy} onClick={() => act("dispatch")}>Dispatch</button>
                  )}
                  {can("order:fulfil") && s === "DISPATCHED" && (
                    <button className="btn-accent" disabled={busy} onClick={() => act("deliver")}>Mark Delivered</button>
                  )}
                  {can("invoice:create") && ["DISPATCHED", "DELIVERED", "PACKED"].includes(s) && (
                    <button className="btn-ghost" disabled={busy} onClick={generateInvoice}>
                      <FileText size={16} /> Generate Invoice
                    </button>
                  )}
                  {isCustomer && ["DRAFT", "PLACED", "APPROVED"].includes(s) && (
                    <button className="btn-danger" disabled={busy} onClick={() => act("cancel")}>Cancel Order</button>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
