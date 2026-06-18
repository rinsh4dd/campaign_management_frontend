"use client";

import { 
  LayoutDashboard, Package, ShoppingCart, MessageSquare, 
  ChevronLeft, X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ onCloseMobile }) {
  const pathname = usePathname();
  
  const mainMenuItems = [
    { id: "dashboard", href: "/", label: "Dashboard", icon: LayoutDashboard },
    { id: "campaigns", href: "/campaign-page", label: "Campaigns", icon: Package },
    { id: "leads", href: "/leads", label: "Leads", icon: ShoppingCart },
    { id: "logs", href: "/logs", label: "Logs", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-border-subtle bg-surface flex flex-col">
      {/* Brand & Logo */}
      <div className="p-5 flex items-center justify-between border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <img src="https://flowbee.io/images/logo.png" alt="Flowbee Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary leading-tight">Flowbee</span>
            <span className="text-[10px] text-text-muted font-medium">Campaign Scheduler</span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onCloseMobile}
          className="md:hidden text-text-muted hover:text-text-primary transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6 scrollbar-hide">
        
        {/* Main Menu */}
        <div className="mt-4">
          <span className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">Main Menu</span>
          <ul className="space-y-1">
            {mainMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? "bg-accent/10 text-accent font-medium" 
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

    </aside>
  );
}
