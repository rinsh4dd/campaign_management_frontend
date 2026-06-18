"use client";

import { useEffect, useState } from "react";
import LeadsTable from "../components/LeadsTable";
import { CampaignService } from "../services/api";
import { RefreshCw, ShoppingCart } from "lucide-react";

export default function LeadsPage() {
  const [globalLeads, setGlobalLeads] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchLeads = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const result = await CampaignService.getAllLeads();
      setGlobalLeads(result.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(true);
    const id = setInterval(() => fetchLeads(false), 30_000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-text-muted">
        <RefreshCw className="w-8 h-8 animate-spin-smooth text-accent" />
        <p className="text-sm font-medium">Loading leads…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Leads Database
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {globalLeads.length} lead{globalLeads.length !== 1 ? "s" : ""} captured
          </p>
        </div>
      </div>
      <LeadsTable leads={globalLeads} />
    </div>
  );
}
