import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Package, Store, Truck,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { api, apiError, tokens } from "../lib/api";
import { WarehouseScene } from "../components/WarehouseScene";
import { GtLogo } from "../components/GtLogo";
import warehouseUrl from "../assets/images/warehouse.jpg";

const REMEMBER_KEY = "gtm_remember_email";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const remembered = localStorage.getItem(REMEMBER_KEY);
  const [username, setUsername] = useState(remembered || "admin@gtmedical.com");
  const [password, setPassword] = useState("Admin@12345");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(!!remembered);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // inline OTP flow
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setInfo(null);
    try {
      await login(username, password);
      remember ? localStorage.setItem(REMEMBER_KEY, username) : localStorage.removeItem(REMEMBER_KEY);
      navigate("/");
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  }

  async function requestOtp() {
    setBusy(true); setError(null); setInfo(null);
    try {
      const r = await api.post("/auth/otp/request", { identifier: username });
      setOtpStep(true); setInfo(r.data.message);
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await api.post("/auth/otp/verify", { identifier: username, code: otp });
      tokens.set(r.data.access_token, r.data.refresh_token);
      navigate("/"); location.reload();
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  }

  async function forgot() {
    setError(null); setInfo(null);
    try { const r = await api.post("/auth/forgot-password", { email: username }); setInfo(r.data.message); }
    catch (err) { setError(apiError(err)); }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-navy-900">
      {/* ===================== LEFT (60%) — warehouse hero ===================== */}
      <div className="relative hidden lg:flex w-[60%] flex-col justify-between p-12 text-white overflow-hidden">
        <WarehouseScene className="absolute inset-0 h-full w-full" />
        <img src={warehouseUrl} alt="Pharmaceutical warehouse" onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(15,23,42,0.75)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/50 to-navy-900/80" />

        {/* logo top-left — white backing so the navy oval ring shows complete on the dark hero */}
        <div className="relative animate-fade-in">
          <div className="inline-block rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg">
            <GtLogo width={172} />
          </div>
        </div>

        {/* heading + tagline */}
        <div className="relative animate-fade-up">
          <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
            GT Medical<br />
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Solutions</span>
          </h1>
          <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
          <p className="mt-5 text-lg text-slate-300 max-w-md leading-relaxed">
            Connecting Wholesale Healthcare Distribution with Retail Pharmacies
          </p>

          {/* stat cards */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
            <StatCard icon={<Package size={22} />} value="10,000+" label="Products" />
            <StatCard icon={<Store size={22} />} value="500+" label="Retail Pharmacies" />
            <StatCard icon={<Truck size={22} />} value="24x7" label="Order Processing" />
          </div>
        </div>

        {/* bottom trust line */}
        <div className="relative flex items-center gap-2 text-slate-300 text-sm animate-fade-in">
          <ShieldCheck size={18} className="text-sky-400" />
          Trusted. Reliable. Always.
        </div>
      </div>

      {/* ===================== RIGHT (40%) — login card ===================== */}
      <div className="relative flex w-full lg:w-[40%] items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[520px] bg-white rounded-[24px] shadow-2xl px-8 sm:px-10 py-10 animate-fade-up">
          <div className="flex justify-center">
            <GtLogo width={150} />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 text-center tracking-tight">Welcome Back!</h2>
          <p className="mt-1.5 text-sm text-slate-500 text-center">Sign in to continue to GT Medical Solutions</p>

          {error && <div className="mt-5 rounded-xl bg-rose-50 text-rose-600 text-sm px-3.5 py-2.5">{error}</div>}
          {info && <div className="mt-5 rounded-xl bg-emerald-50 text-emerald-600 text-sm px-3.5 py-2.5">{info}</div>}

          {!otpStep ? (
            <form onSubmit={signIn} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username / Mobile Number</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Enter username or mobile number"
                    value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    type={showPw ? "text" : "password"} placeholder="Enter your password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Remember Me
                </label>
                <button type="button" onClick={forgot} className="font-medium text-blue-600 hover:underline">Forgot Password?</button>
              </div>

              <button disabled={busy}
                className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold
                bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-[.99] disabled:opacity-60">
                {busy ? "Signing in…" : <>Sign In <ArrowRight size={18} /></>}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button type="button" onClick={requestOtp} disabled={busy}
                className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                border border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 disabled:opacity-60">
                <ShieldCheck size={18} /> Sign in with OTP
              </button>

              <p className="text-sm text-slate-500 text-center pt-1">
                Don't have an account? <Link to="/register" className="font-semibold text-blue-600">Contact Admin</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Enter OTP sent to {username}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg tracking-[0.4em] text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required autoFocus />
              </div>
              <button disabled={busy}
                className="w-full h-14 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-60">
                {busy ? "Verifying…" : "Verify & Sign In"}
              </button>
              <button type="button" onClick={() => { setOtpStep(false); setOtp(""); }} className="w-full text-sm text-slate-500 hover:text-slate-700">
                Back to password sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
      <div className="h-11 w-11 rounded-full border border-white/25 grid place-items-center text-sky-300">{icon}</div>
      <div className="mt-3 text-2xl font-bold text-white leading-none">{value}</div>
      <div className="mt-1 text-xs text-slate-300">{label}</div>
    </div>
  );
}
