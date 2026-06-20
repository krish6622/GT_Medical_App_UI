import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { inr } from "../lib/format";
import { Async, PageHeader } from "../components/ui";
import type { Cart as CartT } from "../lib/types";

export default function Cart() {
  const state = useFetch<CartT>("/cart");
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setQty(itemId: number, quantity: number) {
    const r = await api.put(`/cart/items/${itemId}`, { product_id: 0, quantity });
    state.setData(r.data);
  }
  async function remove(itemId: number) {
    const r = await api.delete(`/cart/items/${itemId}`);
    state.setData(r.data);
  }
  async function placeOrder() {
    setBusy(true); setError(null);
    try {
      const r = await api.post("/orders", { notes: "" });
      navigate(`/orders/${r.data.id}`);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="My Cart" subtitle="Review items before placing your order" />
      {error && <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2 mb-4">{error}</div>}
      <Async state={state}>
        {(cart) =>
          cart.items.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <ShoppingCart size={40} className="mx-auto mb-3 text-slate-300" />
              Your cart is empty.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 card overflow-hidden">
                <table className="w-full">
                  <thead><tr>
                    <th className="th">Product</th><th className="th">Rate</th>
                    <th className="th text-center">Qty</th><th className="th text-right">Total</th><th className="th"></th>
                  </tr></thead>
                  <tbody>
                    {cart.items.map((it) => (
                      <tr key={it.id}>
                        <td className="td">
                          <div className="font-medium text-slate-800">{it.product_name}</div>
                          <div className="text-xs text-slate-400">{it.available_stock} in stock · GST {it.gst_percent}%</div>
                        </td>
                        <td className="td">{inr(it.unit_rate)}</td>
                        <td className="td">
                          <div className="flex items-center justify-center gap-2">
                            <button className="btn-ghost p-1" onClick={() => setQty(it.id, Math.max(1, it.quantity - 1))}><Minus size={14} /></button>
                            <span className="w-8 text-center">{it.quantity}</span>
                            <button className="btn-ghost p-1" onClick={() => setQty(it.id, it.quantity + 1)}><Plus size={14} /></button>
                          </div>
                        </td>
                        <td className="td text-right font-medium">{inr(it.line_total)}</td>
                        <td className="td text-right">
                          <button className="text-rose-500 hover:text-rose-600" onClick={() => remove(it.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card p-5 h-fit">
                <h3 className="font-semibold text-slate-700 mb-4">Order Summary</h3>
                <Row label="Subtotal" value={inr(cart.subtotal)} />
                <Row label="GST" value={inr(cart.tax_total)} />
                <div className="border-t border-slate-100 my-3" />
                <Row label="Grand Total" value={inr(cart.grand_total)} bold />
                <button className="btn-primary w-full mt-5" onClick={placeOrder} disabled={busy}>
                  {busy ? "Placing…" : "Place Order"}
                </button>
              </div>
            </div>
          )
        }
      </Async>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? "font-semibold text-slate-800 text-base" : "text-slate-600"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
