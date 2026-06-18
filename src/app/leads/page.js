"use client";

import { useEffect, useState } from "react";
import LeadsTable from "../components/LeadsTable";

export default function LeadsPage() {
  const [globalLeads, setGlobalLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/campaigns/get", {
        method: "POST", 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ mode: "ALL_LEADS" })
      });
      if (res.ok) setGlobalLeads((await res.json()).data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return <div className="p-8 text-text-muted">Loading leads...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Leads Database</h1>
      </div>
      <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <LeadsTable leads={globalLeads} />
      </div>
    </div>
  );
}
