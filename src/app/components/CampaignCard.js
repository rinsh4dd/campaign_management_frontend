"use client";

import { Trash2, Calendar, CheckCircle2 } from "lucide-react";

const STATUS_MAP = {
  P: { label: "Pending", color: "bg-status-pending", text: "text-status-pending" },
  R: { label: "Running", color: "bg-status-running", text: "text-status-running" },
  D: { label: "Done", color: "bg-status-done", text: "text-status-done" },
  E: { label: "Error", color: "bg-status-error", text: "text-status-error" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CampaignCard({ campaign, onSelect, onDelete }) {
  const status = STATUS_MAP[campaign.status] || STATUS_MAP.P;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      onClick={() => onSelect(campaign)}
      className="w-full text-left group rounded-xl border border-border-subtle bg-surface-elevated p-5 transition-all duration-200 hover:border-border-active hover:shadow-sm cursor-pointer relative"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-text-primary text-sm font-medium truncate">
            {campaign.campaign_name}
          </p>
          <p className="text-text-muted text-xs mt-1.5 truncate">
            <span className="font-mono bg-surface border border-border-subtle px-1.5 py-0.5 rounded text-[10px] mr-2">
              Query
            </span>
            {campaign.search_query}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${status.color} ${campaign.status === "R" ? "animate-pulse-soft" : ""}`} />
            <span className={`text-[10px] font-medium tracking-wider uppercase ${status.text}`}>
              {status.label}
            </span>
          </div>
          <span className="text-[10px] text-text-muted bg-surface border border-border-subtle px-1.5 py-0.5 rounded">
            Limit: {campaign.lead_limit || 5}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[11px] text-text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>Scheduled: {formatDate(campaign.scheduled_time)}</span>
          </div>
          {campaign.completed_date && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-status-done" />
              <span>Completed: {formatDate(campaign.completed_date)}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleDeleteClick}
          className="text-text-muted hover:text-status-error hover:bg-status-error/10 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Delete Campaign"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
