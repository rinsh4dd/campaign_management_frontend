"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function ClientLayout({ children, onPasswordModalOpen }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full bg-background overflow-hidden">

      {/* ── Mobile Overlay ──────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar (slide on mobile, static on desktop) ── */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* ── Main Column ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopHeader
          title="Campaign Scheduler"
          onMenuToggle={() => setIsMobileMenuOpen(true)}
          onChangePasswordClick={onPasswordModalOpen}
        />

        {/* Scrollable page area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-section">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
