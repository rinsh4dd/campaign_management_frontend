"use client";

import { useEffect, useState, useRef } from "react";
import { LogOut, ScrollText, Menu, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import SettingsModal from "./SettingsModal";
import { HealthService } from "../services/api";

export default function Header() {
  const [health, setHealth] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState("logs");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await HealthService.check();
        setHealth(data.status === "UP" ? "up" : "down");
      } catch {
        setHealth("down");
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (tab) => {
    setInitialTab(tab);
    setModalOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 md:px-6 py-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Scheduler Logo" className="h-5 md:h-6 object-contain rounded" />
            <div className="h-5 w-px bg-border-subtle mx-1 md:mx-2" />
            <span className="text-sm md:text-base font-medium tracking-wide text-text-primary">
              Campaign Scheduler
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  health === "up" ? "bg-status-done animate-pulse-soft" : health === "down" ? "bg-status-error" : "bg-text-muted"
                }`}
              />
              <span className="text-[11px] text-text-muted tracking-wider uppercase">
                {health === "up" ? "Online" : health === "down" ? "Offline" : "..."}
              </span>
            </div>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1.5 rounded-full hover:bg-surface-hover ${menuOpen ? "bg-surface-hover" : ""}`}
                title="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-elevated border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50 py-1">
                  <div className="px-3 py-2 border-b border-border-subtle mb-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">System</span>
                  </div>
                  
                  <ul className="flex flex-col">
                    <li>
                      <button 
                        onClick={() => openModal("logs")}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                      >
                        <ScrollText className="w-4 h-4 text-text-muted" /> Global Logs
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => openModal("leads")}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                      >
                        <Users className="w-4 h-4 text-text-muted" /> All Leads
                      </button>
                    </li>
                    <li className="my-1 border-t border-border-subtle" />
                    <li>
                      <button 
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          window.location.href = "/login";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-status-error hover:bg-status-error/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {modalOpen && <SettingsModal initialTab={initialTab} onClose={() => setModalOpen(false)} />}
    </>
  );
}
