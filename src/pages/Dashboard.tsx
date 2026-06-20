import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList, IndianRupee, Package, Users, Wallet, Truck, ArrowRight, ChevronRight,
  PackagePlus, UserPlus, FilePlus2, FileText, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../lib/auth";
import { useFetch } from "../lib/useFetch";
import { inr, date } from "../lib/format";
import { StatCard, Async, PageHeader, Card, Badge } from "../components/ui";

const CAT_COLORS = ["#7A0E12", "#0B2D7A", "#A61D24", "#2a4da6", "#c23740", "#4d6cc0", "#d96067"];
const chartAxis = { fontSize: 11, fill: "rgb(var(--muted))" };
const tooltipStyle = {
  background: "rgb(var(--card))", border: "1px solid rgb(var(--line))",
  borderRadius: 12, fontSize: 12, color: "rgb(var(--ink))",
  boxShadow: "0 8px 24px -8px rgb(15 23 42 / 0.25)",
};

const PAY_COLORS: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Partial: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Unpaid: "bg-rose-500/10 text-rose-500",
  Unbilled: "bg-slate-500/10 text-slate-500",
  Cancelled: "bg-slate-500/10 text-slate-500",
};

export default function Dashboard() {
  const { isStaff } = useAuth();
  return isStaff ? <AdminDashboard /> : <CustomerDashboard />;
}

function AdminDashboard() {
  const state = useFetch<any>("/dashboard/admin");
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your business performance" />
      <Async state={state}>
        {(d) => {
          const trend = d.sales_trend ?? [];
          const last = trend[trend.length - 1], prev = trend[trend.length - 2];
          const revTrend = prev && prev.sales > 0 ? Math.round(((last.sales - prev.sales) / prev.sales) * 100) : undefined;
          const ordTrend = prev && prev.orders > 0 ? Math.round(((last.orders - prev.orders) / prev.orders) * 100) : undefined;
          const c = d.cards;

          return (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Orders" value={c.total_orders.toLocaleString("en-IN")} icon={<ClipboardList size={20} />} tone="accent" trend={ordTrend} />
                <StatCard label="Total Revenue" value={inr(c.total_revenue)} icon={<IndianRupee size={20} />} tone="maroon" trend={revTrend} />
                <StatCard label="Total Products" value={c.total_products.toLocaleString("en-IN")} icon={<Package size={20} />} tone="navy" hint={`${c.low_stock_items} low on stock`} />
                <StatCard label="Active Customers" value={c.active_customers} icon={<Users size={20} />} tone="success" hint={`${c.total_customers} total`} />
              </div>

              {/* Analytics row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-ink">Order Overview</h3>
                      <p className="text-xs text-muted">Revenue across the last 7 days</p>
                    </div>
                    <span className="chip bg-maroon-500/10 text-maroon-600 dark:text-maroon-400">Today {inr(c.todays_sales)}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={270}>
                    <AreaChart data={trend} margin={{ left: -8, right: 6 }}>
                      <defs>
                        <linearGradient id="ov" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A61D24" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#A61D24" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
                      <XAxis dataKey="date" tick={chartAxis} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                      <YAxis tick={chartAxis} axisLine={false} tickLine={false} width={56} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => inr(v)} />
                      <Area type="monotone" dataKey="sales" stroke="#A61D24" fill="url(#ov)" strokeWidth={2.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                  <h3 className="font-semibold text-ink mb-1">Top Selling Categories</h3>
                  <p className="text-xs text-muted mb-2">By active product range</p>
                  {(!d.top_categories || d.top_categories.length === 0) ? (
                    <p className="text-sm text-faint py-16 text-center">No category data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={d.top_categories} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={3} stroke="none">
                          {d.top_categories.map((e: any, i: number) => <Cell key={e.name} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                        </Pie>
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>

              {/* Recent orders + quick actions */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-0 lg:col-span-2 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                    <h3 className="font-semibold text-ink">Recent Orders</h3>
                    <Link to="/orders" className="text-sm text-accent-600 dark:text-accent-400 font-medium inline-flex items-center gap-1">View all <ArrowRight size={14} /></Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-surface/50"><tr>
                        <th className="th">Order ID</th><th className="th">Customer</th><th className="th">Date</th>
                        <th className="th text-right">Amount</th><th className="th">Status</th><th className="th">Payment</th><th className="th"></th>
                      </tr></thead>
                      <tbody>
                        {(d.recent_orders ?? []).length === 0 && (
                          <tr><td className="td text-center text-faint py-8" colSpan={7}>No orders yet.</td></tr>
                        )}
                        {(d.recent_orders ?? []).map((o: any) => (
                          <tr key={o.id} className="row-hover">
                            <td className="td font-medium text-ink">{o.order_number}</td>
                            <td className="td text-muted">{o.customer_name}</td>
                            <td className="td text-muted whitespace-nowrap">{date(o.created_at)}</td>
                            <td className="td text-right font-semibold">{inr(o.grand_total)}</td>
                            <td className="td"><Badge status={o.status} /></td>
                            <td className="td"><span className={`chip ${PAY_COLORS[o.payment_status] || PAY_COLORS.Unbilled}`}>{o.payment_status}</span></td>
                            <td className="td text-right"><Link to={`/orders/${o.id}`} className="text-accent-600 dark:text-accent-400 font-medium">View</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Quick actions */}
                <Card className="p-5 h-fit">
                  <h3 className="font-semibold text-ink mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <QuickAction icon={<PackagePlus size={18} />} label="Add New Product" tone="maroon" onClick={() => navigate("/catalogue")} />
                    <QuickAction icon={<UserPlus size={18} />} label="Add New Customer" tone="accent" onClick={() => navigate("/customers")} />
                    <QuickAction icon={<FilePlus2 size={18} />} label="Create New Order" tone="navy" onClick={() => navigate("/orders")} />
                    <QuickAction icon={<FileText size={18} />} label="Generate Invoice" tone="accent" onClick={() => navigate("/invoices")} />
                    <QuickAction icon={<BarChart3 size={18} />} label="View Reports" tone="maroon" onClick={() => navigate("/reports")} />
                  </div>
                </Card>
              </div>
            </div>
          );
        }}
      </Async>
    </div>
  );
}

function QuickAction({ icon, label, tone, onClick }: { icon: React.ReactNode; label: string; tone: "maroon" | "accent" | "navy"; onClick: () => void }) {
  const tones: Record<string, string> = {
    maroon: "bg-maroon-500/10 text-maroon-600 dark:text-maroon-400",
    accent: "bg-accent-500/10 text-accent-600 dark:text-accent-400",
    navy: "bg-navy-500/10 text-navy-600 dark:text-navy-300",
  };
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-surface hover:border-accent-300 hover:shadow-soft transition-all group">
      <span className={`h-10 w-10 rounded-lg grid place-items-center ${tones[tone]}`}>{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-ink">{label}</span>
      <ChevronRight size={18} className="text-faint group-hover:text-accent-500 group-hover:translate-x-0.5 transition" />
    </button>
  );
}

function CustomerDashboard() {
  const state = useFetch<any>("/dashboard/customer");
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your account at a glance"
        action={<Link to="/catalogue" className="btn-primary"><Package size={16} /> Browse Catalogue</Link>} />
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
                <StatCard label="Pending Deliveries" value={d.cards.pending_deliveries} tone="maroon" icon={<Truck size={20} />} />
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
