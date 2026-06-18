"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, ScrollText, RefreshCw, Layers } from "lucide-react";
import { CampaignService } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GlobalLogsModal({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await CampaignService.getAllLogs();
      setLogs(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(panelRef.current, { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" });
    fetchLogs();
  }, []);

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

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      <div ref={panelRef} className="relative w-full max-w-xl h-full bg-surface border-l border-border-subtle flex flex-col shadow-2xl">
        <div className="shrink-0 bg-surface border-b border-border-subtle px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-medium text-text-primary">Global Execution Logs</h2>
              <p className="text-xs text-text-muted mt-0.5">Showing the latest 200 activity logs across all campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLogs} className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-accent" : ""}`} />
            </button>
            <button onClick={handleClose} className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-surface-elevated/50">
          {loading && logs.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3">
               <RefreshCw className="w-5 h-5 animate-spin text-accent" />
               Loading logs...
             </div>
          ) : logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3 opacity-60">
              <ScrollText className="w-8 h-8" />
              <p>No execution logs found</p>
            </div>
          ) : (
            <div className="relative pl-4 border-l-2 border-border-subtle space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-border-subtle border-2 border-surface" />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-text-muted font-mono bg-surface border border-border-subtle px-1.5 py-0.5 rounded">
                        {formatDate(log.created_date)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                        <Layers className="w-3 h-3" />
                        {log.campaign_name || `Campaign #${log.campaign_id}`}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary leading-relaxed">
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
