"use client";

import { useState } from "react";
import gsap from "gsap";
import { X } from "lucide-react";
import CreateCampaignForm from "./CreateCampaignForm";

export default function CreateCampaignModal({ onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-elevated rounded-2xl shadow-2xl border border-border-subtle overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Add New Campaign</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <CreateCampaignForm 
            onCreated={(c) => {
              if (onSuccess) onSuccess("Campaign created successfully!");
              onClose();
            }} 
          />
        </div>
      </div>
    </div>
  );
}
