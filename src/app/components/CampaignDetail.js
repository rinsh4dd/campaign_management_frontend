"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  X, Users, ScrollText, Phone, Mail, MapPin, RefreshCw,
  Calendar, CheckCircle2, Hash
} from "lucide-react";
import { CampaignService } from "../services/api";

const STATUS_MAP = {
  P: { label: "Pending", text: "text-status-pending", bg: "bg-status-pending/10", dot: "bg-status-pending" },
  R: { label: "Running", text: "text-status-running", bg: "bg-status-running/10", dot: "bg-status-running animate-pulse-soft" },
  D: { label: "Done",    text: "text-status-done",    bg: "bg-status-done/10",    dot: "bg-status-done" },
  E: { label: "Error",   text: "text-status-error",   bg: "bg-status-error/10",   dot: "bg-status-error" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
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

function InfoRow({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 text-xs text-text-muted">
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-muted/70" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

export default function CampaignDetail({ campaign, onClose }) {
  const [tab,     setTab]     = useState("leads");
  const [leads,   setLeads]   = useState([]);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef   = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!campaign) return;

    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    gsap.fromTo(panelRef.current,   { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 0.32, ease: "power3.out" });

    (async () => {
      setLoading(true);
      try {
        const [leadsRes, logsRes] = await Promise.all([
          CampaignService.getCampaignLeads(campaign.id).catch(() => ({ data: [] })),
          CampaignService.getCampaignLogs(campaign.id).catch(() => ({ data: [] })),
        ]);
        setLeads(leadsRes.data || []);
        setLogs(logsRes.data  || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [campaign]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(panelRef.current,   { x: "100%", opacity: 0, duration: 0.22, ease: "power2.in", onComplete: onClose });
  };

  if (!campaign) return null;

  const status = STATUS_MAP[campaign.status] || STATUS_MAP.P;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div ref={overlayRef} className="absolute inset-0 modal-backdrop" onClick={handleClose} />

      {/* Slide panel — full height, internal scroll */}
      <div
        ref={panelRef}
        className="relative flex flex-col w-full max-w-lg h-full bg-surface border-l border-border-subtle shadow-2xl"
      >

        {/* ── Header ───────────────────────────────────── */}
        <div className="shrink-0 px-6 py-5 border-b border-border-subtle bg-surface">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Status + ID row */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${status.text} border-current/20 ${status.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                  <Hash className="w-2.5 h-2.5" />{campaign.id}
                </span>
              </div>
              {/* Name */}
              <h2 className="text-base font-semibold text-text-primary leading-snug truncate pr-2">
                {campaign.campaign_name}
              </h2>
              {/* Query */}
              <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                <span className="font-mono bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded text-[10px]">Query</span>
                <span className="truncate">{campaign.search_query}</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {campaign.scheduled_time && (
              <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Calendar className="w-3 h-3" />
                {campaign.timezone ? formatLocationTime(campaign.scheduled_time, campaign.timezone) : formatDate(campaign.scheduled_time)}
              </span>
            )}
            {campaign.completed_date && (
              <span className="flex items-center gap-1.5 text-[11px] text-status-done">
                <CheckCircle2 className="w-3 h-3" />
                {formatDate(campaign.completed_date)}
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="shrink-0 flex border-b border-border-subtle bg-surface">
          {[
            { key: "leads", icon: Users,      label: `Leads`,       count: leads.length },
            { key: "logs",  icon: ScrollText, label: `Execution`,   count: logs.length  },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
                  active ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  active ? "bg-accent/15 text-amber-700" : "bg-surface-elevated text-text-muted"
                }`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Scrollable Content ───────────────────────── */}
        <div className="flex-1 overflow-y-auto scroll-section p-5 bg-background/30">
          {loading ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-text-muted">
              <RefreshCw className="w-5 h-5 animate-spin-smooth text-accent" />
              <span className="text-sm">Loading {tab}…</span>
            </div>

          ) : tab === "leads" ? (
            leads.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-text-muted opacity-50">
                <Users className="w-10 h-10" />
                <p className="text-sm">No leads discovered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => {
                  const ls = STATUS_MAP[lead.notification_status] || STATUS_MAP.P;
                  return (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-text-primary">
                          {lead.customer_name || "Unknown Business"}
                        </span>
                        <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border ${ls.text} border-current/20 ${ls.bg}`}>
                          {ls.label}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <InfoRow icon={Phone}>{lead.mobile}</InfoRow>
                        <InfoRow icon={Mail}>{lead.email}</InfoRow>
                        <InfoRow icon={MapPin}>{lead.address}</InfoRow>
                      </div>
                    </div>
                  );
                })}
              </div>
            )

          ) : logs.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-text-muted opacity-50">
              <ScrollText className="w-10 h-10" />
              <p className="text-sm">No execution logs found</p>
            </div>
          ) : (
            <div className="relative pl-5">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-subtle" />
              <div className="space-y-5">
                {logs.map((log) => (
                  <div key={log.id} className="relative flex gap-3">
                    {/* Dot */}
                    <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-border-subtle border-2 border-surface ring-1 ring-border-subtle" />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[10px] text-text-muted font-mono bg-surface border border-border-subtle px-2 py-0.5 rounded self-start">
                        {formatDate(log.created_date)}
                      </span>
                      <p className="text-xs text-text-secondary font-mono leading-relaxed break-words">
                        {log.log_message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
