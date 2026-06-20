import { useState } from "react";
import { Search, Plus, ShoppingCart, PackageX } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr } from "../lib/format";
import { Async, PageHeader } from "../components/ui";
import type { Page, Product } from "../lib/types";

export default function Catalogue() {
  const { isCustomer } = useAuth();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const state = useFetch<Page<Product>>(`/products?page_size=60&q=${encodeURIComponent(query)}`, [query]);

  async function addToCart(p: Product) {
    try {
      await api.post("/cart/items", { product_id: p.id, quantity: 1 });
      setToast(`Added ${p.name} to cart`);
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setToast(apiError(e));
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div>
      <PageHeader title="Product Catalogue" subtitle="Browse wholesale medical products" />

      <form
        onSubmit={(e) => { e.preventDefault(); setQuery(q); }}
        className="card p-3 mb-5 flex gap-2 items-center"
      >
        <Search size={18} className="text-slate-400 ml-1" />
        <input
          className="flex-1 outline-none text-sm bg-transparent"
          placeholder="Search by name, generic, or code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary py-1.5">Search</button>
      </form>

      <Async state={state} empty="No products match your search.">
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <div key={p.id} className="card p-4 flex flex-col">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-mono text-slate-400">{p.product_code}</span>
                  {p.available_stock <= 0 ? (
                    <span className="badge bg-rose-100 text-rose-700 gap-1"><PackageX size={12} /> Out</span>
                  ) : (
                    <span className="badge bg-accent-50 text-accent-700">{p.available_stock} in stock</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 mt-2 leading-snug">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.generic_name}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-lg font-semibold text-primary-700">{inr(p.wholesale_rate)}</div>
                    <div className="text-[11px] text-slate-400 line-through">MRP {inr(p.mrp)}</div>
                  </div>
                  <span className="text-[11px] text-slate-500">GST {p.gst_percent}% · {p.uom}</span>
                </div>
                {isCustomer && (
                  <button
                    className="btn-accent mt-3 w-full py-1.5"
                    disabled={p.available_stock <= 0}
                    onClick={() => addToCart(p)}
                  >
                    <ShoppingCart size={16} /> Add to cart
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Async>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-800 text-white text-sm px-4 py-2 shadow-lg flex items-center gap-2">
          <Plus size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
