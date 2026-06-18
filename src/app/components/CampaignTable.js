"use client";

import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Filter, ArrowUpDown, Search, Download,
  MoreHorizontal, Play, Square, Trash2, Calendar,
  CheckCircle2, RotateCw, Package
} from "lucide-react";

const STATUS_MAP = {
  P: { label: "Pending", dot: "bg-status-pending",  badge: "bg-status-pending/10 text-status-pending  border-status-pending/25" },
  R: { label: "Running", dot: "bg-status-running",  badge: "bg-status-running/10  text-status-running  border-status-running/25  animate-pulse-soft" },
  D: { label: "Done",    dot: "bg-status-done",     badge: "bg-status-done/10    text-status-done     border-status-done/25" },
  E: { label: "Error",   dot: "bg-status-error",    badge: "bg-status-error/10   text-status-error    border-status-error/25" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function formatLocationTime(dateStr, timezoneName) {
  if (!dateStr) return "—";
  if (!timezoneName || timezoneName === "Unknown") return formatDate(dateStr);

  const REGIONS = {
    "India (IST)": 330,
    "UAE (GST)": 240,
    "Oman (GST)": 240,
    "Saudi Arabia (AST)": 180,
    "Qatar (AST)": 180,
    "Kuwait (AST)": 180,
    "Bahrain (AST)": 180,
    "UK (GMT/BST)": 0,
    "USA (EST)": -300,
  };

  const offset = REGIONS[timezoneName];
  if (offset === undefined) return formatDate(dateStr);

  const d = new Date(dateStr);
  const targetEpoch = d.getTime() + (offset * 60000);
  const targetDate = new Date(targetEpoch);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(targetDate.getUTCDate()).padStart(2, '0');
  const month = months[targetDate.getUTCMonth()];

  let hours = targetDate.getUTCHours();
  const minutes = String(targetDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;

  const exactTimeStr = `${month} ${day}, ${hours}:${minutes}${ampm}`;
  const countryName = timezoneName.split(' (')[0];

  return `${exactTimeStr} (${countryName})`;
}

export default function CampaignTable({
  campaigns, onSelect, onDelete, onTrigger, onStop, onRetry, initialSearch,
}) {
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [search,       setSearch]       = useState(initialSearch || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder,    setSortOrder]    = useState("DESC");
  const [currentPage,  setCurrentPage]  = useState(1);
  const pageSize = 10;

  useEffect(() => { if (initialSearch) setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, sortOrder]);

  const filtered = useMemo(() => {
    let r = campaigns;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((c) =>
        (c.campaign_name || "").toLowerCase().includes(q) ||
        (c.search_query  || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") r = r.filter((c) => c.status === statusFilter);
    return [...r].sort((a, b) => {
      const dA = new Date(a.created_date || a.scheduled_time || 0).getTime();
      const dB = new Date(b.created_date || b.scheduled_time || 0).getTime();
      return sortOrder === "DESC" ? dB - dA : dA - dB;
    });
  }, [campaigns, search, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const headers = ["ID", "Campaign Name", "Search Query", "Lead Limit", "Status", "Scheduled", "Completed"];
    const rows    = filtered.map((c) => [
      c.id, c.campaign_name || "", c.search_query || "",
      c.lead_limit || 5, STATUS_MAP[c.status]?.label || "Pending",
      c.scheduled_time || "", c.completed_date || "",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Campaigns");
    XLSX.writeFile(wb, "campaigns_export.xlsx");
  };

  const toggleSelectAll = (e) =>
    setSelectedIds(e.target.checked ? campaigns.map((c) => c.id) : []);
  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col">

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border-subtle flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search campaigns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors placeholder:text-text-muted"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-8 pr-7 py-2 border border-border-subtle rounded-lg text-sm text-text-secondary bg-surface hover:bg-surface-hover outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="P">Pending</option>
            <option value="R">Running</option>
            <option value="D">Done</option>
            <option value="E">Error</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none pl-8 pr-7 py-2 border border-border-subtle rounded-lg text-sm text-text-secondary bg-surface hover:bg-surface-hover outline-none cursor-pointer"
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Result count */}
        <span className="text-xs text-text-muted hidden sm:block">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>

        {/* Export */}
        <button
          onClick={handleExport}
          className="hidden md:flex items-center gap-2 px-3 py-2 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          Export
        </button>
      </div>

      {/* ── Table (horizontally scrollable on small screens) ── */}
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
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Campaign</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Limit</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Scheduled</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider text-center w-28">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {paginated.map((c, idx) => {
              const status     = STATUS_MAP[c.status] || STATUS_MAP.P;
              const isSelected = selectedIds.includes(c.id);
              return (
                <tr
                  key={c.id}
                  className={`group hover:bg-surface-hover transition-colors cursor-pointer ${isSelected ? "bg-accent/5" : ""}`}
                  onClick={() => onSelect(c)}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-border-subtle accent-amber-400"
                      checked={isSelected}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>

                  {/* Campaign info */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-text-primary text-[13px]">{c.campaign_name}</span>
                      <span className="text-[11px] text-text-muted font-mono">{c.search_query}</span>
                    </div>
                  </td>

                  {/* Lead limit */}
                  <td className="px-4 py-3.5 text-text-secondary text-[13px]">
                    {c.lead_limit || 5}
                    <span className="text-text-muted text-[11px] ml-0.5">leads</span>
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <div className="flex flex-col gap-0.5 w-full">
                          <span title="Your local time">{formatDate(c.scheduled_time)}</span>
                          {c.timezone && c.timezone !== "Unknown" && (
                            <span className="text-[10px] text-accent/80 font-medium">
                              ↳ {formatLocationTime(c.scheduled_time, c.timezone)}
                            </span>
                          )}
                        </div>
                      </div>
                      {c.completed_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-status-done">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {formatDate(c.completed_date)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${status.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.status === "R" || c.status === "P" ? (
                        <button
                          className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors"
                          title="Stop Campaign"
                          onClick={() => onStop(c.id)}
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      ) : c.status === "E" ? (
                        <button
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Retry"
                          onClick={() => onRetry(c.id)}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          className="p-1.5 rounded-lg text-text-muted hover:text-status-running hover:bg-status-running/10 transition-colors"
                          title="Force Run"
                          onClick={() => onTrigger(c.id)}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors"
                        title="Delete"
                        onClick={() => onDelete(c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-text-muted">
                    <Package className="w-10 h-10 opacity-25" />
                    <p className="text-sm">No campaigns found</p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="text-xs text-accent hover:underline"
                      >
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

      {/* ── Pagination ───────────────────────────────────── */}
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

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-text-muted select-none">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                    currentPage === item
                      ? "bg-accent text-zinc-900 shadow-sm"
                      : "border border-border-subtle hover:bg-surface-hover text-text-secondary"
                  }`}
                >
                  {item}
                </button>
              )
            )}

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
