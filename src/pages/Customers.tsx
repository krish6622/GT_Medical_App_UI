import { useState } from "react";
import { CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr, date } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";
import type { Customer, Page } from "../lib/types";

export default function Customers() {
  const { can } = useAuth();
  const [filter, setFilter] = useState("");
  const state = useFetch<Page<Customer>>(`/customers?page_size=200${filter ? `&status=${filter}` : ""}`, [filter]);
  const [error, setError] = useState<string | null>(null);

  async function approve(c: Customer) {
    setError(null);
    try { await api.post(`/customers/${c.id}/approve`); await state.reload(); } catch (e) { setError(apiError(e)); }
  }
  async function reject(c: Customer) {
    const reason = prompt("Reason for rejection?") || "Not eligible";
    try { await api.post(`/customers/${c.id}/reject`, { reason }); await state.reload(); } catch (e) { setError(apiError(e)); }
  }
  async function setCredit(c: Customer) {
    const v = prompt(`Credit limit for ${c.pharmacy_name}`, c.credit_limit);
    if (v == null) return;
    try { await api.put(`/customers/${c.id}/credit-limit`, { credit_limit: Number(v) }); await state.reload(); } catch (e) { setError(apiError(e)); }
  }

  const columns: Column<Customer>[] = [
    { key: "pharmacy_name", header: "Pharmacy", render: (c) => (
        <div><div className="font-medium text-ink">{c.pharmacy_name}</div><div className="text-xs text-faint">{c.customer_code} · {c.owner_name}</div></div>
      ) },
    { key: "mobile", header: "Contact", value: (c) => c.mobile, render: (c) => (
        <div className="text-muted">{c.mobile}<div className="text-xs">{c.city}, {c.state}</div></div>
      ) },
    { key: "status", header: "Status", render: (c) => <Badge status={c.status} /> },
    { key: "credit_limit", header: "Credit", align: "right", value: (c) => Number(c.credit_limit), render: (c) => inr(c.credit_limit) },
    { key: "outstanding_amount", header: "Outstanding", align: "right", value: (c) => Number(c.outstanding_amount), render: (c) => <span className={Number(c.outstanding_amount) > 0 ? "text-rose-500 font-medium" : ""}>{inr(c.outstanding_amount)}</span> },
    { key: "created_at", header: "Since", value: (c) => c.created_at, render: (c) => <span className="text-muted">{date(c.created_at)}</span> },
    { key: "_actions", header: "", sortable: false, hideable: false, align: "right", render: (c) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {can("customer:approve") && c.status === "PENDING" && <>
            <button className="btn-icon h-8 w-8 hover:text-emerald-500" onClick={() => approve(c)} title="Approve"><CheckCircle2 size={17} /></button>
            <button className="btn-icon h-8 w-8 hover:text-rose-500" onClick={() => reject(c)} title="Reject"><XCircle size={17} /></button>
          </>}
          {can("credit:manage") && c.status === "ACTIVE" && <button className="btn-icon h-8 w-8 hover:text-accent-500" onClick={() => setCredit(c)} title="Set credit"><CreditCard size={16} /></button>}
        </div>
      ) },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle="Retail pharmacies and their accounts" />
      {error && <div className="rounded-xl bg-rose-500/10 text-rose-500 text-sm px-3.5 py-2.5 mb-4">{error}</div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "PENDING", "ACTIVE", "REJECTED", "BLOCKED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`chip px-3 py-1.5 ${filter === s ? "bg-accent-500 text-white" : "bg-card border border-line text-muted hover:text-ink"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <Async state={state} empty="No customers found.">
        {(data) => (
          <DataTable
            columns={columns}
            rows={data.items}
            rowKey={(c) => c.id}
            exportName="customers"
            searchPlaceholder="Search customers…"
            selectable
            bulkActions={(selected, clear) =>
              can("customer:approve") ? (
                <button className="btn-success py-1.5"
                  onClick={async () => {
                    for (const c of selected.filter((x) => x.status === "PENDING")) await api.post(`/customers/${c.id}/approve`).catch(() => {});
                    clear(); state.reload();
                  }}>
                  <CheckCircle2 size={15} /> Approve selected
                </button>
              ) : null
            }
          />
        )}
      </Async>
    </div>
  );
}
