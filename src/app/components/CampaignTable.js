"use client";

import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Filter, ArrowUpDown, Search, Download, Plus, 
  MoreHorizontal, Play, Square, Trash2, Calendar, CheckCircle2 
} from "lucide-react";

const STATUS_MAP = {
  P: { label: "Pending", style: "bg-status-pending/10 text-status-pending border-status-pending/20" },
  R: { label: "Running", style: "bg-status-running/10 text-status-running border-status-running/20 animate-pulse-soft" },
  D: { label: "Done", style: "bg-status-done/10 text-status-done border-status-done/20" },
  E: { label: "Error", style: "bg-status-error/10 text-status-error border-status-error/20" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });
}

export default function CampaignTable({ campaigns, onAdd, onSelect, onDelete, onTrigger, onStop, initialSearch }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState(initialSearch || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DESC"); // DESC or ASC based on date
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortOrder]);

  const filteredAndSortedCampaigns = useMemo(() => {
    let result = campaigns;

    // Filter by Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        (c.campaign_name || "").toLowerCase().includes(q) || 
        (c.search_query || "").toLowerCase().includes(q)
      );
    }

    // Filter by Status
    if (statusFilter !== "ALL") {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sort by Date
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.created_date || a.scheduled_time || 0).getTime();
      const dateB = new Date(b.created_date || b.scheduled_time || 0).getTime();
      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [campaigns, search, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCampaigns.length / pageSize));
  const paginatedCampaigns = filteredAndSortedCampaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const headers = ["ID", "Campaign Name", "Search Query", "Lead Limit", "Status", "Scheduled Time", "Completed Date"];
    const rows = filteredAndSortedCampaigns.map(c => [
      c.id, 
      c.campaign_name || '', 
      c.search_query || '', 
      c.lead_limit || 5, 
      STATUS_MAP[c.status]?.label || "Pending",
      c.scheduled_time || "",
      c.completed_date || ""
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaigns");
    XLSX.writeFile(workbook, "campaigns_export.xlsx");
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(campaigns.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col mt-6">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors"
            />
          </div>
          
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover outline-none bg-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="P">Pending</option>
              <option value="R">Running</option>
              <option value="D">Done</option>
              <option value="E">Error</option>
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover outline-none bg-transparent"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover"
          >
            <Download className="w-4 h-4 text-text-muted" /> Export
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-text-muted">
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-border-subtle text-accent focus:ring-accent"
                  checked={filteredAndSortedCampaigns.length > 0 && selectedIds.length === filteredAndSortedCampaigns.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 font-medium">Campaign</th>
              <th className="p-4 font-medium">Limit</th>
              <th className="p-4 font-medium">Scheduled</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-center w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-secondary">
            {paginatedCampaigns.map((c) => {
              const status = STATUS_MAP[c.status] || STATUS_MAP.P;
              const isSelected = selectedIds.includes(c.id);
              
              return (
                <tr 
                  key={c.id} 
                  className={`hover:bg-surface transition-colors cursor-pointer ${isSelected ? "bg-accent/5" : ""}`}
                  onClick={() => onSelect(c)}
                >
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-border-subtle text-accent focus:ring-accent"
                      checked={isSelected}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">{c.campaign_name}</span>
                      <span className="text-xs text-text-muted font-mono mt-0.5">{c.search_query}</span>
                    </div>
                  </td>
                  <td className="p-4">{c.lead_limit || 5} leads</td>
                  <td className="p-4 text-xs">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Calendar className="w-3 h-3" /> {formatDate(c.scheduled_time)}
                    </div>
                    {c.completed_date && (
                      <div className="flex items-center gap-1.5 text-text-muted mt-1">
                        <CheckCircle2 className="w-3 h-3 text-status-done" /> {formatDate(c.completed_date)}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${status.style}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      {c.status === "R" || c.status === "P" ? (
                        <button 
                          className="p-1.5 text-text-muted hover:text-status-error transition-colors rounded-md hover:bg-status-error/10"
                          title="Stop Campaign"
                          onClick={() => onStop(c.id)}
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          className="p-1.5 text-text-muted hover:text-accent transition-colors rounded-md hover:bg-surface-hover"
                          title="Force Run"
                          onClick={() => onTrigger(c.id)}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        className="p-1.5 text-text-muted hover:text-status-error transition-colors rounded-md hover:bg-status-error/10"
                        title="Delete"
                        onClick={() => onDelete(c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-md hover:bg-surface-hover hidden md:block">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedCampaigns.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-text-muted">
                  No campaigns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span>Showing {paginatedCampaigns.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredAndSortedCampaigns.length)} of {filteredAndSortedCampaigns.length} items</span>
        </div>
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
