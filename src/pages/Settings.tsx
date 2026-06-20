import { useFetch } from "../lib/useFetch";
import { Async, PageHeader } from "../components/ui";

interface Setting { key: string; value: string; category: string; description: string; }

export default function Settings() {
  const state = useFetch<Setting[]>("/settings");
  return (
    <div>
      <PageHeader title="Settings" subtitle="Application configuration" />
      <Async state={state} empty="No settings.">
        {(rows) => {
          const byCat = rows.reduce<Record<string, Setting[]>>((acc, s) => {
            (acc[s.category] = acc[s.category] || []).push(s);
            return acc;
          }, {});
          return (
            <div className="space-y-5">
              {Object.entries(byCat).map(([cat, items]) => (
                <div key={cat} className="card p-5">
                  <h3 className="font-semibold text-slate-700 capitalize mb-3">{cat}</h3>
                  <div className="divide-y divide-slate-100">
                    {items.map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-2.5">
                        <div>
                          <div className="text-sm font-medium text-slate-700">{s.key}</div>
                          <div className="text-xs text-slate-400">{s.description}</div>
                        </div>
                        <code className="text-sm bg-slate-50 rounded px-2 py-1 text-slate-600">{s.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      </Async>
    </div>
  );
}
