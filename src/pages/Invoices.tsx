import { Download } from "lucide-react";
import { api } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { inr, date } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";
import type { Invoice, Page } from "../lib/types";

export default function Invoices() {
  const state = useFetch<Page<Invoice>>("/invoices?page_size=200");

  async function openPdf(inv: Invoice) {
    const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: "blob" });
    window.open(URL.createObjectURL(res.data), "_blank");
  }

  const columns: Column<Invoice>[] = [
    { key: "invoice_number", header: "Invoice #", render: (i) => <span className="font-medium text-ink">{i.invoice_number}</span> },
    { key: "invoice_date", header: "Date", value: (i) => i.invoice_date, render: (i) => <span className="text-muted">{date(i.invoice_date)}</span> },
    { key: "status", header: "Status", render: (i) => <Badge status={i.status} /> },
    { key: "grand_total", header: "Total", align: "right", value: (i) => Number(i.grand_total), render: (i) => <span className="font-semibold">{inr(i.grand_total)}</span> },
    { key: "balance_due", header: "Balance", align: "right", value: (i) => Number(i.balance_due), render: (i) => <span className={Number(i.balance_due) > 0 ? "text-rose-500 font-medium" : "text-emerald-500"}>{inr(i.balance_due)}</span> },
    { key: "_pdf", header: "", sortable: false, hideable: false, align: "right", render: (i) => (
        <button className="text-accent-600 dark:text-accent-400 inline-flex items-center gap-1 font-medium" onClick={(e) => { e.stopPropagation(); openPdf(i); }}>
          <Download size={15} /> PDF
        </button>
      ) },
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle="GST tax invoices" />
      <Async state={state} empty="No invoices yet.">
        {(data) => <DataTable columns={columns} rows={data.items} rowKey={(i) => i.id} exportName="invoices" searchPlaceholder="Search invoices…" />}
      </Async>
    </div>
  );
}
