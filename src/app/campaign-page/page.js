"use client";

import { useEffect, useState } from "react";
import CampaignTable from "../components/CampaignTable";
import CreateCampaignModal from "../components/CreateCampaignModal";
import CampaignDetail from "../components/CampaignDetail";
import Toast from "../components/Toast";
import { Plus, RefreshCw, Package } from "lucide-react";
import { CampaignService } from "../services/api";

export default function CampaignPage() {
  const [campaigns,        setCampaigns]        = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAddModal,     setShowAddModal]      = useState(false);
  const [loading,          setLoading]           = useState(true);
  const [toast,            setToast]             = useState(null);

  const fetchCampaigns = async (animate = false) => {
    try {
      const result = await CampaignService.getCampaigns();
      setCampaigns(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (animate) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(true);
    const id = setInterval(() => fetchCampaigns(false), 10_000);
    return () => clearInterval(id);
  }, []);

  const showToast = (message, type) => setToast({ message, type });

  const handleDeleteCampaign = async (id) => {
    if (!confirm(`Delete campaign #${id}?`)) return;
    try {
      await CampaignService.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
      showToast(`Campaign #${id} deleted`, "success");
    } catch {
      showToast("Failed to delete campaign", "error");
    }
  };

  const handleStopCampaign = async (id) => {
    if (!confirm(`Stop campaign #${id}?`)) return;
    try {
      await CampaignService.stopCampaign(id);
      showToast(`Campaign #${id} stopped`, "info");
      fetchCampaigns(false);
    } catch {
      showToast("Failed to stop campaign", "error");
    }
  };

  const handleTriggerCampaign = async (id) => {
    try {
      await CampaignService.triggerCampaign(id);
      showToast("Campaign triggered", "info");
      fetchCampaigns(false);
    } catch {
      showToast("Failed to trigger campaign", "error");
    }
  };

  const handleRetryCampaign = async (id) => {
    if (!confirm(`Retry failed campaign #${id}?`)) return;
    try {
      await CampaignService.retryCampaign(id);
      showToast(`Campaign #${id} queued for retry`, "success");
      fetchCampaigns(false);
    } catch {
      showToast("Failed to retry campaign", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-text-muted">
        <RefreshCw className="w-8 h-8 animate-spin-smooth text-accent" />
        <p className="text-sm font-medium">Loading campaigns…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pb-8">

      {/* ── Page header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            Campaigns
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-accent flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────── */}
      <CampaignTable
        campaigns={campaigns}
        onSelect={setSelectedCampaign}
        onDelete={handleDeleteCampaign}
        onTrigger={handleTriggerCampaign}
        onStop={handleStopCampaign}
        onRetry={handleRetryCampaign}
      />

      {/* ── Detail Panel ───────────────────────────────── */}
      {selectedCampaign && (
        <CampaignDetail
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* ── Create Modal ───────────────────────────────── */}
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

      {/* ── Toast ──────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
