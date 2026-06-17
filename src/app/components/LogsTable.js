"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Download, Filter, Search, Terminal } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}

export default function LogsTable({ logs, initialSearch }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState(initialSearch || "");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredLogs = logs.filter(l => 
    (l.log_message || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.campaign_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col mt-6">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const headers = ["ID", "Timestamp", "Campaign Name", "Message"];
              const rows = filteredLogs.map(l => [
                l.id,
                l.created_date || '',
                l.campaign_name || '',
                l.log_message || ''
              ]);
              const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
              XLSX.writeFile(workbook, "logs_export.xlsx");
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover"
          >
            <Download className="w-4 h-4 text-text-muted" /> Export Logs
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-text-muted">
              <th className="p-4 font-medium w-48">Timestamp</th>
              <th className="p-4 font-medium w-48">Campaign</th>
              <th className="p-4 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-secondary">
            {paginatedLogs.map((l) => {
              const isSelected = selectedIds.includes(l.id);
              return (
                <tr key={l.id} className="hover:bg-surface transition-colors">
                  <td className="p-4 text-xs font-mono text-text-muted">
                    {formatDate(l.created_date)}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-surface border border-border-subtle text-accent">
                      {l.campaign_name || `Campaign #${l.campaign_id}`}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <Terminal className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      <span className="text-text-primary font-mono text-xs leading-relaxed">{l.log_message}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedLogs.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-text-muted">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between text-xs text-text-muted">
        <span>Showing {paginatedLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs</span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded border border-border-subtle hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary font-medium"
          >
            Previous
          </button>
          <button className="px-3 py-1.5 rounded bg-accent text-white font-medium">{currentPage}</button>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded border border-border-subtle hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
