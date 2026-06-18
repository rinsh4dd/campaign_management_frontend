"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardAnalytics from "./components/DashboardAnalytics";
import { CampaignService } from "./services/api";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [campaigns,    setCampaigns]    = useState([]);
  const [globalLeads,  setGlobalLeads]  = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchAll = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [camps, leads] = await Promise.all([
        CampaignService.getCampaigns(),
        CampaignService.getAllLeads(),
      ]);
      setCampaigns(camps.data   || []);
      setGlobalLeads(leads.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
    const id = setInterval(() => fetchAll(false), 10_000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => ({
    total:   campaigns.length,
    pending: campaigns.filter((c) => c.status === "P").length,
    running: campaigns.filter((c) => c.status === "R").length,
    done:    campaigns.filter((c) => c.status === "D").length,
    error:   campaigns.filter((c) => c.status === "E").length,
  }), [campaigns]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-text-muted">
        <RefreshCw className="w-8 h-8 animate-spin-smooth text-accent" />
        <p className="text-sm font-medium">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Overview</h1>
          <p className="text-sm text-text-muted mt-0.5">Your campaign performance at a glance</p>
        </div>
        <span className="text-xs text-text-muted px-3 py-1.5 rounded-lg border border-border-subtle bg-surface">
          Auto-refresh · 10s
        </span>
      </div>
      <DashboardAnalytics stats={stats} leads={globalLeads} />
    </div>
  );
}
