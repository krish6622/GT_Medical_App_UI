export function inr(value: string | number | null | undefined): string {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function date(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dateTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Alpha backgrounds + mid-tone text read well in BOTH light and dark modes.
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-500/10 text-slate-500",
  PLACED: "bg-accent-500/10 text-accent-600 dark:text-accent-400",
  APPROVED: "bg-indigo-500/10 text-indigo-500",
  PACKED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DISPATCHED: "bg-violet-500/10 text-violet-500",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-rose-500/10 text-rose-500",
  REJECTED: "bg-rose-500/10 text-rose-500",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  INACTIVE: "bg-slate-500/10 text-slate-500",
  BLOCKED: "bg-rose-500/10 text-rose-500",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PARTIALLY_PAID: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ISSUED: "bg-accent-500/10 text-accent-600 dark:text-accent-400",
  SUCCESS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const STATUS_DOT: Record<string, string> = {
  PLACED: "bg-accent-500", APPROVED: "bg-indigo-500", PACKED: "bg-amber-500",
  DISPATCHED: "bg-violet-500", DELIVERED: "bg-emerald-500", CANCELLED: "bg-rose-500",
  REJECTED: "bg-rose-500", PENDING: "bg-amber-500", ACTIVE: "bg-emerald-500",
  BLOCKED: "bg-rose-500", PAID: "bg-emerald-500", DRAFT: "bg-slate-400",
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status] || "bg-slate-500/10 text-slate-500";
}

export function statusDot(status: string): string {
  return STATUS_DOT[status] || "bg-slate-400";
}
