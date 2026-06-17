"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Play, Trash2, LayoutDashboard, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import CampaignTable from "./components/CampaignTable";
import LeadsTable from "./components/LeadsTable";
import LogsTable from "./components/LogsTable";
import DashboardAnalytics from "./components/DashboardAnalytics";
import CreateCampaignModal from "./components/CreateCampaignModal";
import CampaignDetail from "./components/CampaignDetail";
import Toast from "./components/Toast";
import ChangePasswordModal from "./components/ChangePasswordModal";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [campaigns, setCampaigns] = useState([]);
  const [globalLeads, setGlobalLeads] = useState([]);
  const [globalLogs, setGlobalLogs] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleSelectTab = (tab, query) => {
    setActiveView(tab);
    if (query) {
      setGlobalSearch(query);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const fetchCampaigns = async (animate = false) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/campaigns/get", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ mode: "ALL" })
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data || [];
        setCampaigns(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => fetchCampaigns(false), 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeView === "leads" && globalLeads.length === 0) fetchLeads();
    if (activeView === "logs" && globalLogs.length === 0) fetchLogs();
  }, [activeView, isAuthenticated]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/campaigns/get", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ mode: "ALL_LEADS" })
      });
      if (res.ok) setGlobalLeads((await res.json()).data || []);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/campaigns/get", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ mode: "ALL_LOGS" })
      });
      if (res.ok) setGlobalLogs((await res.json()).data || []);
    } catch (e) { console.error(e); }
  };

  const handleTriggerAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/campaigns/save", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "TRIGGER" })
      });
      if (res.ok) {
        showToast("Scheduler triggered manually", "info");
        fetchCampaigns(false);
      } else {
        showToast("Failed to trigger scheduler", "error");
      }
    } catch (err) {
      showToast("Error triggering scheduler", "error");
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm(`Are you sure you want to delete campaign ID ${id}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/campaigns/save", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "DELETE", id })
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        if (selectedCampaign?.id === id) setSelectedCampaign(null);
        showToast(`Campaign ${id} deleted`, "success");
      } else {
        showToast("Failed to delete campaign", "error");
      }
    } catch (err) {
      showToast("Error deleting campaign", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Derived Stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const pending = campaigns.filter(c => c.status === "P" || c.status === "R").length;
    const done = campaigns.filter(c => c.status === "D").length;
    const error = campaigns.filter(c => c.status === "E").length;
    return { total, pending, done, error };
  }, [campaigns]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-accent" />
    </div>;
  }

  return (
    
      <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title={activeView.charAt(0).toUpperCase() + activeView.slice(1)} 
          globalData={{ campaigns, leads: globalLeads, logs: globalLogs }}
          onSelectTab={handleSelectTab}
          onChangePasswordClick={() => setShowPasswordModal(true)}
        />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          
          {/* Stats Overview */}
          {(activeView === "dashboard" || activeView === "campaigns") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Campaigns", value: stats.total, icon: LayoutDashboard, color: "text-text-primary" },
                { label: "Pending & Running", value: stats.pending, icon: Clock, color: "text-status-pending" },
                { label: "Completed", value: stats.done, icon: CheckCircle2, color: "text-status-done" },
                { label: "Errors", value: stats.error, icon: AlertCircle, color: "text-status-error" },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-2xl border border-border-subtle bg-surface px-6 py-5 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center gap-2 text-text-primary mb-3">
                    <span className="text-sm font-semibold">{stat.label}</span>
                    <stat.icon className="w-3.5 h-3.5 text-text-muted ml-auto" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-3xl font-bold tracking-tight text-text-primary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === "dashboard" && (
            <DashboardAnalytics stats={stats} leads={globalLeads} />
          )}

          {activeView === "campaigns" && (
            <CampaignTable 
              campaigns={campaigns} 
              onAdd={() => setShowAddModal(true)}
              onSelect={setSelectedCampaign}
              onDelete={handleDeleteCampaign}
              onTrigger={async () => {
                showToast("Executing trigger", "info");
                await handleTriggerAll();
              }}
              initialSearch={globalSearch}
            />
          )}

          {activeView === "leads" && (
            <LeadsTable leads={globalLeads} initialSearch={globalSearch} />
          )}

          {activeView === "logs" && (
            <LogsTable logs={globalLogs} initialSearch={globalSearch} />
          )}

          {(!["dashboard", "campaigns", "leads", "logs"].includes(activeView)) && (
             <div className="flex flex-col items-center justify-center py-20 text-text-muted">
               <RefreshCw className="w-8 h-8 animate-spin mb-4" />
               <p>This view is under construction for the new layout.</p>
             </div>
          )}
        </main>
      </div>

      {showAddModal && (
        <CreateCampaignModal 
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            showToast("Campaign created successfully", "success");
            fetchCampaigns(true);
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => {
            setShowPasswordModal(false);
            showToast(msg, "success");
          }}
        />
      )}

      <CampaignDetail
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
