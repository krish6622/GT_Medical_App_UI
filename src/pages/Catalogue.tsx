import { useState } from "react";
import { Search, ShoppingCart, PackageX, Pill, Check } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr } from "../lib/format";
import { Async, PageHeader } from "../components/ui";
import type { Page, Product } from "../lib/types";

interface CategoryOpt { id: number; name: string; }

export default function Catalogue() {
  const { isCustomer } = useAuth();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<number | "">("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const cats = useFetch<CategoryOpt[]>("/catalog/categories");
  const url = `/products?page_size=60&q=${encodeURIComponent(query)}${cat ? `&category_id=${cat}` : ""}`;
  const state = useFetch<Page<Product>>(url, [query, cat]);

  async function addToCart(p: Product) {
    try {
      await api.post("/cart/items", { product_id: p.id, quantity: 1 });
      setAdded((s) => new Set(s).add(p.id));
      setTimeout(() => setAdded((s) => { const n = new Set(s); n.delete(p.id); return n; }), 1500);
      setToast({ msg: `Added ${p.name}`, ok: true });
    } catch (e) {
      setToast({ msg: apiError(e), ok: false });
    }
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div>
      <PageHeader title="Product Catalogue" subtitle="Browse and order wholesale medical products" />

      <div className="card p-3 mb-5 flex flex-wrap gap-2 items-center">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input pl-10" placeholder="Search by name, generic, or code…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <select className="input w-auto min-w-[160px]" value={cat} onChange={(e) => setCat(e.target.value ? Number(e.target.value) : "")}>
          <option value="">All categories</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setQuery(q)}>Search</button>
      </div>

      <Async state={state} empty="No products match your search.">
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {data.items.map((p) => {
              const low = p.available_stock > 0 && p.available_stock <= p.reorder_level;
              const justAdded = added.has(p.id);
              return (
                <div key={p.id} className="card p-4 flex flex-col hover:shadow-pop hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-accent-500/10 text-accent-500 grid place-items-center"><Pill size={22} /></div>
                    {p.available_stock <= 0 ? (
                      <span className="chip bg-rose-500/10 text-rose-500"><PackageX size={12} /> Out of stock</span>
                    ) : low ? (
                      <span className="chip bg-amber-500/10 text-amber-600 dark:text-amber-400">Low · {p.available_stock}</span>
                    ) : (
                      <span className="chip bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{p.available_stock} in stock</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-faint mt-3">{p.product_code}</span>
                  <h3 className="font-semibold text-ink leading-snug mt-0.5">{p.name}</h3>
                  <p className="text-xs text-muted">{p.generic_name}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-bold text-ink">{inr(p.wholesale_rate)}</div>
                      <div className="text-[11px] text-faint line-through">MRP {inr(p.mrp)}</div>
                    </div>
                    <span className="text-[11px] text-muted">GST {p.gst_percent}% · {p.uom}</span>
                  </div>
                  {isCustomer && (
                    <button
                      className={`mt-3 w-full py-2 ${justAdded ? "btn-success" : "btn-primary"}`}
                      disabled={p.available_stock <= 0}
                      onClick={() => addToCart(p)}
                    >
                      {justAdded ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to cart</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Async>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl text-white text-sm px-4 py-2.5 shadow-pop flex items-center gap-2 animate-scale-in ${toast.ok ? "bg-emerald-600" : "bg-rose-600"}`}>
          {toast.ok ? <Check size={16} /> : <PackageX size={16} />} {toast.msg}
        </div>
      )}
    </div>
  );
}
