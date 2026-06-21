import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Heart, Mic, ScanLine,
  SlidersHorizontal, X, Check, Pill, PackageX, Pencil, Boxes, Star,
  History, Sparkles, Building2, ChevronRight, ArrowRight, Layers, Tag,
} from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { inr } from "../lib/format";
import { Async, PageHeader } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ProductForm, BatchForm } from "../components/ProductForm";
import type { Page, Product, Named, Cart as CartT, CartItem } from "../lib/types";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ *
 *  Small persistent helpers (localStorage — air-gap safe, no network) *
 * ------------------------------------------------------------------ */
function readList(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeList(key: string, v: string[]) { localStorage.setItem(key, JSON.stringify(v)); }

/* Tasteful on-brand tints for the image-less thumbnail, varied by category. */
const THUMBS = [
  "from-navy-50 to-navy-100 text-navy-600 dark:from-navy-900/40 dark:to-navy-800/30 dark:text-navy-200",
  "from-maroon-50 to-maroon-100 text-maroon-600 dark:from-maroon-900/30 dark:to-maroon-800/20 dark:text-maroon-300",
  "from-emerald-50 to-emerald-100 text-emerald-600 dark:from-emerald-900/30 dark:to-emerald-800/20 dark:text-emerald-300",
  "from-amber-50 to-amber-100 text-amber-600 dark:from-amber-900/30 dark:to-amber-800/20 dark:text-amber-300",
  "from-violet-50 to-violet-100 text-violet-600 dark:from-violet-900/30 dark:to-violet-800/20 dark:text-violet-300",
  "from-sky-50 to-sky-100 text-sky-600 dark:from-sky-900/30 dark:to-sky-800/20 dark:text-sky-300",
];
const thumbTone = (id?: number | null) => THUMBS[(id ?? 0) % THUMBS.length];

const discountPct = (mrp: string, rate: string) => {
  const m = Number(mrp), r = Number(rate);
  return m > 0 && r < m ? Math.round(((m - r) / m) * 100) : 0;
};

/** count + ₹ totals computed locally for instant feedback (matches backend pricing). */
function totals(items: CartItem[]) {
  let count = 0, sub = 0, tax = 0;
  for (const it of items) {
    count += it.quantity;
    const s = Number(it.unit_rate) * it.quantity;
    sub += s; tax += (s * Number(it.gst_percent)) / 100;
  }
  return { count, sub, tax, grand: sub + tax };
}

type StockFilter = "all" | "in" | "low" | "out";
type SortKey = "name" | "price_low" | "price_high" | "discount";

export default function Catalogue() {
  const { isCustomer, can } = useAuth();
  const navigate = useNavigate();

  /* ---- data ---- */
  const cats = useFetch<Named[]>("/catalog/categories");
  const manus = useFetch<Named[]>("/catalog/manufacturers");
  const brands = useFetch<Named[]>("/catalog/brands");
  const state = useFetch<Page<Product>>("/products?page_size=500&sort=name");

  /* ---- search & filters (all client-side over the loaded set) ---- */
  const [q, setQ] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [cat, setCat] = useState<number | "">("");
  const [manu, setManu] = useState<number | "">("");
  const [brand, setBrand] = useState<number | "">("");
  const [gst, setGst] = useState<string>("");
  const [stock, setStock] = useState<StockFilter>("all");
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sort, setSort] = useState<SortKey>("name");
  const [wishOnly, setWishOnly] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ---- wishlist + recents (persistent) ---- */
  const [wishlist, setWishlist] = useState<Set<number>>(() => new Set(readList("gtm_wishlist").map(Number)));
  const [recentSearch, setRecentSearch] = useState<string[]>(() => readList("gtm_recent_searches"));
  const [recentProd, setRecentProd] = useState<number[]>(() => readList("gtm_recent_products").map(Number));

  /* ---- cart ---- */
  const [cart, setCart] = useState<CartT | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [bump, setBump] = useState(0);            // badge pop animation key
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const qtyTimers = useRef<Record<number, number>>({});

  /* ---- admin forms ---- */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [batchFor, setBatchFor] = useState<Product | null>(null);
  const canManage = can("product:create");
  const canStock = can("batch:create");

  useEffect(() => { if (isCustomer) api.get<CartT>("/cart").then((r) => setCart(r.data)).catch(() => {}); }, [isCustomer]);

  function flash(msg: string, ok = true) { setToast({ msg, ok }); setTimeout(() => setToast(null), 2200); }

  /* ---- derived lookup maps ---- */
  const products = state.data?.items ?? [];
  const manuMap = useMemo(() => new Map((manus.data ?? []).map((m) => [m.id, m.name])), [manus.data]);
  const brandMap = useMemo(() => new Map((brands.data ?? []).map((b) => [b.id, b.name])), [brands.data]);
  const cartMap = useMemo(() => new Map((cart?.items ?? []).map((i) => [i.product_id, i])), [cart]);
  const wishlistP = useMemo(() => products.filter((p) => wishlist.has(p.id)), [products, wishlist]);
  const recentP = useMemo(
    () => recentProd.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 8) as Product[],
    [recentProd, products],
  );
  const priceCeil = useMemo(
    () => Math.ceil(Math.max(100, ...products.map((p) => Number(p.wholesale_rate))) / 50) * 50,
    [products],
  );
  useEffect(() => { if (priceCeil && !maxPrice) setMaxPrice(priceCeil); }, [priceCeil, maxPrice]);

  /* live category counts */
  const catCount = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of products) m.set(p.category_id ?? 0, (m.get(p.category_id ?? 0) ?? 0) + 1);
    return m;
  }, [products]);

  /* ---- the filtered + sorted grid ---- */
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = products.filter((p) => {
      if (cat !== "" && p.category_id !== cat) return false;
      if (manu !== "" && p.manufacturer_id !== manu) return false;
      if (brand !== "" && p.brand_id !== brand) return false;
      if (gst && p.gst_percent !== gst) return false;
      if (wishOnly && !wishlist.has(p.id)) return false;
      if (maxPrice && Number(p.wholesale_rate) > maxPrice) return false;
      const low = p.available_stock > 0 && p.available_stock <= p.reorder_level;
      if (stock === "in" && p.available_stock <= 0) return false;
      if (stock === "low" && !low) return false;
      if (stock === "out" && p.available_stock > 0) return false;
      if (needle) {
        const hay = `${p.name} ${p.generic_name ?? ""} ${p.product_code} ${manuMap.get(p.manufacturer_id ?? -1) ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "price_low") return Number(a.wholesale_rate) - Number(b.wholesale_rate);
      if (sort === "price_high") return Number(b.wholesale_rate) - Number(a.wholesale_rate);
      if (sort === "discount") return discountPct(b.mrp, b.wholesale_rate) - discountPct(a.mrp, a.wholesale_rate);
      return a.name.localeCompare(b.name);
    });
    return out;
  }, [products, q, cat, manu, brand, gst, stock, maxPrice, wishOnly, wishlist, sort, manuMap]);

  /* autocomplete suggestions */
  const suggestions = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return [];
    return products
      .filter((p) => `${p.name} ${p.generic_name ?? ""} ${p.product_code}`.toLowerCase().includes(n))
      .slice(0, 6);
  }, [q, products]);

  const activeFilters =
    (cat !== "" ? 1 : 0) + (manu !== "" ? 1 : 0) + (brand !== "" ? 1 : 0) +
    (gst ? 1 : 0) + (stock !== "all" ? 1 : 0) + (wishOnly ? 1 : 0) +
    (maxPrice && maxPrice < priceCeil ? 1 : 0);

  function clearFilters() {
    setCat(""); setManu(""); setBrand(""); setGst(""); setStock("all");
    setWishOnly(false); setMaxPrice(priceCeil);
  }

  /* ---- search helpers ---- */
  function commitSearch(text: string) {
    const t = text.trim();
    setQ(t); setSearchFocus(false);
    if (t) {
      const next = [t, ...recentSearch.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, 6);
      setRecentSearch(next); writeList("gtm_recent_searches", next);
    }
  }
  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { flash("Voice search isn't supported in this browser", false); return; }
    const rec = new SR();
    rec.lang = "en-IN"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e: any) => commitSearch(e.results[0][0].transcript);
    rec.onerror = () => flash("Could not capture audio", false);
    rec.start(); flash("Listening… speak the medicine name");
  }
  function scanMode() {
    /* USB/Bluetooth barcode scanners type into the focused field + Enter — focusing it
       enables real hardware scanning; product code is matched on submit. */
    searchRef.current?.focus();
    flash("Scan a barcode or type the product code");
  }

  /* ---- wishlist ---- */
  function toggleWish(id: number) {
    setWishlist((s) => {
      const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id);
      writeList("gtm_wishlist", [...n].map(String));
      return n;
    });
  }

  /* ---- cart actions ---- */
  function pushRecent(id: number) {
    const next = [id, ...recentProd.filter((x) => x !== id)].slice(0, 12);
    setRecentProd(next); writeList("gtm_recent_products", next.map(String));
  }
  async function addToCart(p: Product) {
    try {
      const { data } = await api.post<CartT>("/cart/items", { product_id: p.id, quantity: 1 });
      setCart(data); pushRecent(p.id); setBump((b) => b + 1);
    } catch (e) { flash(apiError(e), false); }
  }
  /** optimistic local update + debounced authoritative PUT/DELETE */
  function changeQty(item: CartItem, qty: number) {
    setBump((b) => b + 1);
    if (qty <= 0) {
      setCart((c) => (c ? { ...c, items: c.items.filter((i) => i.id !== item.id) } : c));
      api.delete<CartT>(`/cart/items/${item.id}`).then((r) => setCart(r.data)).catch((e) => flash(apiError(e), false));
      return;
    }
    setCart((c) => (c ? { ...c, items: c.items.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i)) } : c));
    window.clearTimeout(qtyTimers.current[item.id]);
    qtyTimers.current[item.id] = window.setTimeout(() => {
      api.put<CartT>(`/cart/items/${item.id}`, { product_id: item.product_id, quantity: qty })
        .then((r) => setCart(r.data)).catch((e) => flash(apiError(e), false));
    }, 350);
  }

  const t = totals(cart?.items ?? []);

  function checkout() {
    setCartOpen(false);
    navigate("/checkout");
  }

  /* ================================================================= */
  return (
    <div className={isCustomer && t.count > 0 ? "pb-24" : ""}>
      <PageHeader
        title="Product Catalogue"
        subtitle={canManage ? "Browse, manage and stock the wholesale catalogue" : "Order wholesale medical products — fast"}
        action={
          <div className="flex items-center gap-2">
            {canManage && (
              <button className="btn-ghost" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus size={16} /> Add Product
              </button>
            )}
            {isCustomer && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative btn-primary !px-3.5 group"
                title="Open cart"
              >
                <ShoppingCart size={17} />
                <span className="hidden sm:inline">{t.count} {t.count === 1 ? "Item" : "Items"}</span>
                <span className="hidden sm:inline opacity-70">·</span>
                <span className="font-bold">{inr(t.grand)}</span>
                {t.count > 0 && (
                  <span key={bump} className="absolute -top-2 -right-2 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-maroon-600 text-white text-[11px] font-bold ring-2 ring-bg animate-scale-in">
                    {t.count}
                  </span>
                )}
              </button>
            )}
          </div>
        }
      />

      {/* ===================== Search bar ===================== */}
      <div className="glass p-2.5 mb-5 sticky top-[72px] z-20">
        <div className="flex items-center gap-2">
          <button className="btn-ghost lg:hidden !px-3 relative" onClick={() => setMobileFilters(true)} title="Filters">
            <SlidersHorizontal size={16} />
            {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 grid place-items-center rounded-full bg-maroon-600 text-white text-[10px] font-bold">{activeFilters}</span>}
          </button>
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              ref={searchRef}
              className="input pl-11 pr-24 py-3 text-[15px] bg-card"
              placeholder="Search medicine name, generic name, manufacturer, product code…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              onKeyDown={(e) => { if (e.key === "Enter") commitSearch(q); if (e.key === "Escape") setSearchFocus(false); }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {q && <button className="btn-icon h-8 w-8" onClick={() => setQ("")} title="Clear"><X size={15} /></button>}
              <button className="btn-icon h-8 w-8 hover:text-maroon-600" onClick={startVoice} title="Voice search"><Mic size={16} /></button>
              <button className="btn-icon h-8 w-8 hover:text-navy-700" onClick={scanMode} title="Scan barcode"><ScanLine size={16} /></button>
            </div>

            {/* autocomplete / recent searches */}
            {searchFocus && (suggestions.length > 0 || recentSearch.length > 0) && (
              <div className="absolute left-0 right-0 mt-2 card p-1.5 z-30 animate-scale-in shadow-pop">
                {suggestions.length > 0 ? (
                  suggestions.map((p) => (
                    <button key={p.id} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface text-left"
                      onMouseDown={(e) => e.preventDefault()} onClick={() => commitSearch(p.name)}>
                      <span className={`h-7 w-7 rounded-lg grid place-items-center bg-gradient-to-br ${thumbTone(p.category_id)}`}><Pill size={13} /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink truncate">{p.name}</span>
                        <span className="block text-[11px] text-faint truncate">{p.generic_name} · {p.product_code}</span>
                      </span>
                      <span className="ml-auto text-sm font-semibold text-ink">{inr(p.wholesale_rate)}</span>
                    </button>
                  ))
                ) : (
                  <>
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint flex items-center gap-1.5"><History size={12} /> Recent searches</div>
                    <div className="flex flex-wrap gap-1.5 px-2 pb-1.5">
                      {recentSearch.map((s) => (
                        <button key={s} className="chip bg-surface text-muted hover:text-ink" onMouseDown={(e) => e.preventDefault()} onClick={() => commitSearch(s)}>{s}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== Quick reorder strip ===================== */}
      {isCustomer && recentP.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles size={16} className="text-maroon-600" />
            <h2 className="font-semibold text-ink">Quick reorder</h2>
            <span className="text-xs text-faint">your recently added products</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {recentP.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="snap-start shrink-0 w-56 card p-3 flex items-center gap-3 text-left hover:shadow-pop hover:-translate-y-0.5 transition-all">
                <span className={`h-11 w-11 rounded-xl grid place-items-center bg-gradient-to-br ${thumbTone(p.category_id)}`}><Pill size={20} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink truncate">{p.name}</span>
                  <span className="block text-xs text-faint">{inr(p.wholesale_rate)}</span>
                </span>
                <span className="h-8 w-8 rounded-lg grid place-items-center bg-accent-500/10 text-accent-600 dark:text-accent-400 shrink-0"><Plus size={16} /></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== Body: sidebar + grid ===================== */}
      <div className="flex gap-6 items-start">
        {/* ---- sticky sidebar (desktop) ---- */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-[150px] space-y-4">
          <FiltersPanel
            cats={cats.data ?? []} manus={manus.data ?? []} brands={brands.data ?? []}
            catCount={catCount} total={products.length}
            cat={cat} setCat={setCat} manu={manu} setManu={setManu} brand={brand} setBrand={setBrand}
            gst={gst} setGst={setGst} stock={stock} setStock={setStock}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice} priceCeil={priceCeil}
            wishOnly={wishOnly} setWishOnly={setWishOnly} wishCount={wishlistP.length}
            activeFilters={activeFilters} clearFilters={clearFilters}
          />
        </aside>

        {/* ---- product grid ---- */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">{visible.length}</span> {visible.length === 1 ? "product" : "products"}
              {q && <> for “<span className="text-ink">{q}</span>”</>}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-faint hidden sm:inline">Sort</span>
              <select className="input w-auto py-1.5 text-sm" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="name">Name (A–Z)</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
                <option value="discount">Best discount</option>
              </select>
            </label>
          </div>

          <Async state={state} empty="No products in the catalogue yet.">
            {() =>
              visible.length === 0 ? (
                <div className="card p-16 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-muted">No products match your filters.</p>
                  <button className="btn-ghost mt-4" onClick={() => { setQ(""); clearFilters(); }}>Clear search & filters</button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visible.map((p) => (
                    <ProductCard
                      key={p.id} p={p}
                      manu={manuMap.get(p.manufacturer_id ?? -1)} brand={brandMap.get(p.brand_id ?? -1)}
                      item={cartMap.get(p.id)} isCustomer={isCustomer}
                      wished={wishlist.has(p.id)} onWish={() => toggleWish(p.id)}
                      onAdd={() => addToCart(p)} onQty={changeQty}
                      canManage={canManage} canStock={canStock}
                      onEdit={() => { setEditing(p); setFormOpen(true); }} onBatch={() => setBatchFor(p)}
                    />
                  ))}
                </div>
              )
            }
          </Async>
        </div>
      </div>

      {/* ===================== Sticky quick-order bar ===================== */}
      {isCustomer && t.count > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-30 px-4 lg:pl-[300px] pointer-events-none">
          <div className="max-w-3xl mx-auto glass shadow-pop px-4 py-3 flex items-center gap-4 pointer-events-auto animate-fade-up">
            <div className="h-10 w-10 rounded-xl bg-maroon-600 text-white grid place-items-center shrink-0">
              <ShoppingCart size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink leading-tight">{t.count} {t.count === 1 ? "item" : "items"} selected</div>
              <div className="text-xs text-muted">Total <span className="font-semibold text-ink">{inr(t.grand)}</span> · incl. GST</div>
            </div>
            <button className="btn-primary ml-auto" onClick={() => setCartOpen(true)}>
              Review Cart <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ===================== Cart drawer ===================== */}
      <Drawer
        open={cartOpen} onClose={() => setCartOpen(false)} width="max-w-md"
        title={<span className="flex items-center gap-2"><ShoppingCart size={18} /> Your Cart</span>}
        subtitle={`${t.count} ${t.count === 1 ? "item" : "items"}`}
        footer={
          cart && cart.items.length > 0 ? (
            <div>
              <div className="space-y-1.5 mb-3">
                <SummaryRow label="Subtotal" value={inr(t.sub)} />
                <SummaryRow label="GST" value={inr(t.tax)} />
                <div className="border-t border-line my-2" />
                <SummaryRow label="Grand Total" value={inr(t.grand)} bold />
              </div>
              <button className="btn-primary w-full py-3 text-[15px]" onClick={checkout}>
                Proceed to Checkout <ArrowRight size={17} />
              </button>
            </div>
          ) : undefined
        }
      >
        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-20 text-faint">
            <ShoppingCart size={44} className="mx-auto mb-3" />
            <p className="text-sm">Your cart is empty.</p>
            <button className="btn-ghost mt-4" onClick={() => setCartOpen(false)}>Browse products</button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.items.map((it) => (
              <div key={it.id} className="flex gap-3 p-3 rounded-xl border border-line hover:bg-surface/50 transition-colors">
                <span className="h-12 w-12 shrink-0 rounded-xl grid place-items-center bg-gradient-to-br from-navy-50 to-navy-100 text-navy-600 dark:from-navy-900/40 dark:to-navy-800/30 dark:text-navy-200"><Pill size={20} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">{it.product_name}</div>
                      <div className="text-[11px] text-faint">{inr(it.unit_rate)} · GST {Number(it.gst_percent)}%</div>
                    </div>
                    <button className="btn-icon h-7 w-7 hover:text-rose-500" onClick={() => changeQty(it, 0)} title="Remove"><Trash2 size={15} /></button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Stepper value={it.quantity} onChange={(n) => changeQty(it, n)} max={it.available_stock} small />
                    <span className="text-sm font-bold text-ink">{inr(Number(it.unit_rate) * it.quantity * (1 + Number(it.gst_percent) / 100))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>

      {/* ---- mobile filters drawer ---- */}
      <Drawer open={mobileFilters} onClose={() => setMobileFilters(false)} width="max-w-xs" title="Filters">
        <FiltersPanel
          cats={cats.data ?? []} manus={manus.data ?? []} brands={brands.data ?? []}
          catCount={catCount} total={products.length}
          cat={cat} setCat={setCat} manu={manu} setManu={setManu} brand={brand} setBrand={setBrand}
          gst={gst} setGst={setGst} stock={stock} setStock={setStock}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice} priceCeil={priceCeil}
          wishOnly={wishOnly} setWishOnly={setWishOnly} wishCount={wishlistP.length}
          activeFilters={activeFilters} clearFilters={clearFilters} bare
        />
      </Drawer>

      {/* ---- admin forms ---- */}
      <ProductForm open={formOpen} product={editing} onClose={() => setFormOpen(false)}
        onSaved={() => { state.reload(); flash(editing ? "Product updated" : "Product created"); }} />
      <BatchForm open={batchFor != null} product={batchFor} onClose={() => setBatchFor(null)}
        onSaved={() => { state.reload(); flash("Stock added to inventory"); }} />

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] rounded-xl text-white text-sm px-4 py-2.5 shadow-pop flex items-center gap-2 animate-scale-in ${toast.ok ? "bg-emerald-600" : "bg-rose-600"}`}>
          {toast.ok ? <Check size={16} /> : <PackageX size={16} />} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ================================================================= *
 *  Sub-components                                                    *
 * ================================================================= */

function StockBadge({ p }: { p: Product }) {
  const low = p.available_stock > 0 && p.available_stock <= p.reorder_level;
  if (p.available_stock <= 0)
    return <span className="chip bg-rose-500/10 text-rose-500"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Out of stock</span>;
  if (low)
    return <span className="chip bg-amber-500/10 text-amber-600 dark:text-amber-400"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Low · {p.available_stock}</span>;
  return <span className="chip bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In stock · {p.available_stock}</span>;
}

function Stepper({ value, onChange, max, small }: { value: number; onChange: (n: number) => void; max?: number; small?: boolean }) {
  const atMax = max !== undefined && value >= max;
  const h = small ? "h-8" : "h-9";
  return (
    <div className={`inline-flex items-center ${h} rounded-xl border border-line bg-card overflow-hidden`}>
      <button className={`${h} w-8 grid place-items-center text-ink hover:bg-surface active:scale-95 transition`} onClick={() => onChange(value - 1)}>
        <Minus size={14} />
      </button>
      <span className="w-9 text-center text-sm font-bold text-ink tabular-nums">{value}</span>
      <button className={`${h} w-8 grid place-items-center text-ink hover:bg-surface active:scale-95 transition disabled:opacity-40`} disabled={atMax} onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
}

function ProductCard({
  p, manu, brand, item, isCustomer, wished, onWish, onAdd, onQty,
  canManage, canStock, onEdit, onBatch,
}: {
  p: Product; manu?: string; brand?: string; item?: CartItem; isCustomer: boolean;
  wished: boolean; onWish: () => void; onAdd: () => void; onQty: (it: CartItem, n: number) => void;
  canManage: boolean; canStock: boolean; onEdit: () => void; onBatch: () => void;
}) {
  const disc = discountPct(p.mrp, p.wholesale_rate);
  const out = p.available_stock <= 0;
  return (
    <div className="card p-4 flex flex-col hover:shadow-pop hover:-translate-y-1 transition-all duration-200 group">
      {/* thumbnail */}
      <div className={`relative h-28 rounded-xl grid place-items-center bg-gradient-to-br ${thumbTone(p.category_id)} mb-3 overflow-hidden`}>
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
          : <Pill size={40} className="opacity-80 group-hover:scale-110 transition-transform" />}
        {disc > 0 && (
          <span className="absolute top-2 left-2 chip bg-maroon-600 text-white shadow-sm"><Tag size={11} /> {disc}% OFF</span>
        )}
        <button onClick={onWish} title={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-card/80 backdrop-blur border border-line hover:scale-110 transition">
          <Heart size={15} className={wished ? "fill-maroon-600 text-maroon-600" : "text-muted"} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-faint">{p.product_code}</span>
        <StockBadge p={p} />
      </div>
      <h3 className="font-semibold text-ink leading-snug mt-1 line-clamp-2">{p.name}</h3>
      {p.generic_name && <p className="text-xs text-muted truncate">{p.generic_name}</p>}
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-faint flex-wrap">
        {manu && <span className="inline-flex items-center gap-1"><Building2 size={11} /> {manu}</span>}
        <span className="inline-flex items-center gap-1"><Layers size={11} /> {p.uom}</span>
        <span className="chip bg-surface text-muted !py-0.5">GST {Number(p.gst_percent)}%</span>
      </div>

      <div className="mt-3 pt-3 border-t border-line flex items-end justify-between">
        <div>
          <div className="text-lg font-bold text-ink leading-none">{inr(p.wholesale_rate)}</div>
          <div className="text-[11px] text-faint mt-1">MRP <span className="line-through">{inr(p.mrp)}</span></div>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-faint font-semibold">/ {p.uom}</span>
      </div>

      {/* quantity experience */}
      {isCustomer && (
        <div className="mt-3">
          {item ? (
            <div className="flex items-center justify-between gap-2 animate-scale-in">
              <Stepper value={item.quantity} onChange={(n) => onQty(item, n)} max={p.available_stock} />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={14} /> In cart</span>
            </div>
          ) : (
            <button className="btn-primary w-full py-2.5" disabled={out} onClick={onAdd}>
              <ShoppingCart size={16} /> {out ? "Out of stock" : "Add to Cart"}
            </button>
          )}
        </div>
      )}

      {canManage && (
        <div className="mt-3 flex gap-2">
          <button className="btn-ghost flex-1 py-1.5" onClick={onEdit}><Pencil size={14} /> Edit</button>
          {canStock && <button className="btn-ghost flex-1 py-1.5" onClick={onBatch}><Boxes size={14} /> Stock</button>}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-ink text-lg" : "text-sm text-muted"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

const GST_OPTIONS = ["5.00", "12.00", "18.00", "28.00"];
const STOCK_OPTS: { v: StockFilter; label: string; dot: string }[] = [
  { v: "all", label: "All", dot: "bg-slate-400" },
  { v: "in", label: "In stock", dot: "bg-emerald-500" },
  { v: "low", label: "Low", dot: "bg-amber-500" },
  { v: "out", label: "Out", dot: "bg-rose-500" },
];

function FiltersPanel(props: {
  cats: Named[]; manus: Named[]; brands: Named[];
  catCount: Map<number, number>; total: number;
  cat: number | ""; setCat: (v: number | "") => void;
  manu: number | ""; setManu: (v: number | "") => void;
  brand: number | ""; setBrand: (v: number | "") => void;
  gst: string; setGst: (v: string) => void;
  stock: StockFilter; setStock: (v: StockFilter) => void;
  maxPrice: number; setMaxPrice: (v: number) => void; priceCeil: number;
  wishOnly: boolean; setWishOnly: (v: boolean) => void; wishCount: number;
  activeFilters: number; clearFilters: () => void; bare?: boolean;
}) {
  const {
    cats, manus, brands, catCount, total, cat, setCat, manu, setManu, brand, setBrand,
    gst, setGst, stock, setStock, maxPrice, setMaxPrice, priceCeil,
    wishOnly, setWishOnly, wishCount, activeFilters, clearFilters, bare,
  } = props;
  const wrap = bare ? "space-y-5" : "card p-4 space-y-5";
  return (
    <div className={wrap}>
      {/* categories */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-faint mb-2 flex items-center gap-1.5"><Layers size={12} /> Categories</h3>
        <div className="space-y-0.5">
          <CatRow label="All Categories" count={total} active={cat === ""} onClick={() => setCat("")} />
          {cats.map((c) => (
            <CatRow key={c.id} label={c.name} count={catCount.get(c.id) ?? 0} active={cat === c.id} onClick={() => setCat(cat === c.id ? "" : c.id)} />
          ))}
        </div>
      </div>

      <div className="border-t border-line" />

      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-faint flex items-center gap-1.5"><SlidersHorizontal size={12} /> Filters</h3>
        {activeFilters > 0 && <button className="text-xs text-maroon-600 font-medium hover:underline" onClick={clearFilters}>Clear ({activeFilters})</button>}
      </div>

      {/* wishlist toggle */}
      <button onClick={() => setWishOnly(!wishOnly)}
        className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border transition ${wishOnly ? "border-maroon-300 bg-maroon-50 text-maroon-700 dark:bg-maroon-900/20 dark:border-maroon-800 dark:text-maroon-300" : "border-line text-ink hover:bg-surface"}`}>
        <Heart size={15} className={wishOnly ? "fill-maroon-600 text-maroon-600" : ""} /> Wishlist
        <span className="ml-auto text-xs text-faint">{wishCount}</span>
      </button>

      {/* price range */}
      <div>
        <label className="label flex items-center justify-between">
          <span>Max wholesale price</span>
          <span className="text-ink font-semibold">{inr(maxPrice)}</span>
        </label>
        <input type="range" min={0} max={priceCeil || 1000} step={10} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-maroon-600 cursor-pointer" />
        <div className="flex justify-between text-[11px] text-faint mt-1"><span>{inr(0)}</span><span>{inr(priceCeil)}</span></div>
      </div>

      {/* stock availability */}
      <div>
        <label className="label">Stock availability</label>
        <div className="grid grid-cols-2 gap-1.5">
          {STOCK_OPTS.map((s) => (
            <button key={s.v} onClick={() => setStock(s.v)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${stock === s.v ? "border-navy-300 bg-navy-50 text-navy-700 dark:bg-navy-900/30 dark:border-navy-700 dark:text-navy-200" : "border-line text-muted hover:bg-surface"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* GST */}
      <div>
        <label className="label">GST %</label>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setGst("")} className={`chip border ${gst === "" ? "border-navy-300 bg-navy-50 text-navy-700 dark:bg-navy-900/30 dark:text-navy-200 dark:border-navy-700" : "border-line text-muted hover:bg-surface"}`}>Any</button>
          {GST_OPTIONS.map((g) => (
            <button key={g} onClick={() => setGst(gst === g ? "" : g)} className={`chip border ${gst === g ? "border-navy-300 bg-navy-50 text-navy-700 dark:bg-navy-900/30 dark:text-navy-200 dark:border-navy-700" : "border-line text-muted hover:bg-surface"}`}>{Number(g)}%</button>
          ))}
        </div>
      </div>

      {/* manufacturer */}
      <div>
        <label className="label">Manufacturer</label>
        <select className="input py-2 text-sm" value={manu} onChange={(e) => setManu(e.target.value ? Number(e.target.value) : "")}>
          <option value="">All manufacturers</option>
          {manus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* brand */}
      <div>
        <label className="label">Brand</label>
        <select className="input py-2 text-sm" value={brand} onChange={(e) => setBrand(e.target.value ? Number(e.target.value) : "")}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
    </div>
  );
}

function CatRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition group ${active ? "bg-maroon-600 text-white font-semibold shadow-glow-maroon" : "text-ink hover:bg-surface"}`}>
      <ChevronRight size={14} className={active ? "text-white" : "text-faint group-hover:translate-x-0.5 transition-transform"} />
      <span className="truncate">{label}</span>
      <span className={`ml-auto text-xs ${active ? "text-white/80" : "text-faint"}`}>{count}</span>
    </button>
  );
}
