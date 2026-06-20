import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Stethoscope, ShieldCheck, Boxes, Receipt } from "lucide-react";
import { useAuth } from "../lib/auth";
import { apiError } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gtmedical.com");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-navy-900 text-white">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-accent-600/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center shadow-glow">
            <Stethoscope size={24} />
          </div>
          <div className="text-lg font-bold">GT Medical Solutions</div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Wholesale medical<br />ordering, <span className="text-accent-400">reimagined.</span>
          </h1>
          <p className="mt-4 text-navy-300 max-w-md leading-relaxed">
            The enterprise platform for pharmaceutical distributors — orders, GST invoicing,
            credit control and FEFO inventory in one premium workspace.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            <Feature icon={<Boxes size={18} />} title="FEFO" sub="batch control" />
            <Feature icon={<Receipt size={18} />} title="GST" sub="tax invoices" />
            <Feature icon={<ShieldCheck size={18} />} title="RBAC" sub="8 roles" />
          </div>
        </div>
        <div className="relative text-navy-500 text-xs">© {new Date().getFullYear()} GT Medical Solutions · Enterprise Edition</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="card w-full max-w-md p-8 animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl bg-accent-500 grid place-items-center text-white"><Stethoscope size={18} /></div>
            <span className="font-bold text-ink">GT Medical</span>
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted mt-1">Sign in to your account to continue</p>

          {error && <div className="mt-5 rounded-xl bg-rose-500/10 text-rose-500 text-sm px-3.5 py-2.5">{error}</div>}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button className="btn-primary w-full mt-6 py-2.5" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-sm text-muted mt-5 text-center">
            New pharmacy? <Link to="/register" className="text-accent-600 dark:text-accent-400 font-semibold">Create an account</Link>
          </p>
          <div className="mt-5 pt-4 border-t border-line text-[11px] text-faint text-center leading-relaxed">
            Demo · admin@gtmedical.com / Admin@12345<br />owner@citycare.com / Pharmacy@123
          </div>
        </form>
      </div>
    </div>
  );
}

function Feature({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="text-accent-400">{icon}</div>
      <div className="mt-2 font-bold text-white">{title}</div>
      <div className="text-[11px] text-navy-400">{sub}</div>
    </div>
  );
}
