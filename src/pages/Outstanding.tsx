import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Wallet, IndianRupee, CreditCard, AlertTriangle, FileText, Download, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { inr, date } from "../lib/format";
import { StatCard, Card, Async, PageHeader, Badge } from "../components/ui";
import type { Page, Invoice } from "../lib/types";

interface Pay {
  id: number; payment_number: string; amount: string; method: string;
  status: string; reference_no?: string; created_at: string;
}

async function downloadPdf(id: number, number: string) {
  const r = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
  const url = URL.createObjectURL(r.data as Blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${number}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

export default function Outstanding() {
  const dash = useFetch<any>("/dashboard/customer");
  const invs = useFetch<Page<Invoice>>("/invoices?page_size=500");
  const pays = useFetch<Page<Pay>>("/payments?page_size=50");

  const open = useMemo(
    () => (invs.data?.items ?? []).filter((i) => Number(i.balance_due) > 0.005),
    [invs.data],
  );
  const overdue = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return open.filter((i) => i.due_date && new Date(i.due_date) < today)
      .reduce((s, i) => s + Number(i.balance_due), 0);
  }, [open]);

  return (
    <div>
      <PageHeader title="Outstanding & Credit" subtitle="Your account balance, credit limit and pending dues"
        action={<Link to="/payments" className="btn-ghost"><Wallet size={16} /> Payment history</Link>} />

      <Async state={dash}>
        {(d) => {
          const limit = Number(d.cards.credit_limit || 0);
          const outstanding = Number(d.cards.outstanding_amount || 0);
          const avail = Number(d.cards.available_credit || 0);
          const used = limit > 0 ? Math.min(100, Math.round((outstanding / limit) * 100)) : 0;
          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Credit Limit" value={inr(limit)} tone="navy" icon={<IndianRupee size={20} />} />
                <StatCard label="Outstanding Balance" value={inr(outstanding)} tone="danger" icon={<Wallet size={20} />} />
                <StatCard label="Available Credit" value={inr(avail)} tone="success" icon={<CreditCard size={20} />} />
                <StatCard label="Overdue Amount" value={inr(overdue)} tone={overdue > 0 ? "warning" : "accent"} icon={<AlertTriangle size={20} />} hint={overdue > 0 ? "Please clear at the earliest" : "Nothing overdue"} />
              </div>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-ink">Credit Utilisation</h3>
                  <span className="text-sm text-muted">{used}% used · {inr(avail)} available</span>
                </div>
                <div className="h-3 rounded-full bg-surface overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${used > 85 ? "bg-rose-500" : used > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${used}%` }} />
                </div>
              </Card>

              {/* Outstanding invoices */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                  <h3 className="font-semibold text-ink">Outstanding Invoices</h3>
                  <Link to="/invoices" className="text-sm text-accent-600 dark:text-accent-400 font-medium inline-flex items-center gap-1">All invoices <ArrowRight size={14} /></Link>
                </div>
                <Async state={invs} empty="No invoices yet.">
                  {() => open.length === 0 ? (
                    <div className="p-10 text-center text-faint text-sm">🎉 You have no outstanding invoices.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-surface/50"><tr>
                          <th className="th">Invoice #</th><th className="th">Date</th><th className="th">Due</th>
                          <th className="th text-right">Total</th><th className="th text-right">Paid</th>
                          <th className="th text-right">Balance</th><th className="th">Status</th><th className="th"></th>
                        </tr></thead>
                        <tbody>
                          {open.map((i) => {
                            const od = i.due_date && new Date(i.due_date) < new Date();
                            return (
                              <tr key={i.id} className="row-hover">
                                <td className="td font-medium text-ink">{i.invoice_number}</td>
                                <td className="td text-muted whitespace-nowrap">{date(i.invoice_date)}</td>
                                <td className={`td whitespace-nowrap ${od ? "text-rose-500 font-medium" : "text-muted"}`}>{date(i.due_date)}</td>
                                <td className="td text-right">{inr(i.grand_total)}</td>
                                <td className="td text-right text-muted">{inr(i.amount_paid)}</td>
                                <td className="td text-right font-semibold text-ink">{inr(i.balance_due)}</td>
                                <td className="td"><Badge status={i.status} /></td>
                                <td className="td text-right">
                                  <button className="btn-icon h-8 w-8" title="Download PDF" onClick={() => downloadPdf(i.id, i.invoice_number)}><Download size={15} /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Async>
              </Card>

              {/* Recent payments */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                  <h3 className="font-semibold text-ink">Recent Payments</h3>
                  <Link to="/payments" className="text-sm text-accent-600 dark:text-accent-400 font-medium inline-flex items-center gap-1">View all <ArrowRight size={14} /></Link>
                </div>
                <Async state={pays} empty="No payments recorded yet.">
                  {(pd) => pd.items.length === 0 ? (
                    <div className="p-10 text-center text-faint text-sm">No payments recorded yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-surface/50"><tr>
                          <th className="th">Payment #</th><th className="th">Method</th><th className="th">Reference</th>
                          <th className="th">Date</th><th className="th">Status</th><th className="th text-right">Amount</th>
                        </tr></thead>
                        <tbody>
                          {pd.items.slice(0, 10).map((p) => (
                            <tr key={p.id} className="row-hover">
                              <td className="td font-medium text-ink">{p.payment_number}</td>
                              <td className="td"><span className="chip bg-accent-500/10 text-accent-600 dark:text-accent-400"><FileText size={12} /> {p.method}</span></td>
                              <td className="td text-muted">{p.reference_no || "—"}</td>
                              <td className="td text-muted whitespace-nowrap">{date(p.created_at)}</td>
                              <td className="td"><Badge status={p.status} /></td>
                              <td className="td text-right font-semibold text-emerald-600 dark:text-emerald-400">{inr(p.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Async>
              </Card>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
