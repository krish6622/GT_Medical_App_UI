import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList, Users, FileText, Wallet,
  Boxes, BarChart3, Settings, ScrollText, Bell, Menu, LogOut, ShoppingBag, UserCog,
  PanelLeftClose, PanelLeft, Sun, Moon, Search, Check, HelpCircle, Calendar, ChevronDown,
  CreditCard, UserCircle,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { api } from "../lib/api";
import { dateTime } from "../lib/format";
import { GtLogo } from "./GtLogo";

interface NavItem { to: string; label: string; icon: ReactNode; perm?: string; }

// Two strictly-separated portals. The customer (retail pharmacy) menu is kept
// deliberately simple — ordering only; the staff menu is the full ERP.
const CUSTOMER_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard size={19} /> },
  { to: "/catalogue", label: "Products", icon: <Package size={19} /> },
  { to: "/cart", label: "My Cart", icon: <ShoppingCart size={19} /> },
  { to: "/orders", label: "Orders", icon: <ClipboardList size={19} /> },
  { to: "/invoices", label: "Invoices", icon: <FileText size={19} /> },
  { to: "/outstanding", label: "Outstanding", icon: <CreditCard size={19} />, perm: "credit:read" },
  { to: "/payments", label: "Payments", icon: <Wallet size={19} />, perm: "payment:read" },
  { to: "/profile", label: "Profile", icon: <UserCircle size={19} /> },
];

const STAFF_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard size={19} /> },
  { to: "/orders", label: "Orders", icon: <ClipboardList size={19} /> },
  { to: "/catalogue", label: "Products", icon: <Package size={19} />, perm: "product:read" },
  { to: "/inventory", label: "Inventory", icon: <Boxes size={19} />, perm: "inventory:read" },
  { to: "/purchase", label: "Purchase", icon: <ShoppingBag size={19} />, perm: "inventory:read" },
  { to: "/customers", label: "Customers", icon: <Users size={19} />, perm: "customer:read" },
  { to: "/invoices", label: "Invoices", icon: <FileText size={19} />, perm: "invoice:read" },
  { to: "/payments", label: "Payments", icon: <Wallet size={19} />, perm: "payment:read" },
  { to: "/reports", label: "Reports", icon: <BarChart3 size={19} />, perm: "report:read" },
  { to: "/users", label: "Users", icon: <UserCog size={19} />, perm: "user:read" },
  { to: "/audit", label: "Audit Logs", icon: <ScrollText size={19} />, perm: "audit:read" },
  { to: "/settings", label: "Settings", icon: <Settings size={19} />, perm: "settings:read" },
];

const RANGES = ["Today", "Last 7 days", "Last 30 days", "This month", "This year"];

export function Layout({ children }: { children: ReactNode }) {
  const { me, logout, can, isCustomer } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("gtm_sidebar") === "1");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => localStorage.setItem("gtm_sidebar", collapsed ? "1" : "0"), [collapsed]);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Pick the portal by role, then drop any item the role lacks permission for.
  const items = (isCustomer ? CUSTOMER_NAV : STAFF_NAV).filter((n) => !n.perm || can(n.perm));

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ===================== Sidebar ===================== */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen shrink-0 text-navy-100 flex flex-col
        bg-gradient-to-b from-navy-700 via-navy-800 to-navy-950
        transition-[width,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)]
        ${collapsed ? "w-[84px]" : "w-[280px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`h-[72px] flex items-center border-b border-white/5 ${collapsed ? "justify-center px-0" : "px-5"}`}>
          <div className="rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm">
            <GtLogo width={collapsed ? 52 : 168} />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              title={collapsed ? n.label : undefined}
              className={({ isActive }) =>
                `nav-link relative group ${collapsed ? "justify-center" : ""} ${
                  isActive
                    ? "bg-maroon-600 text-white shadow-glow-maroon"
                    : "text-navy-200 hover:text-white hover:bg-white/8"
                }`
              }
            >
              <span className="shrink-0">{n.icon}</span>
              {!collapsed && <span className="whitespace-nowrap text-[13.5px]">{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom company card */}
        {!collapsed && (
          <div className="mx-3 mb-2 rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-maroon-400" />
              <div className="text-sm font-bold text-white">GT Medical Solutions</div>
            </div>
            <div className="text-[11px] text-navy-300 mt-1 leading-snug">
              {isCustomer ? "Retail Pharmacy Ordering Portal" : "Wholesale Distribution ERP"}
            </div>
          </div>
        )}
        <div className="p-3 pt-0">
          <button onClick={logout} title="Sign out"
            className={`nav-link w-full text-navy-200 hover:text-white hover:bg-white/8 ${collapsed ? "justify-center" : ""}`}>
            <LogOut size={19} />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-navy-950/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ===================== Main column ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] sticky top-0 z-30 glass !rounded-none border-x-0 border-t-0 flex items-center gap-3 px-4 lg:px-6">
          <button className="btn-icon lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <button className="btn-icon hidden lg:grid" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="hidden xl:block leading-tight mr-1">
            <div className="text-[13px] font-semibold text-ink">Welcome, {me?.user.full_name?.split(" ")[0]} 👋</div>
            <div className="text-[11px] text-muted">Here's what's happening today</div>
          </div>

          <div className="relative hidden sm:block flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input className="input pl-9 py-2 bg-surface/60" placeholder="Search orders, products, customers…"
              onKeyDown={(e) => { if (e.key === "Enter") navigate("/catalogue"); }} />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <DateRangePicker />
            <button className="btn-icon" title="Help"><HelpCircle size={18} /></button>
            <button className="btn-icon" onClick={toggle} title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationsBell />
            <div className="h-7 w-px bg-line mx-1" />
            <div className="flex items-center gap-2.5 pr-1">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-navy-600 to-navy-900 text-white grid place-items-center text-sm font-semibold shrink-0">
                {me?.user.full_name?.[0] ?? "?"}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-semibold text-ink truncate max-w-[140px]">{me?.user.full_name}</div>
                <div className="text-[11px] text-muted">{me?.role.replace(/_/g, " ")}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 xl:p-8 max-w-[1480px] w-full mx-auto">
          <div key={location.pathname} className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DateRangePicker() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState("Last 7 days");
  return (
    <div className="relative hidden md:block">
      <button onClick={() => setOpen((v) => !v)}
        className="btn-ghost py-2 text-sm gap-2">
        <Calendar size={15} /> {range} <ChevronDown size={14} className="text-faint" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 card p-1.5 z-40 animate-scale-in">
            {RANGES.map((r) => (
              <button key={r} onClick={() => { setRange(r); setOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-surface ${r === range ? "text-accent-600 dark:text-accent-400 font-medium" : "text-ink"}`}>
                {r}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[] | null>(null);

  async function load() {
    setOpen((v) => !v);
    if (items == null) {
      try {
        const r = await api.get("/notifications");
        setItems(r.data);
      } catch {
        setItems([]);
      }
    }
  }
  const unread = items?.filter((n) => n.status !== "READ").length ?? 0;

  return (
    <div className="relative">
      <button className="btn-icon relative" onClick={load} title="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-maroon-500 ring-2 ring-card" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 card p-0 z-40 animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="font-semibold text-ink">Notifications</span>
              <span className="chip bg-accent-500/10 text-accent-600 dark:text-accent-400">{unread} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-line">
              {items == null && <div className="p-4 text-sm text-muted">Loading…</div>}
              {items?.length === 0 && <div className="p-8 text-center text-sm text-faint">You're all caught up 🎉</div>}
              {items?.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-surface/60">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-lg bg-maroon-500/10 text-maroon-500 grid place-items-center"><Check size={14} /></span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{n.title || n.event}</div>
                      <div className="text-xs text-muted truncate">{n.body}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-faint mt-1 pl-9">{dateTime(n.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
