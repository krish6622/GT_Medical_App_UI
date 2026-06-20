import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope, Boxes, Truck, ShieldCheck, TrendingUp, Sun, Moon, ArrowLeft, Mail, Lock, ArrowRight,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { api, apiError } from "../lib/api";
import { WarehouseScene } from "../components/WarehouseScene";

const REMEMBER_KEY = "gtm_remember_email";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const remembered = localStorage.getItem(REMEMBER_KEY);
  const [email, setEmail] = useState(remembered || "admin@gtmedical.com");
  const [password, setPassword] = useState("Admin@12345");
  const [remember, setRemember] = useState(!!remembered);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // forgot-password inline flow
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
      navigate("/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function sendReset(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setForgotMsg(null);
    try {
      const r = await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMsg(r.data.message);
    } catch (err) {
      setForgotMsg(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[1.85fr_1fr]">
      {/* ===== Hero (left, 65%) ===== */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white">
        <WarehouseScene className="absolute inset-0 h-full w-full" />
        {/* optional real photo override: drop /public/hero.jpg */}
        <img src="/hero.jpg" alt="" onError={(e) => ((e.currentTarget.style.display = "none"))}
          className="absolute inset-0 h-full w-full object-cover" />
        {/* navy 70% + premium gradient overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(15,23,42,0.70)" }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-950/90 via-navy-900/40 to-accent-900/30" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />

        {/* Logo top-left */}
        <div className="relative flex items-center gap-3 animate-fade-in">
          <div className="h-11 w-11 rounded-xl bg-white/95 grid place-items-center text-accent-600 shadow-glow">
            <Stethoscope size={24} />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">GT Medical Solutions</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent-300">Enterprise Distribution</div>
          </div>
        </div>

        {/* Headline + tagline */}
        <div className="relative max-w-xl animate-fade-up">
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
            The operating system for<br /><span className="text-accent-400">wholesale pharma</span> distribution.
          </h1>
          <p className="mt-5 text-lg text-navy-200 leading-relaxed">
            Connecting wholesale healthcare distribution with retail pharmacies — orders, GST
            invoicing, credit control and FEFO inventory in one premium platform.
          </p>
        </div>

        {/* Floating warehouse stat cards */}
        <div className="relative grid grid-cols-2 xl:grid-cols-4 gap-4 max-w-2xl">
          <StatCard icon={<Boxes size={18} />} value="12,400+" label="SKUs in catalogue" className="animate-float" />
          <StatCard icon={<Truck size={18} />} value="1,850" label="Pharmacies served" className="animate-float-slow" />
          <StatCard icon={<ShieldCheck size={18} />} value="99.2%" label="Fulfilment rate" className="animate-float" />
          <StatCard icon={<TrendingUp size={18} />} value="₹4.2 Cr" label="Monthly GMV" className="animate-float-slow" />
        </div>
      </div>

      {/* ===== Login panel (right, 35%) ===== */}
      <div className="relative flex flex-col min-h-screen lg:min-h-0">
        <div className="absolute top-5 right-5 z-10">
          <button onClick={toggle} className="btn-icon" title="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-[20px] bg-card/90 backdrop-blur-xl border border-line shadow-pop p-8 animate-scale-in">
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2.5 mb-7">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center text-white shadow-glow">
                <Stethoscope size={20} />
              </div>
              <div>
                <div className="font-bold text-ink leading-tight">GT Medical Solutions</div>
                <div className="text-[10px] uppercase tracking-wider text-muted">Enterprise Distribution</div>
              </div>
            </div>

            {mode === "login" ? (
              <>
                <h2 className="text-2xl font-bold text-ink tracking-tight">Welcome back</h2>
                <p className="text-sm text-muted mt-1">Sign in to your distribution workspace</p>

                {error && <div className="mt-5 rounded-xl bg-rose-500/10 text-rose-500 text-sm px-3.5 py-2.5">{error}</div>}

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div>
                    <label className="label">Email or mobile number</label>
                    <div className="relative">
                      <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                      <input className="input pl-11" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@pharmacy.com" required autoFocus />
                    </div>
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                      <input className="input pl-11" type="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-muted cursor-pointer select-none">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                        className="rounded border-line text-accent-500 focus:ring-accent-400" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => { setMode("forgot"); setForgotEmail(email); setForgotMsg(null); }}
                      className="text-accent-600 dark:text-accent-400 font-medium hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  <button disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white
                    bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500
                    shadow-glow transition-all duration-200 active:scale-[.99] disabled:opacity-60">
                    {busy ? "Signing in…" : <>Sign in <ArrowRight size={16} /></>}
                  </button>
                </form>

                <p className="text-sm text-muted mt-6 text-center">
                  New pharmacy? <Link to="/register" className="text-accent-600 dark:text-accent-400 font-semibold">Create an account</Link>
                </p>
                <div className="mt-5 pt-4 border-t border-line text-[11px] text-faint text-center leading-relaxed">
                  Demo · admin@gtmedical.com / Admin@12345<br />owner@citycare.com / Pharmacy@123
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setMode("login")} className="text-sm text-muted inline-flex items-center gap-1 mb-4 hover:text-ink">
                  <ArrowLeft size={15} /> Back to sign in
                </button>
                <h2 className="text-2xl font-bold text-ink tracking-tight">Reset password</h2>
                <p className="text-sm text-muted mt-1">We'll send a reset link to your email</p>

                {forgotMsg && <div className="mt-5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm px-3.5 py-2.5">{forgotMsg}</div>}

                <form onSubmit={sendReset} className="mt-6 space-y-4">
                  <div>
                    <label className="label">Email address</label>
                    <div className="relative">
                      <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                      <input className="input pl-11" type="email" value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)} required autoFocus />
                    </div>
                  </div>
                  <button disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white
                    bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 shadow-glow transition-all">
                    {busy ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block text-center text-[11px] text-faint pb-5">
          © {new Date().getFullYear()} GT Medical Solutions · Enterprise Edition
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, className = "" }: { icon: React.ReactNode; value: string; label: string; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 shadow-card ${className}`}>
      <div className="h-9 w-9 rounded-xl bg-accent-500/20 text-accent-300 grid place-items-center">{icon}</div>
      <div className="mt-3 text-xl font-bold text-white">{value}</div>
      <div className="text-[11px] text-navy-300">{label}</div>
    </div>
  );
}
