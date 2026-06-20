import { Link } from "react-router-dom";
import { useFetch } from "../lib/useFetch";
import { inr, dateTime } from "../lib/format";
import { Async, Badge, PageHeader } from "../components/ui";
import type { Order, Page } from "../lib/types";

export default function Orders() {
  const state = useFetch<Page<Order>>("/orders?page_size=50");
  return (
    <div>
      <PageHeader title="Orders" subtitle="All orders and their fulfilment status" />
      <Async state={state} empty="No orders yet.">
        {(data) => (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="th">Order #</th><th className="th">Placed</th>
                  <th className="th">Status</th><th className="th text-right">Total</th><th className="th"></th>
                </tr></thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="td font-medium text-slate-800">{o.order_number}</td>
                      <td className="td text-slate-500">{dateTime(o.placed_at || o.created_at)}</td>
                      <td className="td"><Badge status={o.status} /></td>
                      <td className="td text-right font-medium">{inr(o.grand_total)}</td>
                      <td className="td text-right">
                        <Link to={`/orders/${o.id}`} className="text-primary-600 font-medium">View</Link>
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
