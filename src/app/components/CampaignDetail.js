"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Users, ScrollText, Phone, Mail, MapPin, RefreshCw } from "lucide-react";

const STATUS_MAP = {
  P: { label: "Pending", text: "text-status-pending" },
  R: { label: "Running", text: "text-status-running" },
  D: { label: "Done", text: "text-status-done" },
  E: { label: "Error", text: "text-status-error" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CampaignDetail({ campaign, onClose }) {
  const [tab, setTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!campaign) return;

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );
    gsap.fromTo(
      panelRef.current,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" }
    );

    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const fetchConfig = (mode) => ({
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ mode, id: campaign.id })
        });

        const [leadsRes, logsRes] = await Promise.all([
          fetch(`/api/campaigns/get`, fetchConfig("LEADS")),
          fetch(`/api/campaigns/get`, fetchConfig("LOGS")),
        ]);
        if (leadsRes.ok) {
          const result = await leadsRes.json();
          setLeads(result.data || []);
        }
        if (logsRes.ok) {
          const result = await logsRes.json();
          setLogs(result.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaign]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(panelRef.current, {
      x: "100%",
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  if (!campaign) return null;

  const status = STATUS_MAP[campaign.status] || STATUS_MAP.P;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        ref={overlayRef}
        className="absolute inset-0 modal-backdrop"
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg h-full bg-surface border-l border-border-subtle overflow-y-auto flex flex-col shadow-2xl max-h-[90vh]"
      >
        {/* Header */}
        <div className="shrink-0 bg-surface/90 backdrop-blur-sm border-b border-border-subtle px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded border ${status.text} border-current/20 bg-current/5`}>
                {status.label}
              </span>
              <span className="text-text-muted text-[10px] uppercase tracking-wider">
                ID #{campaign.id}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1.5 hover:bg-surface-hover rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-text-primary text-base font-medium mt-3">
            {campaign.campaign_name}
          </p>
          <p className="text-text-muted text-sm mt-1">
            <span className="font-mono bg-surface-elevated border border-border-subtle px-1.5 py-0.5 rounded text-[10px] mr-2">
              Query
            </span>
            {campaign.search_query}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle shrink-0">
          {["leads", "logs"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                tab === t
                  ? "text-black border-b-2 border-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t === "leads" ? <Users className="w-4 h-4" /> : <ScrollText className="w-4 h-4" />}
              {t === "leads" ? `Leads (${leads.length})` : `Logs (${logs.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-elevated/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-accent" />
              Loading {tab}...
            </div>
          ) : tab === "leads" ? (
            leads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3 opacity-60">
                <Users className="w-8 h-8" />
                <p>No leads discovered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-primary text-sm font-medium">
                        {lead.customer_name || "Unknown Business"}
                      </span>
                      <span
                        className={`text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-current/10 ${
                          (STATUS_MAP[lead.notification_status] || STATUS_MAP.P).text
                        }`}
                      >
                        {(STATUS_MAP[lead.notification_status] || STATUS_MAP.P).label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 mt-3 text-xs text-text-muted">
                      {lead.mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> <span>{lead.mobile}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> 
                          <span className="leading-relaxed">{lead.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3 opacity-60">
              <ScrollText className="w-8 h-8" />
              <p>No execution logs found</p>
            </div>
          ) : (
            <div className="relative pl-3 border-l-2 border-border-subtle space-y-5">
              {logs.map((log, idx) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-border-subtle border-2 border-surface" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted font-mono bg-surface border border-border-subtle px-1.5 py-0.5 rounded self-start">
                      {formatDate(log.created_date)}
                    </span>
                    <span className="text-sm text-text-secondary mt-1">
                      {log.log_message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
