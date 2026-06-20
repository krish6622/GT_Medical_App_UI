import { useFetch } from "../lib/useFetch";
import { inr, dateTime } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";

interface Pay {
  id: number; payment_number: string; customer_id: number; invoice_id?: number | null;
  amount: string; method: string; status: string; reference_no?: string; created_at: string;
}

export default function Payments() {
  const state = useFetch<{ items: Pay[] }>("/payments?page_size=200");
  const columns: Column<Pay>[] = [
    { key: "payment_number", header: "Payment #", render: (p) => <span className="font-medium text-ink">{p.payment_number}</span> },
    { key: "method", header: "Method", render: (p) => <span className="chip bg-accent-500/10 text-accent-600 dark:text-accent-400">{p.method}</span> },
    { key: "reference_no", header: "Reference", render: (p) => <span className="text-muted">{p.reference_no || "—"}</span> },
    { key: "status", header: "Status", render: (p) => <Badge status={p.status} /> },
    { key: "amount", header: "Amount", align: "right", value: (p) => Number(p.amount), render: (p) => <span className="font-semibold">{inr(p.amount)}</span> },
    { key: "created_at", header: "Date", value: (p) => p.created_at, render: (p) => <span className="text-muted">{dateTime(p.created_at)}</span> },
  ];
  return (
    <div>
      <PageHeader title="Payments" subtitle="Collections and payment history" />
      <Async state={state} empty="No payments recorded.">
        {(data) => <DataTable columns={columns} rows={data.items} rowKey={(p) => p.id} exportName="payments" searchPlaceholder="Search payments…" />}
      </Async>
    </div>
  );
}
