"use client";

import { useState } from "react";
import { Plus, X, Type, Search, Clock, Users, Globe } from "lucide-react";
import { CampaignService } from "../services/api";

const REGIONS = [
  { name: "India (IST)", offset: 330 },
  { name: "UAE (GST)", offset: 240 },
  { name: "Oman (GST)", offset: 240 },
  { name: "Saudi Arabia (AST)", offset: 180 },
  { name: "Qatar (AST)", offset: 180 },
  { name: "Kuwait (AST)", offset: 180 },
  { name: "Bahrain (AST)", offset: 180 },
  { name: "UK (GMT/BST)", offset: 0 },
  { name: "USA (EST)", offset: -300 },
];

export default function CreateCampaignForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campaignName: "",
    searchQuery: "",
    scheduledTime: "",
    timezoneOffset: "330", // Default India
    leadLimit: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.campaignName || !form.searchQuery || !form.scheduledTime) return;

    setLoading(true);
    try {
      // Calculate correct UTC time from the selected local time and region offset
      const offsetMinutes = parseInt(form.timezoneOffset, 10);
      const utcDate = new Date(form.scheduledTime + "Z"); // Parse as UTC
      utcDate.setUTCMinutes(utcDate.getUTCMinutes() - offsetMinutes);
      const finalUtcString = utcDate.toISOString();

      const selectedRegion = REGIONS.find(r => r.offset.toString() === form.timezoneOffset);

      const payload = {
        ...form,
        scheduledTime: finalUtcString,
        leadLimit: form.leadLimit || 5,
        actionCode: "WHATSAPP",
        timezone: selectedRegion ? selectedRegion.name : "Unknown",
      };

      const campaign = await CampaignService.createCampaign(payload);
      
      setForm({ campaignName: "", searchQuery: "", scheduledTime: "", timezoneOffset: "330", leadLimit: 5 });
      setOpen(false);
      onCreated?.(campaign);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border-subtle py-4 text-xs font-medium text-text-muted tracking-wider uppercase transition-colors hover:border-accent hover:text-accent cursor-pointer flex flex-col items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        New campaign
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface-elevated p-5 space-y-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary tracking-wider uppercase flex items-center gap-2">
          <Plus className="w-4 h-4 text-accent" />
          New campaign
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-text-muted hover:text-status-error transition-colors cursor-pointer p-1 rounded-md hover:bg-status-error/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Campaign name"
            value={form.campaignName}
            onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search query (e.g. supermarkets in town)"
            value={form.searchQuery}
            onChange={(e) => setForm({ ...form, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="datetime-local"
            value={form.scheduledTime}
            onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary transition-colors focus:border-accent"
          />
        </div>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <select
            value={form.timezoneOffset}
            onChange={(e) => setForm({ ...form, timezoneOffset: e.target.value })}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary transition-colors focus:border-accent appearance-none cursor-pointer"
          >
            {REGIONS.map((region) => (
              <option key={region.name} value={region.offset}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="number"
            min="1"
            max="1000"
            placeholder="Lead Limit (Max Places)"
            value={form.leadLimit}
            onChange={(e) => setForm({ ...form, leadLimit: e.target.value === "" ? "" : parseInt(e.target.value) })}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface text-sm text-text-primary transition-colors focus:border-accent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent/90 py-2.5 text-xs text-black font-semibold tracking-wider uppercase transition-all hover:bg-accent disabled:opacity-40 cursor-pointer shadow-sm"
      >
        {loading ? "Creating..." : "Create campaign"}
      </button>
    </form>
  );
}
