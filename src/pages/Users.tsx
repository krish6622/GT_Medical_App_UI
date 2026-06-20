import { UserX } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { useAuth } from "../lib/auth";
import { Async, Badge, PageHeader } from "../components/ui";
import { DataTable, Column } from "../components/DataTable";
import type { Page, UserOut } from "../lib/types";

export default function Users() {
  const { can } = useAuth();
  const state = useFetch<Page<UserOut>>("/users?page_size=200");

  async function deactivate(u: UserOut) {
    if (!confirm(`Deactivate ${u.full_name}?`)) return;
    try { await api.post(`/users/${u.id}/deactivate`); state.reload(); }
    catch (e) { alert(apiError(e)); }
  }

  const columns: Column<UserOut>[] = [
    { key: "full_name", header: "Name", render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-navy-600 to-navy-900 text-white grid place-items-center text-xs font-semibold">{u.full_name?.[0]}</div>
          <span className="font-medium text-ink">{u.full_name}</span>
        </div>
      ) },
    { key: "email", header: "Email", render: (u) => <span className="text-muted">{u.email}</span> },
    { key: "mobile", header: "Mobile", render: (u) => <span className="text-muted">{u.mobile || "—"}</span> },
    { key: "customer_id", header: "Type", value: (u) => (u.customer_id ? "Pharmacy" : "Staff"),
      render: (u) => <span className="chip bg-navy-500/10 text-navy-600 dark:text-navy-300">{u.customer_id ? "Pharmacy" : "Staff"}</span> },
    { key: "status", header: "Status", render: (u) => <Badge status={u.status} /> },
    { key: "_actions", header: "", sortable: false, hideable: false, align: "right", render: (u) =>
        can("user:manage") && u.status === "ACTIVE" ? (
          <button className="btn-icon h-8 w-8 hover:text-rose-500" onClick={(e) => { e.stopPropagation(); deactivate(u); }} title="Deactivate"><UserX size={16} /></button>
        ) : null },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage platform users and access" />
      <Async state={state} empty="No users found.">
        {(data) => <DataTable columns={columns} rows={data.items} rowKey={(u) => u.id} exportName="users" searchPlaceholder="Search users…" />}
      </Async>
    </div>
  );
}
