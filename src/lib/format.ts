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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PLACED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-indigo-100 text-indigo-700",
  PACKED: "bg-amber-100 text-amber-700",
  DISPATCHED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-accent-100 text-accent-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  REJECTED: "bg-rose-100 text-rose-700",
  PENDING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-accent-100 text-accent-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  BLOCKED: "bg-rose-100 text-rose-700",
  PAID: "bg-accent-100 text-accent-700",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  ISSUED: "bg-blue-100 text-blue-700",
  SUCCESS: "bg-accent-100 text-accent-700",
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status] || "bg-slate-100 text-slate-600";
}
