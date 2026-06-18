"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Download, Search, Terminal, ScrollText } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function LogsTable({ logs, initialSearch }) {
  const [search,      setSearch]      = useState(initialSearch || "");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => { if (initialSearch) setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const filtered = logs.filter((l) =>
    (l.log_message   || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.campaign_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const headers = ["ID", "Timestamp", "Campaign", "Message"];
    const rows    = filtered.map((l) => [l.id, l.created_date || "", l.campaign_name || "", l.log_message || ""]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, "logs_export.xlsx");
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col">

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border-subtle flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors placeholder:text-text-muted"
          />
        </div>

        <div className="flex-1" />
        <span className="text-xs text-text-muted hidden sm:block">
          {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
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
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface">
              <th className="px-4 py-3 w-40 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 w-44 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Campaign</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Message</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {paginated.map((l) => (
              <tr key={l.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3.5 text-[11px] font-mono text-text-muted whitespace-nowrap">
                  {formatDate(l.created_date)}
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-amber-700 border border-accent/20 whitespace-nowrap">
                    {l.campaign_name || `#${l.campaign_id}`}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <Terminal className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                    <span className="text-xs text-text-primary font-mono leading-relaxed break-words min-w-0">
                      {l.log_message}
                    </span>
                  </div>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="3" className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-text-muted">
                    <ScrollText className="w-10 h-10 opacity-25" />
                    <p className="text-sm">No logs found</p>
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
