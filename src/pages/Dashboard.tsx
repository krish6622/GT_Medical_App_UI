import { Link } from "react-router-dom";
import {
  Users, ShoppingCart, IndianRupee, Clock, AlertTriangle, Wallet, Package, Truck, Plus, FileText, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../lib/auth";
import { useFetch } from "../lib/useFetch";
import { inr } from "../lib/format";
import { StatCard, Async, PageHeader, Card } from "../components/ui";
import { Badge } from "../components/ui";
import type { Order, Page } from "../lib/types";

const STATUS_COLORS: Record<string, string> = {
  PLACED: "#0ea5e9", APPROVED: "#6366f1", PACKED: "#f59e0b",
  DISPATCHED: "#8b5cf6", DELIVERED: "#10b981", CANCELLED: "#ef4444", REJECTED: "#f43f5e", DRAFT: "#94a3b8",
};

const chartAxis = { fontSize: 11, fill: "rgb(var(--muted))" };

export default function Dashboard() {
  const { isStaff } = useAuth();
  return isStaff ? <AdminDashboard /> : <CustomerDashboard />;
}

function AdminDashboard() {
  const state = useFetch<any>("/dashboard/admin");
  const orders = useFetch<Page<Order>>("/orders?page_size=50");

  const dist = (() => {
    const map: Record<string, number> = {};
    (orders.data?.items ?? []).forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();
  const recent = (orders.data?.items ?? []).slice(0, 6);

  const trend = state.data?.sales_trend ?? [];
  const revTrend = trend.length >= 2 && trend[trend.length - 2].sales > 0
    ? Math.round(((trend[trend.length - 1].sales - trend[trend.length - 2].sales) / trend[trend.length - 2].sales) * 100)
    : undefined;

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time overview of operations and revenue"
        action={
          <>
            <Link to="/catalogue" className="btn-ghost"><Plus size={16} /> New Order</Link>
            <Link to="/reports" className="btn-primary"><FileText size={16} /> Reports</Link>
          </>
        }
      />
      <Async state={state}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard label="Total Orders" value={d.cards.total_orders} icon={<ShoppingCart size={20} />} tone="accent" />
              <StatCard label="Today's Revenue" value={inr(d.cards.todays_sales)} icon={<IndianRupee size={20} />} tone="success" trend={revTrend} />
              <StatCard label="Pending Orders" value={d.cards.pending_orders} icon={<Clock size={20} />} tone="warning" />
              <StatCard label="Outstanding" value={inr(d.cards.outstanding_amount)} icon={<Wallet size={20} />} tone="danger" />
              <StatCard label="Active Customers" value={d.cards.total_customers} icon={<Users size={20} />} tone="navy" />
              <StatCard label="Low Stock" value={d.cards.low_stock_items} icon={<AlertTriangle size={20} />} tone="warning" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2">
                <h3 className="font-semibold text-ink mb-4">Sales Trend · last 7 days</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" />
                    <XAxis dataKey="date" tick={chartAxis} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                    <YAxis tick={chartAxis} axisLine={false} tickLine={false} width={48} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => inr(v)} />
                    <Area type="monotone" dataKey="sales" stroke="#0ea5e9" fill="url(#sales)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-ink mb-4">Order Status</h3>
                {dist.length === 0 ? (
                  <p className="text-sm text-faint py-16 text-center">No orders yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={dist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {dist.map((e) => <Cell key={e.name} fill={STATUS_COLORS[e.name] || "#94a3b8"} />)}
                      </Pie>
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-ink">Recent Orders</h3>
                  <Link to="/orders" className="text-sm text-accent-600 dark:text-accent-400 font-medium inline-flex items-center gap-1">
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                {recent.length === 0 ? <p className="text-sm text-faint">No orders yet.</p> : (
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full">
                      <thead><tr><th className="th">Order</th><th className="th">Status</th><th className="th text-right">Total</th></tr></thead>
                      <tbody>
                        {recent.map((o) => (
                          <tr key={o.id} className="row-hover">
                            <td className="td"><Link to={`/orders/${o.id}`} className="font-medium text-ink hover:text-accent-600">{o.order_number}</Link></td>
                            <td className="td"><Badge status={o.status} /></td>
                            <td className="td text-right font-semibold">{inr(o.grand_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-ink mb-4">Top Customers</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={d.top_customers} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" horizontal={false} />
                    <XAxis type="number" tick={chartAxis} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={chartAxis} width={96} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => inr(v)} />
                    <Bar dataKey="outstanding" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
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
      <PageHeader title="My Dashboard" subtitle="Your account at a glance" action={<Link to="/catalogue" className="btn-primary"><ShoppingCart size={16} /> Browse Catalogue</Link>} />
      <Async state={state}>
        {(d) => {
          const used = Number(d.cards.credit_limit) > 0
            ? Math.min(100, Math.round((Number(d.cards.outstanding_amount) / Number(d.cards.credit_limit)) * 100)) : 0;
          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Outstanding" value={inr(d.cards.outstanding_amount)} tone="danger" icon={<Wallet size={20} />} />
                <StatCard label="Credit Limit" value={inr(d.cards.credit_limit)} tone="navy" icon={<IndianRupee size={20} />} />
                <StatCard label="Available Credit" value={inr(d.cards.available_credit)} tone="success" icon={<Package size={20} />} />
                <StatCard label="Pending Deliveries" value={d.cards.pending_deliveries} tone="warning" icon={<Truck size={20} />} />
              </div>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-ink">Credit Utilisation</h3>
                  <span className="text-sm text-muted">{used}% used</span>
                </div>
                <div className="h-3 rounded-full bg-surface overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${used > 85 ? "bg-rose-500" : used > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${used}%` }} />
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-ink">Recent Orders</h3>
                  <Link to="/orders" className="text-sm text-accent-600 dark:text-accent-400 font-medium">View all</Link>
                </div>
                {d.recent_orders.length === 0 ? <p className="text-sm text-faint">No orders yet.</p> : (
                  <table className="w-full">
                    <thead><tr><th className="th">Order</th><th className="th">Status</th><th className="th text-right">Total</th></tr></thead>
                    <tbody>
                      {d.recent_orders.map((o: any) => (
                        <tr key={o.order_number} className="row-hover">
                          <td className="td font-medium">{o.order_number}</td>
                          <td className="td"><Badge status={o.status} /></td>
                          <td className="td text-right font-semibold">{inr(o.grand_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          );
        }}
      </Async>
    </div>
  );
}

const tooltipStyle = {
  background: "rgb(var(--card))",
  border: "1px solid rgb(var(--line))",
  borderRadius: 12,
  fontSize: 12,
  color: "rgb(var(--ink))",
  boxShadow: "0 8px 24px -8px rgb(15 23 42 / 0.25)",
};
