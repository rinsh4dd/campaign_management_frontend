"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardAnalytics from "./components/DashboardAnalytics";
import { CampaignService } from "./services/api";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [globalLeads, setGlobalLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const result = await CampaignService.getCampaigns();
      setCampaigns(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const result = await CampaignService.getAllLeads();
      setGlobalLeads(result.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchLeads();
    const interval = setInterval(() => {
      fetchCampaigns();
      fetchLeads();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = campaigns.length;
    const pending = campaigns.filter(c => c.status === "P").length;
    const running = campaigns.filter(c => c.status === "R").length;
    const done = campaigns.filter(c => c.status === "D").length;
    const error = campaigns.filter(c => c.status === "E").length;
    return { total, pending, running, done, error };
  }, [campaigns]);

  if (loading) {
    return <div className="p-8 text-text-muted">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard Overview</h1>
      </div>
      <DashboardAnalytics stats={stats} leads={globalLeads} />
    </div>
  );
}
