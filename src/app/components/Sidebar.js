"use client";

import { 
  LayoutDashboard, Package, ShoppingCart, MessageSquare, X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ onCloseMobile }) {
  const pathname = usePathname();

  const mainMenuItems = [
    { id: "dashboard", href: "/",             label: "Dashboard", icon: LayoutDashboard },
    { id: "campaigns", href: "/campaign-page",label: "Campaigns",  icon: Package },
    { id: "leads",     href: "/leads",         label: "Leads",      icon: ShoppingCart },
    { id: "logs",      href: "/logs",          label: "Logs",       icon: MessageSquare },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-border-subtle bg-surface flex flex-col overflow-hidden">

      {/* ── Brand ───────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shrink-0">
            <img src="/logo.png" alt="Scheduler Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-text-primary tracking-tight">Scheduler</span>
            <span className="text-[10px] text-text-muted font-medium tracking-wide">Campaign Manager</span>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-hover"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation ──────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scroll-section">
        <span className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 block">
          Main Menu
        </span>
        <ul className="space-y-0.5">
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    isActive
                      ? "nav-active"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-amber-600" : "text-text-muted group-hover:text-text-secondary"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom Brand Footer ──────────────────────── */}
      <div className="px-4 py-3 border-t border-border-subtle shrink-0">
        <div className="flex items-center gap-2 px-1">
          <img
            src="/logo.png"
            alt="Scheduler"
            className="w-5 h-5 object-contain rounded opacity-60"
          />
          <span className="text-[10px] text-text-muted">
            Campaign <span className="font-semibold text-text-secondary">Scheduler</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
