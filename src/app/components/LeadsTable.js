"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Download, Search, User, Users } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default function LeadsTable({ leads, initialSearch }) {
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [search,       setSearch]       = useState(initialSearch || "");
  const [currentPage,  setCurrentPage]  = useState(1);
  const pageSize = 10;

  useEffect(() => { if (initialSearch) setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const toggleSelectAll = (e) =>
    setSelectedIds(e.target.checked ? leads.map((l) => l.id) : []);
  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const filtered = leads.filter((l) =>
    (l.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.campaign_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.mobile || "").includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const headers = ["ID", "Customer Name", "Mobile", "Email", "Address", "Campaign", "Captured Date"];
    const rows = filtered.map((l) => [
      l.id, l.customer_name || "", l.mobile || "", l.email || "",
      l.address || "", l.campaign_name || "", l.created_date || "",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads_export.xlsx");
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col">

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border-subtle flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors placeholder:text-text-muted"
          />
        </div>

        <div className="flex-1" />

        <span className="text-xs text-text-muted hidden sm:block">
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          Export
        </button>
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div className="overflow-x-auto table-scroll-x">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border-subtle bg-surface">
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  className="rounded border-border-subtle accent-amber-400"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Campaign</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Captured</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {paginated.map((l) => {
              const isSelected = selectedIds.includes(l.id);
              return (
                <tr key={l.id} className={`group hover:bg-surface-hover transition-colors ${isSelected ? "bg-accent/5" : ""}`}>
                  <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-border-subtle accent-amber-400"
                      checked={isSelected}
                      onChange={() => toggleSelect(l.id)}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-hover border border-border-subtle flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <span className="font-semibold text-[13px] text-text-primary">{l.customer_name || "Unknown User"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 text-xs text-text-muted">
                      {l.mobile  ? <span>📞 {l.mobile}</span>  : <span className="opacity-40">—</span>}
                      {l.address && <span className="truncate max-w-[180px]" title={l.address}>📍 {l.address}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-accent/10 text-amber-700 border border-accent/20">
                      {l.campaign_name || `Campaign #${l.campaign_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-text-muted">
                    {formatDate(l.created_date)}
                  </td>
                </tr>
              );
            })}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="5" className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-text-muted">
                    <Users className="w-10 h-10 opacity-25" />
                    <p className="text-sm">No leads found</p>
                    {search && (
                      <button onClick={() => setSearch("")} className="text-xs text-accent hover:underline">
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────── */}
      <div className="px-4 py-3 border-t border-border-subtle bg-surface flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
        <span>
          {filtered.length > 0
            ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`
            : "0 results"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary font-medium transition-colors"
          >
            Prev
          </button>
          <button className="w-8 h-8 rounded-lg bg-accent text-zinc-900 font-bold text-xs shadow-sm">
            {currentPage}
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary font-medium transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
