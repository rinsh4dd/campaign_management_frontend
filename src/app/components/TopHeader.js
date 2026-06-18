"use client";

import { Bell, Settings, ChevronDown, User, LogOut, KeyRound, Menu } from "lucide-react";
import { useState } from "react";

export default function TopHeader({ title, onMenuToggle, onChangePasswordClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 shrink-0 border-b border-border-subtle bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="md:hidden text-text-secondary hover:text-text-primary p-1 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 relative">
          {/* Search Removed */}
        </div>

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
