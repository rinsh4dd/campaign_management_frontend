"use client";

import { useEffect, useState } from "react";
import CampaignTable from "../components/CampaignTable";
import CreateCampaignModal from "../components/CreateCampaignModal";
import CampaignDetail from "../components/CampaignDetail";
import Toast from "../components/Toast";
import { Plus } from "lucide-react";

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchCampaigns = async (animate = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
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
        setCampaigns(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (animate) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(true);
    const interval = setInterval(() => fetchCampaigns(false), 10000);
    return () => clearInterval(interval);
  }, []);

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

  const showToast = (message, type) => setToast({ message, type });

  if (loading) {
    return <div className="p-8 text-text-muted">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Campaigns</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="bg-surface-elevated border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <CampaignTable 
          campaigns={campaigns} 
          onSelect={setSelectedCampaign}
          onDelete={handleDeleteCampaign}
          onTrigger={() => {}}
        />
      </div>

      {selectedCampaign && (
        <CampaignDetail 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)} 
        />
      )}

      {showAddModal && (
        <CreateCampaignModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => {
            setShowAddModal(false);
            showToast(msg, "success");
            fetchCampaigns(false);
          }}
        />
      )}

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
