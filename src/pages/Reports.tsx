import { useFetch } from "../lib/useFetch";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { Async, PageHeader, StatCard, Card } from "../components/ui";
import { Download, IndianRupee, Receipt, Percent } from "lucide-react";

export default function Reports() {
  const sales = useFetch<any>("/reports/sales");
  const gst = useFetch<any>("/reports/gst");
  const outstanding = useFetch<any>("/reports/outstanding");

  async function exportCsv(path: string, filename: string) {
    const res = await api.get(path, { responseType: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(res.data);
    a.download = filename;
    a.click();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Sales, GST and outstanding summaries" />

      <Async state={sales}>
        {(d) => (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Sales" value={inr(d.summary.total)} tone="success" icon={<IndianRupee size={20} />} />
            <StatCard label="Invoices" value={d.summary.count} tone="accent" icon={<Receipt size={20} />} />
            <StatCard label="Tax Collected" value={inr(d.summary.tax)} tone="warning" icon={<Percent size={20} />} />
          </div>
        )}
      </Async>

      <div className="grid gap-6 lg:grid-cols-2">
        <Async state={gst}>
          {(g) => (
            <Card className="p-5">
              <h3 className="font-semibold text-ink mb-4">GST Summary</h3>
              <Line label="Taxable Value" value={inr(g.taxable_value)} />
              <Line label="CGST" value={inr(g.cgst)} />
              <Line label="SGST" value={inr(g.sgst)} />
              <Line label="IGST" value={inr(g.igst)} />
              <div className="border-t border-line my-2" />
              <Line label="Total Tax" value={inr(g.total_tax)} bold />
            </Card>
          )}
        </Async>

        <Async state={outstanding}>
          {(o) => (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink">Outstanding · {inr(o.total_outstanding)}</h3>
                <button className="btn-ghost py-1.5" onClick={() => exportCsv("/reports/outstanding?export=true", "outstanding.csv")}>
                  <Download size={15} /> CSV
                </button>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {o.rows.length === 0 && <p className="text-sm text-faint">No outstanding balances.</p>}
                {o.rows.map((r: any) => <Line key={r.customer_code} label={r.pharmacy_name} value={inr(r.outstanding)} />)}
              </div>
            </Card>
          )}
        </Async>
      </div>
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${bold ? "font-bold text-ink" : "text-sm text-muted"}`}>
      <span className="truncate pr-2">{label}</span><span className={bold ? "" : "text-ink"}>{value}</span>
    </div>
  );
}
