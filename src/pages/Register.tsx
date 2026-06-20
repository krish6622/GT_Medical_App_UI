import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { api, apiError } from "../lib/api";
import { GtLogo } from "../components/GtLogo";

export default function Register() {
  const [form, setForm] = useState({
    pharmacy_name: "", owner_name: "", mobile: "", email: "", password: "",
    gst_number: "", drug_license_number: "", address: "", city: "", state: "Karnataka", pincode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/register-pharmacy", form);
      setDone(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="min-h-screen grid place-items-center bg-bg p-6">
        <div className="card max-w-md p-8 text-center animate-scale-in">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 grid place-items-center mx-auto">
            <CheckCircle2 className="text-emerald-500" size={36} />
          </div>
          <h2 className="text-xl font-bold mt-4 text-ink">Registration received</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            Your pharmacy account is pending approval by GT Medical. You'll be able to place orders
            once an administrator activates your account.
          </p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">Back to sign in</Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg py-10 px-6">
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="flex items-center gap-4 mb-6">
          <GtLogo width={140} />
          <div>
            <div className="font-bold text-lg text-ink">Pharmacy Registration</div>
            <div className="text-xs text-muted">Join the GT Medical wholesale network</div>
          </div>
        </div>

        <form onSubmit={submit} className="card p-8 grid sm:grid-cols-2 gap-4">
          {error && <div className="sm:col-span-2 rounded-xl bg-rose-500/10 text-rose-500 text-sm px-3.5 py-2.5">{error}</div>}
          <Field label="Pharmacy Name *" value={form.pharmacy_name} onChange={set("pharmacy_name")} required />
          <Field label="Owner Name *" value={form.owner_name} onChange={set("owner_name")} required />
          <Field label="Mobile *" value={form.mobile} onChange={set("mobile")} required />
          <Field label="Email *" type="email" value={form.email} onChange={set("email")} required />
          <Field label="Password *" type="password" value={form.password} onChange={set("password")} required />
          <Field label="GST Number" value={form.gst_number} onChange={set("gst_number")} />
          <Field label="Drug License No." value={form.drug_license_number} onChange={set("drug_license_number")} />
          <Field label="City" value={form.city} onChange={set("city")} />
          <Field label="State" value={form.state} onChange={set("state")} />
          <Field label="Pincode" value={form.pincode} onChange={set("pincode")} />
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <textarea className="input" rows={2} value={form.address} onChange={set("address")} />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between mt-2">
            <Link to="/login" className="text-sm text-accent-600 dark:text-accent-400 font-medium">Already registered? Sign in</Link>
            <button className="btn-primary" disabled={busy}>{busy ? "Submitting…" : "Register"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
