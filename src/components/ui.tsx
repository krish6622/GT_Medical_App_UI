import { ReactNode } from "react";
import { statusColor } from "../lib/format";

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "primary" | "accent" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-accent-50 text-accent-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      {icon && <div className={`h-12 w-12 rounded-lg grid place-items-center ${tones[tone]}`}>{icon}</div>}
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-slate-800 truncate">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  return <span className={`badge ${statusColor(status)}`}>{status.replace(/_/g, " ")}</span>;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
    </div>
  );
}

export function Async<T>({
  state,
  children,
  empty = "No records found.",
}: {
  state: { loading: boolean; error: string | null; data: T | null };
  children: (data: T) => ReactNode;
  empty?: string;
}) {
  if (state.loading) return <Spinner />;
  if (state.error)
    return <div className="card p-6 text-rose-600 text-sm">{state.error}</div>;
  if (state.data == null || (Array.isArray(state.data) && state.data.length === 0))
    return <div className="card p-8 text-center text-slate-400 text-sm">{empty}</div>;
  return <>{children(state.data)}</>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
