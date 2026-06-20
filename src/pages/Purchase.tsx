import { ShoppingBag, Truck, ClipboardCheck, PackagePlus } from "lucide-react";
import { PageHeader, Card } from "../components/ui";

export default function Purchase() {
  return (
    <div>
      <PageHeader title="Purchase" subtitle="Procurement & supplier purchase orders" />
      <Card className="p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-maroon-500/10 text-maroon-600 grid place-items-center mx-auto">
          <ShoppingBag size={32} />
        </div>
        <h3 className="text-xl font-bold text-ink mt-4">Purchase module — coming soon</h3>
        <p className="text-muted mt-2 max-w-lg mx-auto text-sm leading-relaxed">
          Raise supplier purchase orders, receive stock into batches (GRN), and reconcile
          purchase invoices. Inventory and FEFO batches are already live under the Inventory module.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto text-left">
          <Tile icon={<ClipboardCheck size={18} />} title="Purchase Orders" sub="Raise & approve POs" />
          <Tile icon={<Truck size={18} />} title="Goods Receipt" sub="Receive into batches" />
          <Tile icon={<PackagePlus size={18} />} title="Supplier Invoices" sub="Match & reconcile" />
        </div>
      </Card>
    </div>
  );
}

function Tile({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="h-9 w-9 rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-400 grid place-items-center">{icon}</div>
      <div className="mt-3 font-semibold text-ink text-sm">{title}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
