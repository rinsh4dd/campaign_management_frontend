"use client";

import { Bell, ChevronDown, LogOut, KeyRound, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HealthService } from "../services/api";

const PAGE_TITLES = {
  "/":              "Dashboard",
  "/campaign-page": "Campaigns",
  "/leads":         "Leads",
  "/logs":          "Logs",
};

export default function TopHeader({ title, onMenuToggle, onChangePasswordClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [health, setHealth]                   = useState(null);
  const profileRef                            = useRef(null);
  const pathname                              = usePathname();
  const pageLabel                             = PAGE_TITLES[pathname] || title;

  /* ── Health check ─────────────────────────────────────── */
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
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  /* ── Close profile menu on outside click ──────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-15 shrink-0 border-b border-border-subtle bg-surface/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 gap-4"
      style={{ height: "3.75rem" }}>

      {/* ── Left: hamburger + breadcrumb ─────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden shrink-0 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="text-[15px] font-semibold text-text-primary truncate">{pageLabel}</h1>
          <p className="text-[10px] text-text-muted hidden md:block">Flowbee Campaign Scheduler</p>
        </div>
      </div>

      {/* ── Right: health + profile ───────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Health indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border-subtle bg-surface-elevated">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              health === "up"   ? "bg-status-done animate-pulse-soft" :
              health === "down" ? "bg-status-error" :
                                  "bg-text-muted"
            }`}
          />
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
            {health === "up" ? "Online" : health === "down" ? "Offline" : "…"}
          </span>
        </div>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-surface-hover transition-colors"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-zinc-900 shadow-sm">
              A
            </div>
            <ChevronDown
              className={`w-3 h-3 text-text-muted hidden md:block transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface-elevated border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border-subtle bg-surface">
                <p className="text-sm font-semibold text-text-primary">Admin</p>
                <p className="text-xs text-text-muted truncate">admin@flowbee.io</p>
              </div>

              <ul className="py-1.5">
                <li>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onChangePasswordClick?.();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-text-muted" />
                    Change Password
                  </button>
                </li>
                <li className="mx-3 my-1 border-t border-border-subtle" />
                <li>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-status-error hover:bg-status-error/8 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
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
