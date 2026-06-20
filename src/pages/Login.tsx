import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";
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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-700 text-white p-12">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white grid place-items-center text-primary-600">
            <Stethoscope size={24} />
          </div>
          <div className="text-lg font-semibold">GT Medical Solutions</div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Wholesale medical<br />ordering, simplified.
          </h1>
          <p className="mt-4 text-primary-100 max-w-md">
            Browse the catalogue, place orders, track deliveries, manage credit and download
            GST invoices — all in one secure platform for retail pharmacies.
          </p>
          <div className="mt-8 flex gap-6 text-primary-100 text-sm">
            <div><div className="text-2xl font-semibold text-white">FEFO</div>batch control</div>
            <div><div className="text-2xl font-semibold text-white">GST</div>tax invoices</div>
            <div><div className="text-2xl font-semibold text-white">RBAC</div>8 roles</div>
          </div>
        </div>
        <div className="text-primary-200 text-xs">© {new Date().getFullYear()} GT Medical Solutions</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <form onSubmit={submit} className="card w-full max-w-md p-8">
          <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1">Access your GT Medical account</p>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2">{error}</div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button className="btn-primary w-full mt-6" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-sm text-slate-500 mt-4 text-center">
            New pharmacy? <Link to="/register" className="text-primary-600 font-medium">Register here</Link>
          </p>
          <div className="mt-4 text-[11px] text-slate-400 text-center">
            Demo: admin@gtmedical.com / Admin@12345 &nbsp;·&nbsp; owner@citycare.com / Pharmacy@123
          </div>
        </form>
      </div>
    </div>
  );
}
