import { useFetch } from "../lib/useFetch";
import { inr, dateTime } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";

interface Pay {
  id: number; payment_number: string; customer_id: number; invoice_id?: number | null;
  amount: string; method: string; status: string; reference_no?: string; created_at: string;
}

export default function Payments() {
  const state = useFetch<{ items: Pay[] }>("/payments?page_size=50");
  return (
    <div>
      <PageHeader title="Payments" subtitle="Collections and payment history" />
      <Async state={state} empty="No payments recorded.">
        {(data) => (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="th">Payment #</th><th className="th">Method</th><th className="th">Reference</th>
                  <th className="th">Status</th><th className="th text-right">Amount</th><th className="th">Date</th>
                </tr></thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="td font-medium">{p.payment_number}</td>
                      <td className="td">{p.method}</td>
                      <td className="td text-slate-500">{p.reference_no || "-"}</td>
                      <td className="td"><Badge status={p.status} /></td>
                      <td className="td text-right font-medium">{inr(p.amount)}</td>
                      <td className="td text-slate-500">{dateTime(p.created_at)}</td>
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
