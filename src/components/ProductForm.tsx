import { useEffect, useState } from "react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { Drawer } from "./Drawer";
import type { Named, Product } from "../lib/types";

const UOMS = ["STRIP", "BOX", "BOTTLE", "VIAL", "TUBE", "SACHET", "UNIT"];

const blank = {
  name: "", generic_name: "", description: "", category_id: "", manufacturer_id: "", brand_id: "",
  hsn_code: "", gst_percent: "12", uom: "STRIP", mrp: "", wholesale_rate: "", purchase_rate: "",
  reorder_level: "20", is_active: true,
};

export function ProductForm({
  open, onClose, onSaved, product,
}: {
  open: boolean; onClose: () => void; onSaved: () => void; product?: Product | null;
}) {
  const cats = useFetch<Named[]>(open ? "/catalog/categories" : null, [open]);
  const mans = useFetch<Named[]>(open ? "/catalog/manufacturers" : null, [open]);
  const brands = useFetch<Named[]>(open ? "/catalog/brands" : null, [open]);
  const [form, setForm] = useState<any>(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name, generic_name: product.generic_name ?? "", description: product.description ?? "",
        category_id: product.category_id ?? "", manufacturer_id: product.manufacturer_id ?? "",
        brand_id: product.brand_id ?? "", hsn_code: product.hsn_code ?? "",
        gst_percent: String(product.gst_percent), uom: product.uom, mrp: String(product.mrp),
        wholesale_rate: String(product.wholesale_rate), purchase_rate: String(product.purchase_rate),
        reorder_level: String(product.reorder_level), is_active: product.is_active,
      });
    } else setForm(blank);
    setError(null);
  }, [open, product]);

  const set = (k: string) => (e: any) =>
    setForm((f: any) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit() {
    setBusy(true); setError(null);
    const payload: any = {
      name: form.name, generic_name: form.generic_name || null, description: form.description,
      category_id: form.category_id ? Number(form.category_id) : null,
      manufacturer_id: form.manufacturer_id ? Number(form.manufacturer_id) : null,
      brand_id: form.brand_id ? Number(form.brand_id) : null,
      hsn_code: form.hsn_code || null, gst_percent: Number(form.gst_percent), uom: form.uom,
      mrp: Number(form.mrp || 0), wholesale_rate: Number(form.wholesale_rate || 0),
      purchase_rate: Number(form.purchase_rate || 0), reorder_level: Number(form.reorder_level || 0),
      is_active: form.is_active,
    };
    try {
      if (product) await api.put(`/products/${product.id}`, payload);
      else await api.post("/products", payload);
      onSaved(); onClose();
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }

  return (
    <Drawer
      open={open} onClose={onClose}
      title={product ? "Edit Product" : "Add Product"}
      subtitle={product ? product.product_code : "Create a new catalogue item"}
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy || !form.name} onClick={submit}>
            {busy ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      }
    >
      {error && <div className="rounded-xl bg-rose-500/10 text-rose-500 text-sm px-3.5 py-2.5 mb-4">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <F label="Product Name *" className="col-span-2"><input className="input" value={form.name} onChange={set("name")} /></F>
        <F label="Generic Name"><input className="input" value={form.generic_name} onChange={set("generic_name")} /></F>
        <F label="HSN Code"><input className="input" value={form.hsn_code} onChange={set("hsn_code")} /></F>
        <F label="Category">
          <select className="input" value={form.category_id} onChange={set("category_id")}>
            <option value="">—</option>
            {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </F>
        <F label="Manufacturer">
          <select className="input" value={form.manufacturer_id} onChange={set("manufacturer_id")}>
            <option value="">—</option>
            {mans.data?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </F>
        <F label="UOM">
          <select className="input" value={form.uom} onChange={set("uom")}>
            {UOMS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </F>
        <F label="GST %"><input className="input" type="number" value={form.gst_percent} onChange={set("gst_percent")} /></F>
        <F label="MRP (₹)"><input className="input" type="number" value={form.mrp} onChange={set("mrp")} /></F>
        <F label="Wholesale Rate (₹)"><input className="input" type="number" value={form.wholesale_rate} onChange={set("wholesale_rate")} /></F>
        <F label="Purchase Rate (₹)"><input className="input" type="number" value={form.purchase_rate} onChange={set("purchase_rate")} /></F>
        <F label="Reorder Level"><input className="input" type="number" value={form.reorder_level} onChange={set("reorder_level")} /></F>
        <F label="Description" className="col-span-2"><textarea className="input" rows={2} value={form.description} onChange={set("description")} /></F>
        <label className="col-span-2 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={form.is_active} onChange={set("is_active")} /> Active (visible to pharmacies)
        </label>
      </div>
    </Drawer>
  );
}

export function BatchForm({
  open, onClose, onSaved, product,
}: {
  open: boolean; onClose: () => void; onSaved: () => void; product: Product | null;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ batch_number: "", manufacturing_date: today, expiry_date: "", quantity: "100", purchase_price: "", sale_price: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setForm((f) => ({
        ...f, batch_number: "", expiry_date: "",
        purchase_price: String(product.purchase_rate), sale_price: String(product.wholesale_rate),
      }));
      setError(null);
    }
  }, [open, product]);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!product) return;
    setBusy(true); setError(null);
    try {
      await api.post("/inventory/batches", {
        product_id: product.id, batch_number: form.batch_number,
        manufacturing_date: form.manufacturing_date || null, expiry_date: form.expiry_date,
        quantity: Number(form.quantity || 0), purchase_price: Number(form.purchase_price || 0),
        sale_price: Number(form.sale_price || 0),
      });
      onSaved(); onClose();
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  }

  return (
    <Drawer
      open={open} onClose={onClose}
      title="Add Stock Batch" subtitle={product ? product.name : ""}
      width="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy || !form.batch_number || !form.expiry_date} onClick={submit}>
            {busy ? "Adding…" : "Add to inventory"}
          </button>
        </div>
      }
    >
      {error && <div className="rounded-xl bg-rose-500/10 text-rose-500 text-sm px-3.5 py-2.5 mb-4">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <F label="Batch Number *" className="col-span-2"><input className="input" value={form.batch_number} onChange={set("batch_number")} /></F>
        <F label="Mfg Date"><input className="input" type="date" value={form.manufacturing_date} onChange={set("manufacturing_date")} /></F>
        <F label="Expiry Date *"><input className="input" type="date" value={form.expiry_date} onChange={set("expiry_date")} /></F>
        <F label="Quantity"><input className="input" type="number" value={form.quantity} onChange={set("quantity")} /></F>
        <F label="Purchase Price (₹)"><input className="input" type="number" value={form.purchase_price} onChange={set("purchase_price")} /></F>
        <F label="Sale Price (₹)" className="col-span-2"><input className="input" type="number" value={form.sale_price} onChange={set("sale_price")} /></F>
      </div>
    </Drawer>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
