import { useFetch } from "../lib/useFetch";
import { Async, PageHeader, Card } from "../components/ui";

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
                <Card key={cat} className="p-5">
                  <h3 className="font-semibold text-ink capitalize mb-3">{cat}</h3>
                  <div className="divide-y divide-line">
                    {items.map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-ink">{s.key}</div>
                          <div className="text-xs text-muted">{s.description}</div>
                        </div>
                        <code className="text-sm bg-surface rounded-lg px-2.5 py-1 text-muted whitespace-nowrap">{s.value}</code>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          );
        }}
      </Async>
    </div>
  );
}
