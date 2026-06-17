"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Download, Filter, Layout, ArrowUpDown, Search, User } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });
}

export default function LeadsTable({ leads, initialSearch }) {
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

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(leads.map(l => l.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const filteredLeads = leads.filter(l => 
    (l.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.campaign_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.mobile || "").includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col mt-6">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const headers = ["ID", "Customer Name", "Mobile", "Email", "Address", "Campaign", "Captured Date"];
              const rows = filteredLeads.map(l => [
                l.id,
                l.customer_name || '',
                l.mobile || '',
                l.email || '',
                l.address || '',
                l.campaign_name || '',
                l.created_date || ''
              ]);
              const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
              XLSX.writeFile(workbook, "leads_export.xlsx");
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-surface-hover"
          >
            <Download className="w-4 h-4 text-text-muted" /> Export Leads
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
                  checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Contact Details</th>
              <th className="p-4 font-medium">Source Campaign</th>
              <th className="p-4 font-medium">Captured Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-secondary">
            {paginatedLeads.map((l) => {
              const isSelected = selectedIds.includes(l.id);
              return (
                <tr 
                  key={l.id} 
                  className={`hover:bg-surface transition-colors cursor-pointer ${isSelected ? "bg-accent/5" : ""}`}
                >
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-border-subtle text-accent focus:ring-accent"
                      checked={isSelected}
                      onChange={() => toggleSelect(l.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border-subtle flex items-center justify-center text-text-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-text-primary">{l.customer_name || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {l.mobile ? <span className="flex items-center gap-1">📞 {l.mobile}</span> : <span className="text-text-muted">—</span>}
                      {l.address && <span className="flex items-center gap-1 text-text-muted truncate max-w-[200px]" title={l.address}>📍 {l.address}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-surface border border-border-subtle text-text-secondary">
                      {l.campaign_name || `Campaign #${l.campaign_id}`}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-text-muted">
                    {formatDate(l.created_date)}
                  </td>
                </tr>
              );
            })}
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-text-muted">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between text-xs text-text-muted">
        <span>Showing {paginatedLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads</span>
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
