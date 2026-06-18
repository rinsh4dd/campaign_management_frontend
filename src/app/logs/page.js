"use client";

import { useEffect, useState } from "react";
import LogsTable from "../components/LogsTable";
import { CampaignService } from "../services/api";

export default function LogsPage() {
  const [globalLogs, setGlobalLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const result = await CampaignService.getAllLogs();
      setGlobalLogs(result.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-8 text-text-muted">Loading logs...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">System Logs</h1>
      </div>
      <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <LogsTable logs={globalLogs} />
      </div>
    </div>
  );
}
