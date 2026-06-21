import { useState } from "react";
import { Building2, User, Mail, Phone, MapPin, ShieldCheck, FileText, CreditCard, KeyRound, Check } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useFetch } from "../lib/useFetch";
import { inr, date } from "../lib/format";
import { Card, Async, PageHeader, Badge } from "../components/ui";
import type { Customer } from "../lib/types";

export default function Profile() {
  const { me } = useAuth();
  const profile = useFetch<Customer>("/customers/me");

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your account and pharmacy details" />
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Business profile */}
        <div className="lg:col-span-2 space-y-6">
          <Async state={profile}>
            {(c) => (
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-900 text-white grid place-items-center shrink-0">
                    <Building2 size={26} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-ink leading-tight">{c.pharmacy_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-faint">{c.customer_code}</span>
                      <Badge status={c.status} />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-6">
                  <Field icon={<User size={15} />} label="Owner" value={c.owner_name} />
                  <Field icon={<Phone size={15} />} label="Mobile" value={c.mobile} />
                  <Field icon={<Mail size={15} />} label="Email" value={c.email || "—"} />
                  <Field icon={<MapPin size={15} />} label="Location" value={[c.city, c.state].filter(Boolean).join(", ") || "—"} />
                  <Field icon={<FileText size={15} />} label="GST Number" value={c.gst_number || "—"} mono />
                  <Field icon={<ShieldCheck size={15} />} label="Drug License" value={c.drug_license_number || "—"} mono />
                </div>

                <div className="border-t border-line mt-6 pt-5 grid sm:grid-cols-3 gap-4">
                  <Mini label="Credit Limit" value={inr(c.credit_limit)} tone="navy" />
                  <Mini label="Outstanding" value={inr(c.outstanding_amount)} tone="danger" />
                  <Mini label="Payment Term" value={c.payment_term?.replace(/_/g, " ") || "—"} tone="muted" />
                </div>
                <p className="text-[11px] text-faint mt-4">
                  Business details are maintained by GT Medical Solutions. To update them, contact your account manager. Member since {date(c.created_at)}.
                </p>
              </Card>
            )}
          </Async>
        </div>

        {/* Account + password */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-ink mb-4">Login Account</h3>
            <div className="space-y-3">
              <Field icon={<User size={15} />} label="Name" value={me?.user.full_name || "—"} />
              <Field icon={<Mail size={15} />} label="Email" value={me?.user.email || "—"} />
              <Field icon={<ShieldCheck size={15} />} label="Role" value={me?.role.replace(/_/g, " ") || "—"} />
            </div>
          </Card>
          <ChangePassword />
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="h-8 w-8 rounded-lg bg-surface text-muted grid place-items-center shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-faint font-semibold">{label}</div>
        <div className={`text-sm text-ink truncate ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone: "navy" | "danger" | "muted" }) {
  const c: Record<string, string> = {
    navy: "text-navy-600 dark:text-navy-300", danger: "text-rose-500", muted: "text-ink",
  };
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-[11px] uppercase tracking-wide text-faint font-semibold">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${c[tone]}`}>{value}</div>
    </div>
  );
}

function ChangePassword() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (next !== confirm) return setMsg({ ok: false, text: "New passwords do not match." });
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: cur, new_password: next });
      setMsg({ ok: true, text: "Password changed successfully." });
      setCur(""); setNext(""); setConfirm("");
    } catch (e) {
      setMsg({ ok: false, text: apiError(e) });
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-ink mb-4 flex items-center gap-2"><KeyRound size={17} /> Change Password</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" className="input" value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </div>
        {msg && (
          <div className={`rounded-xl text-sm px-3.5 py-2.5 flex items-center gap-2 ${msg.ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-500"}`}>
            {msg.ok && <Check size={15} />} {msg.text}
          </div>
        )}
        <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? "Updating…" : "Update Password"}</button>
      </form>
    </Card>
  );
}
