import { useState } from "react";
import { Pencil, Check, X, Lock } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useCan } from "../lib/auth";
import { Async, PageHeader, Card } from "../components/ui";

interface Setting { key: string; value: string; category: string; description: string; }

export default function Settings() {
  const can = useCan();
  const canEdit = can("settings:update");
  const state = useFetch<Setting[]>("/settings");

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function flash(msg: string, ok = true) { setToast({ msg, ok }); setTimeout(() => setToast(null), 2200); }
  function start(s: Setting) { setEditing(s.key); setDraft(s.value); }
  function cancel() { setEditing(null); setDraft(""); }

  async function save(s: Setting) {
    if (draft === s.value) { cancel(); return; }
    setBusy(true);
    try {
      await api.put(`/settings/${encodeURIComponent(s.key)}`, null, { params: { value: draft } });
      state.setData((state.data ?? []).map((x) => (x.key === s.key ? { ...x, value: draft } : x)));
      flash(`Updated ${s.key}`);
      setEditing(null);
    } catch (e) { flash(apiError(e), false); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Application configuration"
        action={!canEdit && <span className="chip bg-surface text-muted"><Lock size={12} /> Read only</span>}
      />
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
                    {items.map((s) => {
                      const isEditing = editing === s.key;
                      const isBool = s.value === "true" || s.value === "false";
                      return (
                        <div key={s.key} className="flex items-center justify-between py-3 gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-ink">{s.key}</div>
                            <div className="text-xs text-muted">{s.description}</div>
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 shrink-0">
                              {isBool ? (
                                <select className="input w-auto py-1.5 text-sm" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus>
                                  <option value="true">true</option>
                                  <option value="false">false</option>
                                </select>
                              ) : (
                                <input className="input w-56 py-1.5 text-sm" value={draft} autoFocus
                                  onChange={(e) => setDraft(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") save(s); if (e.key === "Escape") cancel(); }} />
                              )}
                              <button className="btn-icon h-8 w-8 text-emerald-600 hover:bg-emerald-500/10" disabled={busy} onClick={() => save(s)} title="Save"><Check size={16} /></button>
                              <button className="btn-icon h-8 w-8 hover:text-rose-500" disabled={busy} onClick={cancel} title="Cancel"><X size={16} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 shrink-0">
                              <code className="text-sm bg-surface rounded-lg px-2.5 py-1 text-muted whitespace-nowrap max-w-[280px] truncate">{s.value}</code>
                              {canEdit && (
                                <button className="btn-icon h-8 w-8" onClick={() => start(s)} title="Edit"><Pencil size={14} /></button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          );
        }}
      </Async>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] rounded-xl text-white text-sm px-4 py-2.5 shadow-pop flex items-center gap-2 animate-scale-in ${toast.ok ? "bg-emerald-600" : "bg-rose-600"}`}>
          {toast.ok ? <Check size={16} /> : <X size={16} />} {toast.msg}
        </div>
      )}
    </div>
  );
}
