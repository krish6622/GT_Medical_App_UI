import { useFetch } from "../lib/useFetch";
import { dateTime } from "../lib/format";
import { Async, PageHeader } from "../components/ui";

interface Log {
  id: number; actor: string; action: string; entity_type: string;
  entity_id: number | null; summary: string; created_at: string;
}

export default function Audit() {
  const state = useFetch<{ items: Log[] }>("/audit-logs?page_size=100");
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Immutable trail of system actions" />
      <Async state={state} empty="No audit entries.">
        {(data) => (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className="th">When</th><th className="th">Actor</th>
                  <th className="th">Action</th><th className="th">Entity</th><th className="th">Summary</th>
                </tr></thead>
                <tbody>
                  {data.items.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="td text-slate-500 whitespace-nowrap">{dateTime(l.created_at)}</td>
                      <td className="td">{l.actor}</td>
                      <td className="td"><span className="badge bg-slate-100 text-slate-600">{l.action}</span></td>
                      <td className="td text-slate-500">{l.entity_type}{l.entity_id ? `#${l.entity_id}` : ""}</td>
                      <td className="td text-slate-600">{l.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
