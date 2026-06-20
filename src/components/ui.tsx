import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { statusColor, statusDot } from "../lib/format";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  icon,
  tone = "accent",
  trend,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "accent" | "success" | "warning" | "danger" | "navy";
  trend?: number;
  hint?: string;
}) {
  const tones: Record<string, string> = {
    accent: "bg-accent-500/10 text-accent-600 dark:text-accent-400",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    navy: "bg-navy-500/10 text-navy-600 dark:text-navy-300",
  };
  const up = (trend ?? 0) >= 0;
  return (
    <div className="card p-5 group hover:shadow-pop hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        {icon && <div className={`h-11 w-11 rounded-xl grid place-items-center ${tones[tone]}`}>{icon}</div>}
        {trend !== undefined && (
          <span className={`chip ${up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-500"}`}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-ink truncate">{value}</div>
        <div className="text-sm text-muted mt-0.5">{label}</div>
        {hint && <div className="text-xs text-faint mt-1">{hint}</div>}
      </div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  return (
    <span className={`chip ${statusColor(status)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(status)}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-200 border-t-accent-500" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-9 w-full" />
      ))}
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
  if (state.loading) return <TableSkeleton />;
  if (state.error) return <div className="card p-6 text-rose-500 text-sm">{state.error}</div>;
  if (state.data == null || (Array.isArray(state.data) && state.data.length === 0))
    return (
      <div className="card p-12 text-center text-faint text-sm">
        <div className="text-4xl mb-2">📭</div>
        {empty}
      </div>
    );
  return <div className="animate-fade-in">{children(state.data)}</div>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
