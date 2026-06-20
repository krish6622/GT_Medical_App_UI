import { ReactNode, useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, Download, Printer, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Check,
} from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number; // for sort / search / export
  align?: "left" | "right" | "center";
  sortable?: boolean;
  hideable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  title?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  onRowClick?: (row: T) => void;
  rightSlot?: ReactNode;
  exportName?: string;
}

function cellText<T>(col: Column<T>, row: T): string {
  if (col.value) return String(col.value(row));
  const raw = (row as any)[col.key];
  return raw == null ? "" : String(raw);
}

export function DataTable<T>({
  columns, rows, rowKey, title, searchPlaceholder = "Search…",
  pageSize = 10, selectable, bulkActions, onRowClick, rightSlot, exportName = "export",
}: Props<T>) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [chooser, setChooser] = useState(false);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const visibleCols = columns.filter((c) => !hidden.has(c.key));

  const filtered = useMemo(() => {
    let data = rows;
    if (q.trim()) {
      const needle = q.toLowerCase();
      data = data.filter((r) => columns.some((c) => cellText(c, r).toLowerCase().includes(needle)));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        data = [...data].sort((a, b) => {
          const av = col.value ? col.value(a) : (a as any)[col.key];
          const bv = col.value ? col.value(b) : (b as any)[col.key];
          const cmp = typeof av === "number" && typeof bv === "number"
            ? av - bv : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return data;
  }, [rows, q, sort, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);

  function toggleSort(key: string) {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }
  function exportCsv() {
    const cols = visibleCols;
    const header = cols.map((c) => `"${c.header}"`).join(",");
    const lines = filtered.map((r) => cols.map((c) => `"${cellText(c, r).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${exportName}.csv`;
    a.click();
  }
  const selectedRows = filtered.filter((r) => selected.has(rowKey(r)));
  const clearSel = () => setSelected(new Set());
  function toggleAll() {
    if (pageRows.every((r) => selected.has(rowKey(r)))) {
      const next = new Set(selected);
      pageRows.forEach((r) => next.delete(rowKey(r)));
      setSelected(next);
    } else {
      const next = new Set(selected);
      pageRows.forEach((r) => next.add(rowKey(r)));
      setSelected(next);
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-line">
        {title && <span className="font-semibold text-ink mr-1 px-1">{title}</span>}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            className="input pl-9 py-2"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
        {rightSlot}
        <div className="relative">
          <button className="btn-ghost py-2" onClick={() => setChooser((v) => !v)}>
            <SlidersHorizontal size={15} /> Columns
          </button>
          {chooser && (
            <div className="absolute right-0 mt-2 w-52 card p-2 z-20 animate-scale-in" onMouseLeave={() => setChooser(false)}>
              {columns.filter((c) => c.hideable !== false).map((c) => (
                <button
                  key={c.key}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-surface text-left"
                  onClick={() => {
                    const next = new Set(hidden);
                    next.has(c.key) ? next.delete(c.key) : next.add(c.key);
                    setHidden(next);
                  }}
                >
                  <span className={`h-4 w-4 rounded border grid place-items-center ${hidden.has(c.key) ? "border-line" : "bg-accent-500 border-accent-500 text-white"}`}>
                    {!hidden.has(c.key) && <Check size={12} />}
                  </span>
                  {c.header}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-ghost py-2" onClick={exportCsv}><Download size={15} /> Excel</button>
        <button className="btn-ghost py-2" onClick={() => window.print()}><Printer size={15} /> PDF</button>
      </div>

      {/* Bulk bar */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-accent-500/10 border-b border-line text-sm animate-fade-in">
          <span className="font-medium text-accent-700 dark:text-accent-300">{selectedRows.length} selected</span>
          <div className="flex items-center gap-2">{bulkActions?.(selectedRows, clearSel)}</div>
          <button className="text-muted hover:text-ink ml-auto" onClick={clearSel}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface/60 sticky top-0 z-10 backdrop-blur">
            <tr>
              {selectable && (
                <th className="th w-10">
                  <input type="checkbox"
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.has(rowKey(r)))}
                    onChange={toggleAll} />
                </th>
              )}
              {visibleCols.map((c) => (
                <th key={c.key} className={`th ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""} ${c.sortable !== false ? "cursor-pointer select-none hover:text-ink" : ""}`}
                  onClick={() => c.sortable !== false && toggleSort(c.key)}>
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {sort?.key === c.key && (sort.dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr><td className="td text-center text-faint py-10" colSpan={visibleCols.length + (selectable ? 1 : 0)}>No matching records.</td></tr>
            )}
            {pageRows.map((r) => (
              <tr key={rowKey(r)} className={`row-hover ${onRowClick ? "cursor-pointer" : ""}`} onClick={() => onRowClick?.(r)}>
                {selectable && (
                  <td className="td" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(rowKey(r))}
                      onChange={() => {
                        const next = new Set(selected);
                        next.has(rowKey(r)) ? next.delete(rowKey(r)) : next.add(rowKey(r));
                        setSelected(next);
                      }} />
                  </td>
                )}
                {visibleCols.map((c) => (
                  <td key={c.key} className={`td ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}`}>
                    {c.render ? c.render(r) : cellText(c, r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / pagination */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line text-sm text-muted">
        <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1">
          <button className="btn-icon" disabled={current <= 1} onClick={() => setPage(current - 1)}><ChevronLeft size={16} /></button>
          <span className="px-2">Page {current} / {pages}</span>
          <button className="btn-icon" disabled={current >= pages} onClick={() => setPage(current + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
