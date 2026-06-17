"use client";

import { Bell, Search, Settings, ChevronDown, User, LogOut, KeyRound } from "lucide-react";
import { useState } from "react";

export default function TopHeader({ title, globalData = { campaigns: [], leads: [], logs: [] }, onSelectTab, onChangePasswordClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Compute search matches
  const matchCounts = {
    campaigns: 0,
    leads: 0,
    logs: 0
  };

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    matchCounts.campaigns = globalData.campaigns.filter(c => 
      (c.campaign_name || "").toLowerCase().includes(q) || 
      (c.search_query || "").toLowerCase().includes(q)
    ).length;

    matchCounts.leads = globalData.leads.filter(l => 
      (l.customer_name || "").toLowerCase().includes(q) ||
      (l.campaign_name || "").toLowerCase().includes(q) ||
      (l.mobile || "").includes(q)
    ).length;

    matchCounts.logs = globalData.logs.filter(l => 
      (l.log_message || "").toLowerCase().includes(q) ||
      (l.campaign_name || "").toLowerCase().includes(q)
    ).length;
  }

  const handleSelectTab = (tab) => {
    if (onSelectTab) onSelectTab(tab, searchQuery);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  return (
    <header className="h-16 shrink-0 border-b border-border-subtle bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
      
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Global Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="pl-9 pr-4 py-1.5 w-48 md:w-64 rounded-lg border border-border-subtle bg-surface text-sm focus:border-accent transition-colors"
            />
          </div>

          {showSearchDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-surface-elevated border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface border-b border-border-subtle">
                Search Results
              </div>
              <ul className="py-1">
                <li 
                  className={`px-4 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-surface-hover ${matchCounts.campaigns > 0 ? "text-text-primary" : "text-text-muted"}`}
                  onClick={() => handleSelectTab("campaigns")}
                >
                  <span>Campaigns</span>
                  <span className="bg-surface border border-border-subtle rounded-full px-2 py-0.5 text-xs">{matchCounts.campaigns} found</span>
                </li>
                <li 
                  className={`px-4 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-surface-hover ${matchCounts.leads > 0 ? "text-text-primary" : "text-text-muted"}`}
                  onClick={() => handleSelectTab("leads")}
                >
                  <span>Leads Database</span>
                  <span className="bg-surface border border-border-subtle rounded-full px-2 py-0.5 text-xs">{matchCounts.leads} found</span>
                </li>
                <li 
                  className={`px-4 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-surface-hover ${matchCounts.logs > 0 ? "text-text-primary" : "text-text-muted"}`}
                  onClick={() => handleSelectTab("logs")}
                >
                  <span>System Logs</span>
                  <span className="bg-surface border border-border-subtle rounded-full px-2 py-0.5 text-xs">{matchCounts.logs} found</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="h-6 w-px bg-border-subtle mx-2 hidden md:block" />

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-surface-hover p-1 pr-3 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium">
              A
            </div>
            <ChevronDown className="w-3 h-3 text-text-muted hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-elevated border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border-subtle">
                <p className="text-sm font-medium text-text-primary">Admin</p>
                <p className="text-xs text-text-muted truncate">admin@flowbee.io</p>
              </div>
              <ul className="py-1">
                <li>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onChangePasswordClick) onChangePasswordClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" /> Change Password
                  </button>
                </li>
                <li className="border-t border-border-subtle my-1" />
                <li>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-status-error hover:bg-status-error/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
