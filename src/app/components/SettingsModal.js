"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, ScrollText, RefreshCw, Layers, Users, Menu, Lock } from "lucide-react";
import { CampaignService, AuthService } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsModal({ initialTab = "logs", onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [logs, setLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  const fetchData = async (mode) => {
    setLoading(true);
    try {
      if (mode === "ALL_LOGS") {
        const result = await CampaignService.getAllLogs();
        setLogs(result.data || []);
      } else if (mode === "ALL_LEADS") {
        const result = await CampaignService.getAllLeads();
        setLeads(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(panelRef.current, { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" });
    fetchData("ALL_LOGS");
  }, []);

  useEffect(() => {
    if (tab === "logs" && logs.length === 0) fetchData("ALL_LOGS");
    if (tab === "leads" && leads.length === 0) fetchData("ALL_LEADS");
  }, [tab]);

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
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-medium text-text-primary">System Settings</h2>
              <p className="text-xs text-text-muted mt-0.5">Manage global application preferences and logs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(tab === "logs" || tab === "leads") && (
              <button onClick={() => fetchData(tab === "logs" ? "ALL_LOGS" : "ALL_LEADS")} className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-accent" : ""}`} />
              </button>
            )}
            <button onClick={handleClose} className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle shrink-0">
          <button
            onClick={() => setTab("logs")}
            className={`flex-1 py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              tab === "logs" ? "text-black dark:text-accent border-b-2 border-accent" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <ScrollText className="w-4 h-4" /> Global Logs
          </button>
          <button
            onClick={() => setTab("leads")}
            className={`flex-1 py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              tab === "leads" ? "text-black dark:text-accent border-b-2 border-accent" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Users className="w-4 h-4" /> All Leads
          </button>
          <button
            onClick={() => setTab("security")}
            className={`flex-1 py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              tab === "security" ? "text-black dark:text-accent border-b-2 border-accent" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-surface-elevated/50">
          {tab === "logs" ? (
            loading && logs.length === 0 ? (
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
            )
          ) : tab === "leads" ? (
            loading && leads.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3">
                 <RefreshCw className="w-5 h-5 animate-spin text-accent" />
                 Loading leads...
               </div>
            ) : leads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm gap-3 opacity-60">
                <Users className="w-8 h-8" />
                <p>No leads found globally</p>
              </div>
            ) : (
              <div className="relative pl-4 border-l-2 border-border-subtle space-y-6">
                {leads.map((lead) => (
                  <div key={lead.id} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-border-subtle border-2 border-surface" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-text-muted font-mono bg-surface border border-border-subtle px-1.5 py-0.5 rounded">
                          {formatDate(lead.created_date)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                          <Layers className="w-3 h-3" />
                          {lead.campaign_name || `Campaign #${lead.campaign_id}`}
                        </span>
                      </div>
                      <span className="text-sm text-text-secondary font-medium">
                        {lead.customer_name || 'Unknown User'}
                      </span>
                      <div className="text-xs text-text-muted space-y-0.5">
                        {lead.mobile && <p>📞 {lead.mobile}</p>}
                        {lead.address && <p>📍 {lead.address}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "security" ? (
            <div className="max-w-sm mx-auto mt-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Change Password</h3>
              <form 
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPasswordStatus({ loading: true, error: "", success: "" });
                  
                  if (passwordForm.new_password !== passwordForm.confirm_password) {
                    setPasswordStatus({ loading: false, error: "New passwords do not match", success: "" });
                    return;
                  }

                  try {
                    await AuthService.changePassword(passwordForm.old_password, passwordForm.new_password);
                    setPasswordStatus({ loading: false, error: "", success: "Password changed successfully" });
                    setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
                  } catch (err) {
                    setPasswordStatus({ loading: false, error: err.message || "An error occurred", success: "" });
                  }
                }}
              >
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Old Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.old_password}
                    onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent outline-none transition-colors" 
                  />
                </div>

                {passwordStatus.error && (
                  <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-xs font-medium">
                    {passwordStatus.error}
                  </div>
                )}
                {passwordStatus.success && (
                  <div className="p-3 rounded-lg bg-status-done/10 border border-status-done/20 text-status-done text-xs font-medium">
                    {passwordStatus.success}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={passwordStatus.loading}
                  className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex justify-center"
                >
                  {passwordStatus.loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Update Password"}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
