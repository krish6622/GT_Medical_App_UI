import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CreditCard, Smartphone, Landmark, Wallet, ShieldCheck,
  CheckCircle2, XCircle, Download, ShoppingBag, Loader2, Lock, Building2, Check,
  Star, IndianRupee, RefreshCw, AlertTriangle, ReceiptText,
} from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { inr, dateTime } from "../lib/format";
import { Async } from "../components/ui";
import type { Cart as CartT, CartItem } from "../lib/types";

/* ----------------------------- helpers ----------------------------- */
type Method = "credit" | "upi" | "bank" | "card";
type Step = "review" | "method" | "pay" | "processing" | "result";

const METHOD_LABEL: Record<Method, string> = {
  credit: "Credit Account", upi: "UPI", bank: "Bank Transfer", card: "Card Payment",
};

function totals(items: CartItem[]) {
  let count = 0, sub = 0, tax = 0;
  for (const it of items) {
    count += it.quantity;
    const s = Number(it.unit_rate) * it.quantity;
    sub += s; tax += (s * Number(it.gst_percent)) / 100;
  }
  return { count, sub, tax, grand: sub + tax };
}

function genPaymentId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `PAY${ymd}${String(Math.floor(1000 + Math.random() * 9000))}`;
}

interface Placed {
  orderId: number; orderNumber: string; paymentId: string | null;
  amount: number; method: Method; when: string;
}

/* ============================ page ============================ */
export default function Checkout() {
  const navigate = useNavigate();
  const cart = useFetch<CartT>("/cart");
  const dash = useFetch<any>("/dashboard/customer");

  const [step, setStep] = useState<Step>("review");
  const [method, setMethod] = useState<Method>("credit");
  const [result, setResult] = useState<"success" | "failure">("success");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const items = cart.data?.items ?? [];
  const t = useMemo(() => totals(items), [items]);

  async function doPlace(m: Method, paymentId: string | null, amount: number) {
    setErr(null);
    try {
      const label = METHOD_LABEL[m];
      const notes = m === "credit"
        ? "Placed on credit account · demo checkout"
        : `Paid via ${label} (demo) · ${paymentId}`;
      const r = await api.post("/orders", { notes });
      setPlaced({ orderId: r.data.id, orderNumber: r.data.order_number, paymentId, amount, method: m, when: new Date().toISOString() });
      setResult("success"); setStep("result");
    } catch (e) {
      setErr(apiError(e)); setResult("failure"); setStep("result");
    }
  }

  function pay(m: Method) {
    const paymentId = m === "credit" ? null : genPaymentId();
    const amount = t.grand;
    setStep("processing");
    window.setTimeout(() => doPlace(m, paymentId, amount), 1500);
  }
  function fail() {
    setStep("processing");
    window.setTimeout(() => { setErr("The bank declined this demo transaction."); setResult("failure"); setStep("result"); }, 1300);
  }

  const stepIndex = step === "review" ? 0 : step === "result" ? 2 : 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* header / stepper */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Checkout</h1>
          <p className="text-sm text-muted mt-0.5 flex items-center gap-1.5">
            <Lock size={13} className="text-emerald-500" /> Secured demo checkout · no real transaction
          </p>
        </div>
        <span className="chip bg-amber-500/10 text-amber-600 dark:text-amber-400">DEMO</span>
      </div>

      <Stepper index={stepIndex} />

      <Async state={cart}>
        {(c) =>
          c.items.length === 0 && step !== "result" ? (
            <div className="card p-16 text-center mt-6">
              <ShoppingBag size={44} className="mx-auto mb-3 text-faint" />
              <p className="text-muted">Your cart is empty.</p>
              <button className="btn-primary mt-4" onClick={() => navigate("/catalogue")}>Browse products</button>
            </div>
          ) : (
            <div className="mt-6">
              {step === "review" && <Review items={c.items} t={t} onBack={() => navigate("/cart")} onNext={() => setStep("method")} />}
              {step === "method" && <MethodSelect method={method} setMethod={setMethod} onBack={() => setStep("review")} onNext={() => setStep("pay")} />}
              {step === "pay" && (
                <PayPanel method={method} amount={t.grand} dash={dash.data}
                  onBack={() => setStep("method")} onPay={() => pay(method)} onFail={fail} />
              )}
              {step === "processing" && <Processing method={method} />}
              {step === "result" && result === "success" && placed && (
                <Success placed={placed} onView={() => navigate(`/orders/${placed.orderId}`)} onShop={() => navigate("/catalogue")} />
              )}
              {step === "result" && result === "failure" && (
                <Failure reason={err} onRetry={() => setStep("pay")} onChange={() => { setErr(null); setStep("method"); }} />
              )}
            </div>
          )
        }
      </Async>
    </div>
  );
}

/* ============================ stepper ============================ */
function Stepper({ index }: { index: number }) {
  const steps = ["Review Order", "Payment", "Confirmation"];
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-full grid place-items-center text-sm font-bold transition-all ${
              i < index ? "bg-emerald-500 text-white" : i === index ? "bg-navy-700 text-white shadow-glow" : "bg-surface text-faint"}`}>
              {i < index ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i <= index ? "text-ink" : "text-faint"}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-3 rounded-full transition-all ${i < index ? "bg-emerald-500" : "bg-line"}`} />}
        </div>
      ))}
    </div>
  );
}

/* ============================ step 1: review ============================ */
function Review({ items, t, onBack, onNext }: { items: CartItem[]; t: ReturnType<typeof totals>; onBack: () => void; onNext: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3 animate-fade-up">
      <div className="lg:col-span-2 card overflow-hidden h-fit">
        <div className="px-5 py-4 border-b border-line"><h3 className="font-semibold text-ink">Review your order</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50"><tr>
              <th className="th">Product</th><th className="th text-center">Qty</th>
              <th className="th text-right">Rate</th><th className="th text-center">GST</th><th className="th text-right">Total</th>
            </tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="row-hover">
                  <td className="td font-medium text-ink">{it.product_name}</td>
                  <td className="td text-center">{it.quantity}</td>
                  <td className="td text-right text-muted">{inr(it.unit_rate)}</td>
                  <td className="td text-center text-muted">{Number(it.gst_percent)}%</td>
                  <td className="td text-right font-semibold">{inr(Number(it.unit_rate) * it.quantity * (1 + Number(it.gst_percent) / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5 h-fit lg:sticky lg:top-24">
        <h3 className="font-semibold text-ink mb-4">Order Summary</h3>
        <SummaryRow label={`Sub Total (${t.count} items)`} value={inr(t.sub)} />
        <SummaryRow label="GST" value={inr(t.tax)} />
        <div className="border-t border-line my-3" />
        <SummaryRow label="Grand Total" value={inr(t.grand)} bold />
        <button className="btn-primary w-full mt-5 py-2.5" onClick={onNext}>Proceed to Payment <ArrowRight size={16} /></button>
        <button className="btn-ghost w-full mt-2 py-2.5" onClick={onBack}><ArrowLeft size={16} /> Back to Cart</button>
      </div>
    </div>
  );
}

/* ============================ step 2: method ============================ */
const METHODS: { key: Method; icon: JSX.Element; title: string; desc: string; recommended?: boolean }[] = [
  { key: "credit", icon: <Wallet size={22} />, title: "Credit Account", desc: "Order now and pay later as per your credit terms.", recommended: true },
  { key: "upi", icon: <Smartphone size={22} />, title: "UPI (Demo)", desc: "Pay instantly using any UPI application." },
  { key: "bank", icon: <Landmark size={22} />, title: "Bank Transfer (Demo)", desc: "NEFT / RTGS / IMPS." },
  { key: "card", icon: <CreditCard size={22} />, title: "Card Payment (Demo)", desc: "Visa / Mastercard / RuPay." },
];

function MethodSelect({ method, setMethod, onBack, onNext }: { method: Method; setMethod: (m: Method) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div className="animate-fade-up">
      <h3 className="font-semibold text-ink mb-4">Choose a payment method</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {METHODS.map((m) => {
          const active = method === m.key;
          return (
            <button key={m.key} onClick={() => setMethod(m.key)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${active ? "border-navy-700 bg-navy-50/60 dark:bg-navy-900/30 shadow-glow" : "border-line bg-card hover:border-navy-300 hover:shadow-soft"}`}>
              <div className="flex items-start gap-3.5">
                <span className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 ${active ? "bg-navy-700 text-white" : "bg-surface text-navy-700 dark:text-navy-300"}`}>{m.icon}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-ink flex items-center gap-2 flex-wrap">
                    {m.title}
                    {m.recommended && <span className="chip bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 !py-0.5"><Star size={11} className="fill-emerald-500 text-emerald-500" /> Recommended</span>}
                  </div>
                  <p className="text-sm text-muted mt-0.5">{m.desc}</p>
                </div>
                <span className={`ml-auto mt-1 h-5 w-5 rounded-full border-2 grid place-items-center shrink-0 ${active ? "border-navy-700 bg-navy-700" : "border-line"}`}>
                  {active && <Check size={12} className="text-white" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 mt-6">
        <button className="btn-ghost" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button className="btn-primary ml-auto px-8" onClick={onNext}>Continue <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

/* ============================ step 3: pay panels ============================ */
function PayPanel({ method, amount, dash, onBack, onPay, onFail }: {
  method: Method; amount: number; dash: any; onBack: () => void; onPay: () => void; onFail: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-5 animate-fade-up">
      <div className="lg:col-span-3">
        {method === "credit" && <CreditPanel amount={amount} dash={dash} onPay={onPay} />}
        {method === "upi" && <UpiPanel amount={amount} onPay={onPay} onFail={onFail} />}
        {method === "bank" && <BankPanel onPay={onPay} />}
        {method === "card" && <CardPanel amount={amount} onPay={onPay} />}
        <button className="btn-ghost mt-4" onClick={onBack}><ArrowLeft size={16} /> Choose another method</button>
      </div>

      <aside className="lg:col-span-2">
        <div className="card p-5 lg:sticky lg:top-24">
          <h3 className="font-semibold text-ink mb-3">Paying</h3>
          <div className="text-3xl font-bold text-ink">{inr(amount)}</div>
          <div className="text-xs text-muted mt-1">{METHOD_LABEL[method]}{method !== "credit" ? " · Demo" : ""}</div>
          <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 text-xs text-muted">
            <ShieldCheck size={15} className="text-emerald-500" /> Simulated — no money moves in this environment.
          </div>
        </div>
      </aside>
    </div>
  );
}

function CreditPanel({ amount, dash, onPay }: { amount: number; dash: any; onPay: () => void }) {
  const limit = Number(dash?.cards?.credit_limit ?? 0);
  const outstanding = Number(dash?.cards?.outstanding_amount ?? 0);
  const avail = Number(dash?.cards?.available_credit ?? 0);
  const ok = amount <= avail;
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="h-10 w-10 rounded-xl bg-navy-700 text-white grid place-items-center"><Wallet size={20} /></span>
        <div><h3 className="font-semibold text-ink">Pay on Credit Account</h3><p className="text-xs text-muted">No payment needed now</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CreditStat label="Credit Limit" value={inr(limit)} />
        <CreditStat label="Outstanding" value={inr(outstanding)} tone="danger" />
        <CreditStat label="Available Credit" value={inr(avail)} tone="success" />
        <CreditStat label="Order Amount" value={inr(amount)} tone="navy" />
      </div>
      {!ok && (
        <div className="mt-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm px-3.5 py-2.5 flex items-center gap-2">
          <AlertTriangle size={15} /> This order exceeds your available credit (demo will still allow it).
        </div>
      )}
      <button className="btn-primary w-full mt-5 py-3 text-[15px]" onClick={onPay}>Place Order on Credit <ArrowRight size={17} /></button>
    </div>
  );
}
function CreditStat({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "danger" | "success" | "navy" }) {
  const c: Record<string, string> = { ink: "text-ink", danger: "text-rose-500", success: "text-emerald-600 dark:text-emerald-400", navy: "text-navy-600 dark:text-navy-300" };
  return (
    <div className="rounded-xl border border-line p-3.5">
      <div className="text-[11px] uppercase tracking-wide text-faint font-semibold">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${c[tone]}`}>{value}</div>
    </div>
  );
}

function UpiPanel({ amount, onPay, onFail }: { amount: number; onPay: () => void; onFail: () => void }) {
  return (
    <div className="card p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-1"><Building2 size={16} className="text-navy-700 dark:text-navy-300" /><span className="font-semibold text-ink">GT Medical Solutions</span></div>
      <div className="text-3xl font-bold text-ink mt-2">{inr(amount)}</div>
      <div className="my-5 grid place-items-center">
        <div className="p-3 rounded-2xl bg-white border border-line shadow-soft"><QrPlaceholder /></div>
        <div className="mt-3 text-sm text-muted">UPI ID</div>
        <div className="font-mono font-semibold text-ink">payments@gtmedical</div>
        <div className="text-[11px] text-faint mt-1">Scan with any UPI app · demo only</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <button className="btn-success py-3" onClick={onPay}><CheckCircle2 size={17} /> Simulate Payment Success</button>
        <button className="btn-danger py-3" onClick={onFail}><XCircle size={17} /> Simulate Payment Failure</button>
      </div>
    </div>
  );
}

function BankPanel({ onPay }: { onPay: () => void }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="h-10 w-10 rounded-xl bg-navy-700 text-white grid place-items-center"><Landmark size={20} /></span>
        <div><h3 className="font-semibold text-ink">Bank Transfer</h3><p className="text-xs text-muted">NEFT / RTGS / IMPS · demo details</p></div>
      </div>
      <dl className="divide-y divide-line rounded-xl border border-line overflow-hidden">
        <BankRow k="Bank Name" v="GT Medical Solutions" />
        <BankRow k="Account Number" v="XXXXXXX0012" mono />
        <BankRow k="IFSC" v="GTMS0000123" mono />
        <BankRow k="Account Type" v="Current" />
      </dl>
      <button className="btn-primary w-full mt-5 py-3 text-[15px]" onClick={onPay}><Check size={17} /> I Have Completed Transfer</button>
    </div>
  );
}
function BankRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface/30">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className={`text-sm font-semibold text-ink ${mono ? "font-mono" : ""}`}>{v}</dd>
    </div>
  );
}

function CardPanel({ amount, onPay }: { amount: number; onPay: () => void }) {
  const [num, setNum] = useState("4111 1111 1111 1111");
  const [exp, setExp] = useState("12/30");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("Demo User");
  return (
    <div className="card p-6">
      {/* card visual */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-navy-700 via-navy-800 to-maroon-700 text-white shadow-pop mb-5">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-white/70">GT Medical · Demo</span>
          <CreditCard size={22} className="text-white/80" />
        </div>
        <div className="mt-6 font-mono text-lg tracking-[0.2em]">{num || "•••• •••• •••• ••••"}</div>
        <div className="flex justify-between mt-4 text-sm">
          <div><div className="text-[10px] text-white/60 uppercase">Card Holder</div><div className="font-medium">{name || "—"}</div></div>
          <div><div className="text-[10px] text-white/60 uppercase">Expires</div><div className="font-medium">{exp || "--/--"}</div></div>
        </div>
      </div>
      <div className="space-y-3">
        <div><label className="label">Card Number</label><input className="input font-mono" value={num} onChange={(e) => setNum(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Expiry</label><input className="input font-mono" value={exp} onChange={(e) => setExp(e.target.value)} /></div>
          <div><label className="label">CVV</label><input className="input font-mono" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={4} /></div>
        </div>
        <div><label className="label">Card Holder</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
      </div>
      <button className="btn-primary w-full mt-5 py-3 text-[15px]" onClick={onPay}><Lock size={16} /> Pay {inr(amount)} (Demo)</button>
    </div>
  );
}

/* deterministic faux-QR (air-gap safe, no external asset) */
function QrPlaceholder({ size = 168 }: { size?: number }) {
  const N = 25, q = 2;
  const rects = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    const inFinder = (r: number, c: number) =>
      (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
    for (let r = q; r < N - q; r++)
      for (let c = q; c < N - q; c++)
        if (!inFinder(r, c) && ((r * 31 + c * 17 + r * c * 7) % 5) < 2) out.push({ x: c, y: r });
    return out;
  }, []);
  const m = size / N;
  const Finder = ({ r, c }: { r: number; c: number }) => (
    <g>
      <rect x={c * m} y={r * m} width={7 * m} height={7 * m} rx={2 * m} fill="#071D5A" />
      <rect x={(c + 1) * m} y={(r + 1) * m} width={5 * m} height={5 * m} rx={1.5 * m} fill="#fff" />
      <rect x={(c + 2) * m} y={(r + 2) * m} width={3 * m} height={3 * m} rx={m} fill="#071D5A" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Demo UPI QR code">
      {rects.map((p, i) => <rect key={i} x={p.x * m} y={p.y * m} width={m * 0.86} height={m * 0.86} rx={m * 0.25} fill="#071D5A" />)}
      <Finder r={0} c={0} /><Finder r={0} c={N - 7} /><Finder r={N - 7} c={0} />
    </svg>
  );
}

/* ============================ processing ============================ */
function Processing({ method }: { method: Method }) {
  return (
    <div className="card p-16 text-center animate-fade-in">
      <div className="relative h-20 w-20 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-navy-100 dark:border-navy-900" />
        <Loader2 size={80} className="absolute inset-0 text-navy-700 dark:text-navy-300 animate-spin" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-ink mt-6">Processing payment…</h3>
      <p className="text-sm text-muted mt-1">Confirming your {METHOD_LABEL[method]} {method !== "credit" ? "(demo) " : ""}— please don't refresh.</p>
    </div>
  );
}

/* ============================ success ============================ */
function Success({ placed, onView, onShop }: { placed: Placed; onView: () => void; onShop: () => void }) {
  function downloadReceipt() {
    const html = receiptHtml(placed);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Receipt-${placed.paymentId ?? placed.orderNumber}.html`; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="card p-8 sm:p-12 text-center max-w-2xl mx-auto animate-scale-in">
      <div className="relative mx-auto h-24 w-24">
        <span className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
        <span className="relative h-24 w-24 rounded-full bg-emerald-500 grid place-items-center shadow-glow"><CheckCircle2 size={56} className="text-white" /></span>
      </div>
      <h2 className="text-2xl font-bold text-ink mt-6">Payment Successful</h2>
      <p className="text-muted mt-1">Your order has been placed successfully.</p>

      <div className="mt-7 rounded-2xl border border-line bg-surface/40 divide-y divide-line text-left">
        {placed.paymentId && <ReceiptRow k="Payment ID" v={placed.paymentId} mono />}
        <ReceiptRow k="Order Number" v={placed.orderNumber} mono />
        <ReceiptRow k="Amount Paid" v={inr(placed.amount)} strong />
        <ReceiptRow k="Payment Mode" v={METHOD_LABEL[placed.method] + (placed.method !== "credit" ? " (Demo)" : "")} />
        <ReceiptRow k="Date & Time" v={dateTime(placed.when)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-7">
        <button className="btn-primary py-2.5" onClick={onView}><ReceiptText size={16} /> View Order</button>
        <button className="btn-ghost py-2.5" onClick={onShop}><ShoppingBag size={16} /> Continue Shopping</button>
        <button className="btn-ghost py-2.5" onClick={downloadReceipt}><Download size={16} /> Download Receipt</button>
      </div>
    </div>
  );
}
function ReceiptRow({ k, v, mono, strong }: { k: string; v: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted">{k}</span>
      <span className={`text-sm text-ink ${mono ? "font-mono" : ""} ${strong ? "font-bold text-base" : "font-semibold"}`}>{v}</span>
    </div>
  );
}

/* ============================ failure ============================ */
function Failure({ reason, onRetry, onChange }: { reason: string | null; onRetry: () => void; onChange: () => void }) {
  return (
    <div className="card p-8 sm:p-12 text-center max-w-xl mx-auto animate-scale-in">
      <div className="mx-auto h-24 w-24 rounded-full bg-rose-500 grid place-items-center shadow-glow-maroon"><XCircle size={56} className="text-white" /></div>
      <h2 className="text-2xl font-bold text-ink mt-6">Payment Failed</h2>
      <p className="text-muted mt-1">{reason || "Demo Payment Failure"}</p>
      <p className="text-xs text-faint mt-1">No order was created. You can try again.</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-7">
        <button className="btn-primary py-2.5" onClick={onRetry}><RefreshCw size={16} /> Retry Payment</button>
        <button className="btn-ghost py-2.5" onClick={onChange}><CreditCard size={16} /> Choose Another Method</button>
      </div>
    </div>
  );
}

/* ============================ shared ============================ */
function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "font-bold text-ink text-lg" : "text-sm text-muted"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function receiptHtml(p: Placed): string {
  const rows = [
    p.paymentId ? ["Payment ID", p.paymentId] : null,
    ["Order Number", p.orderNumber],
    ["Amount Paid", inr(p.amount)],
    ["Payment Mode", METHOD_LABEL[p.method] + (p.method !== "credit" ? " (Demo)" : "")],
    ["Date & Time", dateTime(p.when)],
  ].filter(Boolean) as [string, string][];
  return `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${p.orderNumber}</title>
<style>body{font-family:Inter,Segoe UI,system-ui,sans-serif;background:#F8FAFC;color:#0F172A;padding:40px;}
.card{max-width:520px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px -12px rgba(15,23,42,.25)}
.hd{background:linear-gradient(135deg,#071D5A,#7A0E12);color:#fff;padding:24px 28px}
.hd h1{margin:0;font-size:18px}.hd p{margin:4px 0 0;opacity:.8;font-size:12px}
.badge{display:inline-block;margin-top:10px;background:rgba(255,255,255,.15);padding:4px 10px;border-radius:999px;font-size:11px}
table{width:100%;border-collapse:collapse}td{padding:12px 28px;font-size:14px;border-top:1px solid #E2E8F0}
td.k{color:#64748B}td.v{text-align:right;font-weight:600}.ft{padding:18px 28px;color:#94A3B8;font-size:11px;text-align:center}</style></head>
<body><div class="card"><div class="hd"><h1>GT Medical Solutions</h1><p>Wholesale Healthcare Distribution</p>
<span class="badge">DEMO PAYMENT RECEIPT</span></div>
<table>${rows.map(([k, v]) => `<tr><td class="k">${k}</td><td class="v">${v}</td></tr>`).join("")}</table>
<div class="ft">This is a simulated receipt generated in a demo environment. No real transaction was processed.</div></div></body></html>`;
}
