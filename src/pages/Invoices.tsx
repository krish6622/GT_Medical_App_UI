import { Download } from "lucide-react";
import { api } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { inr, date } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import type { Invoice, Page } from "../lib/types";

export default function Invoices() {
  const state = useFetch<Page<Invoice>>("/invoices?page_size=50");

  async function openPdf(inv: Invoice) {
    // PDF endpoint needs the auth header → fetch as blob (via axios) then open.
    const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: "blob" });
    window.open(URL.createObjectURL(res.data), "_blank");
  }

  return (
    <div>
      <PageHeader title="Invoices" subtitle="GST tax invoices" />
      <Async state={state} empty="No invoices yet.">
        {(data) => (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="th">Invoice #</th><th className="th">Date</th><th className="th">Status</th>
                  <th className="th text-right">Total</th><th className="th text-right">Balance</th><th className="th"></th>
                </tr></thead>
                <tbody>
                  {data.items.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="td font-medium">{inv.invoice_number}</td>
                      <td className="td text-slate-500">{date(inv.invoice_date)}</td>
                      <td className="td"><Badge status={inv.status} /></td>
                      <td className="td text-right font-medium">{inr(inv.grand_total)}</td>
                      <td className="td text-right">{inr(inv.balance_due)}</td>
                      <td className="td text-right">
                        <button className="text-primary-600 inline-flex items-center gap-1" onClick={() => openPdf(inv)}>
                          <Download size={15} /> PDF
                        </button>
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
