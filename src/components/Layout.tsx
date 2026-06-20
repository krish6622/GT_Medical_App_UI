import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList, Users,
  FileText, Wallet, Boxes, BarChart3, Settings, ScrollText, Menu, X, LogOut, Stethoscope,
} from "lucide-react";
import { useAuth } from "../lib/auth";

interface NavItem { to: string; label: string; icon: ReactNode; perm?: string; customerOnly?: boolean; staffOnly?: boolean; }

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/catalogue", label: "Catalogue", icon: <Package size={18} /> },
  { to: "/cart", label: "Cart", icon: <ShoppingCart size={18} />, customerOnly: true },
  { to: "/orders", label: "Orders", icon: <ClipboardList size={18} /> },
  { to: "/invoices", label: "Invoices", icon: <FileText size={18} /> },
  { to: "/customers", label: "Customers", icon: <Users size={18} />, perm: "customer:read" },
  { to: "/inventory", label: "Inventory", icon: <Boxes size={18} />, perm: "inventory:read" },
  { to: "/payments", label: "Payments", icon: <Wallet size={18} />, perm: "payment:read" },
  { to: "/reports", label: "Reports", icon: <BarChart3 size={18} />, perm: "report:read" },
  { to: "/audit", label: "Audit Logs", icon: <ScrollText size={18} />, perm: "audit:read" },
  { to: "/settings", label: "Settings", icon: <Settings size={18} />, perm: "settings:read" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { me, logout, can, isCustomer, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const items = NAV.filter((n) => {
    if (n.perm && !can(n.perm)) return false;
    if (n.customerOnly && !isCustomer) return false;
    if (n.staffOnly && !isStaff) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-primary-800 text-primary-50 flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-primary-700">
          <div className="h-9 w-9 rounded-lg bg-white grid place-items-center text-primary-600">
            <Stethoscope size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">GT Medical</div>
            <div className="text-[11px] text-primary-200">Wholesale Ordering</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? "bg-primary-600 text-white" : "text-primary-100 hover:bg-primary-700"
                }`
              }
            >
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary-100 hover:bg-primary-700"
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <button className="lg:hidden text-slate-600" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden sm:block text-sm text-slate-500">
            Welcome back, <span className="font-medium text-slate-700">{me?.user.full_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge bg-primary-50 text-primary-700">{me?.role.replace(/_/g, " ")}</span>
            <div className="h-9 w-9 rounded-full bg-primary-500 text-white grid place-items-center text-sm font-medium">
              {me?.user.full_name?.[0] ?? "?"}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
