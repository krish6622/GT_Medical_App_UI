import {
  Users, ShoppingCart, IndianRupee, Clock, AlertTriangle, Wallet, Package, Truck,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { useAuth } from "../lib/auth";
import { useFetch } from "../lib/useFetch";
import { inr } from "../lib/format";
import { StatCard, Async, PageHeader } from "../components/ui";

export default function Dashboard() {
  const { isStaff } = useAuth();
  return isStaff ? <AdminDashboard /> : <CustomerDashboard />;
}

function AdminDashboard() {
  const state = useFetch<any>("/dashboard/admin");
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Operational overview" />
      <Async state={state}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Total Customers" value={d.cards.total_customers} icon={<Users size={22} />} />
              <StatCard label="Total Orders" value={d.cards.total_orders} icon={<ShoppingCart size={22} />} />
              <StatCard label="Today's Sales" value={inr(d.cards.todays_sales)} tone="accent" icon={<IndianRupee size={22} />} />
              <StatCard label="Pending Orders" value={d.cards.pending_orders} tone="amber" icon={<Clock size={22} />} />
              <StatCard label="Outstanding" value={inr(d.cards.outstanding_amount)} tone="rose" icon={<Wallet size={22} />} />
              <StatCard label="Low Stock Items" value={d.cards.low_stock_items} tone="amber" icon={<AlertTriangle size={22} />} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-5">
                <h3 className="font-semibold text-slate-700 mb-4">Sales Trend (7 days)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={d.sales_trend}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1565C0" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#1565C0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => inr(v)} />
                    <Area type="monotone" dataKey="sales" stroke="#1565C0" fill="url(#g)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-slate-700 mb-4">Top Customers (Outstanding)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={d.top_customers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip formatter={(v: any) => inr(v)} />
                    <Bar dataKey="outstanding" fill="#1f9d52" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}

function CustomerDashboard() {
  const state = useFetch<any>("/dashboard/customer");
  return (
    <div>
      <PageHeader title="My Dashboard" subtitle="Your account at a glance" />
      <Async state={state}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Outstanding" value={inr(d.cards.outstanding_amount)} tone="rose" icon={<Wallet size={22} />} />
              <StatCard label="Credit Limit" value={inr(d.cards.credit_limit)} icon={<IndianRupee size={22} />} />
              <StatCard label="Available Credit" value={inr(d.cards.available_credit)} tone="accent" icon={<Package size={22} />} />
              <StatCard label="Pending Deliveries" value={d.cards.pending_deliveries} tone="amber" icon={<Truck size={22} />} />
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Recent Orders</h3>
              {d.recent_orders.length === 0 ? (
                <p className="text-sm text-slate-400">No orders yet.</p>
              ) : (
                <table className="w-full">
                  <thead><tr>
                    <th className="th">Order</th><th className="th">Status</th><th className="th text-right">Total</th>
                  </tr></thead>
                  <tbody>
                    {d.recent_orders.map((o: any) => (
                      <tr key={o.order_number}>
                        <td className="td font-medium">{o.order_number}</td>
                        <td className="td">{o.status}</td>
                        <td className="td text-right">{inr(o.grand_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
