"use client";

import { 
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare, 
  Mail, Settings, HelpCircle, MessageCircle, BarChart2,
  Workflow, Plug, Search, ChevronLeft
} from "lucide-react";

export default function Sidebar({ activeView, setActiveView }) {
  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "campaigns", label: "Campaigns", icon: Package },
    { id: "leads", label: "Leads", icon: ShoppingCart },
    { id: "logs", label: " Logs", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-border-subtle bg-surface flex flex-col hidden md:flex">
      {/* Brand & Logo */}
      <div className="p-5 flex items-center justify-between border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <img src="https://flowbee.io/images/logo.png" alt="Flowbee Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary leading-tight">Flowbee</span>
            <span className="text-[10px] text-text-muted font-medium">Campaign Scheduler</span>
          </div>
        </div>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-sm focus:border-accent transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] bg-surface border border-border-subtle px-1.5 py-0.5 rounded text-text-muted font-mono">⌘</span>
            <span className="text-[10px] bg-surface border border-border-subtle px-1.5 py-0.5 rounded text-text-muted font-mono">K</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6 scrollbar-hide">
        
        {/* Main Menu */}
        <div>
          <span className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">Main Menu</span>
          <ul className="space-y-1">
            {mainMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeView === item.id 
                      ? "bg-accent/10 text-accent font-medium" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${activeView === item.id ? "text-accent" : "text-text-muted"}`} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </aside>
  );
}
