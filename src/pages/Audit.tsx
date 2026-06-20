import { useFetch } from "../lib/useFetch";
import { dateTime } from "../lib/format";
import { Async, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";

interface Log {
  id: number; actor: string; action: string; entity_type: string;
  entity_id: number | null; summary: string; created_at: string;
}

export default function Audit() {
  const state = useFetch<{ items: Log[] }>("/audit-logs?page_size=200");
  const columns: Column<Log>[] = [
    { key: "created_at", header: "When", value: (l) => l.created_at, render: (l) => <span className="text-muted whitespace-nowrap">{dateTime(l.created_at)}</span> },
    { key: "actor", header: "Actor", render: (l) => <span className="font-medium text-ink">{l.actor}</span> },
    { key: "action", header: "Action", render: (l) => <span className="chip bg-navy-500/10 text-navy-600 dark:text-navy-300">{l.action}</span> },
    { key: "entity_type", header: "Entity", render: (l) => <span className="text-muted">{l.entity_type}{l.entity_id ? `#${l.entity_id}` : ""}</span> },
    { key: "summary", header: "Summary", render: (l) => <span className="text-ink">{l.summary}</span> },
  ];
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Immutable trail of system actions" />
      <Async state={state} empty="No audit entries.">
        {(data) => <DataTable columns={columns} rows={data.items} rowKey={(l) => l.id} exportName="audit-logs" searchPlaceholder="Search audit logs…" pageSize={15} />}
      </Async>
    </div>
  );
}
