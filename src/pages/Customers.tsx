import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr, date } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import type { Customer, Page } from "../lib/types";

export default function Customers() {
  const { can } = useAuth();
  const [filter, setFilter] = useState("");
  const state = useFetch<Page<Customer>>(`/customers?page_size=50${filter ? `&status=${filter}` : ""}`, [filter]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve(c: Customer) {
    setBusyId(c.id); setError(null);
    try { await api.post(`/customers/${c.id}/approve`); await state.reload(); }
    catch (e) { setError(apiError(e)); } finally { setBusyId(null); }
  }
  async function reject(c: Customer) {
    const reason = prompt("Reason for rejection?") || "Not eligible";
    setBusyId(c.id); setError(null);
    try { await api.post(`/customers/${c.id}/reject`, { reason }); await state.reload(); }
    catch (e) { setError(apiError(e)); } finally { setBusyId(null); }
  }
  async function setCredit(c: Customer) {
    const v = prompt(`Credit limit for ${c.pharmacy_name}`, c.credit_limit);
    if (v == null) return;
    setBusyId(c.id);
    try { await api.put(`/customers/${c.id}/credit-limit`, { credit_limit: Number(v) }); await state.reload(); }
    catch (e) { setError(apiError(e)); } finally { setBusyId(null); }
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle="Retail pharmacies and their accounts" />
      {error && <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2 mb-4">{error}</div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "PENDING", "ACTIVE", "REJECTED", "BLOCKED"].map((s) => (
          <button key={s}
            onClick={() => setFilter(s)}
            className={`badge px-3 py-1 ${filter === s ? "bg-primary-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <Async state={state} empty="No customers found.">
        {(data) => (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="th">Pharmacy</th><th className="th">Contact</th><th className="th">Status</th>
                  <th className="th text-right">Credit</th><th className="th text-right">Outstanding</th>
                  <th className="th">Since</th><th className="th"></th>
                </tr></thead>
                <tbody>
                  {data.items.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="td">
                        <div className="font-medium text-slate-800">{c.pharmacy_name}</div>
                        <div className="text-xs text-slate-400">{c.customer_code} · {c.owner_name}</div>
                      </td>
                      <td className="td text-slate-500">{c.mobile}<div className="text-xs">{c.city}, {c.state}</div></td>
                      <td className="td"><Badge status={c.status} /></td>
                      <td className="td text-right">{inr(c.credit_limit)}</td>
                      <td className="td text-right">{inr(c.outstanding_amount)}</td>
                      <td className="td text-slate-500">{date(c.created_at)}</td>
                      <td className="td text-right whitespace-nowrap">
                        {can("customer:approve") && c.status === "PENDING" && (
                          <span className="inline-flex gap-2">
                            <button className="text-accent-600" disabled={busyId === c.id} onClick={() => approve(c)} title="Approve"><CheckCircle2 size={18} /></button>
                            <button className="text-rose-500" disabled={busyId === c.id} onClick={() => reject(c)} title="Reject"><XCircle size={18} /></button>
                          </span>
                        )}
                        {can("credit:manage") && c.status === "ACTIVE" && (
                          <button className="text-primary-600 text-xs font-medium" onClick={() => setCredit(c)}>Set credit</button>
                        )}
                      </td>
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
