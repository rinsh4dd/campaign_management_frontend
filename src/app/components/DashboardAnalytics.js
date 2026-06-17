"use client";

import { BarChart2, TrendingUp, Users, Activity } from "lucide-react";

export default function DashboardAnalytics({ stats, leads = [] }) {
  // Compute real data for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyCounts = last7Days.map(date => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const count = leads.filter(l => {
      if (!l.created_date) return false;
      const lDate = new Date(l.created_date);
      return lDate >= date && lDate < nextDay;
    }).length;

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      leads: count
    };
  });

  const maxLeads = Math.max(...dailyCounts.map(d => d.leads), 1); // Avoid div by 0

  const weeklyData = dailyCounts.map(d => ({
    ...d,
    heightPercent: Math.max(5, Math.round((d.leads / maxLeads) * 100)) // Give at least 5% so the bar is visible
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Leads Over Time Graph */}
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Leads Captured
            </h3>
            <p className="text-xs text-text-muted mt-1">Daily lead generation over the last 7 days</p>
          </div>
          <select className="bg-surface border border-border-subtle rounded-lg text-xs px-2 py-1 outline-none text-text-secondary">
            <option>Last 7 days</option>
            <option>This Month</option>
          </select>
        </div>
        
        <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full bg-surface border border-border-subtle rounded-t-sm relative h-full flex items-end">
                <div 
                  className="w-full bg-accent/80 rounded-t-sm transition-all duration-500 group-hover:bg-accent"
                  style={{ height: `${d.heightPercent}%` }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {d.leads} leads
                </div>
              </div>
              <span className="text-[10px] text-text-muted font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Success Rate */}
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-status-done" /> Campaign Distribution
            </h3>
            <p className="text-xs text-text-muted mt-1">Status breakdown of all campaigns</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-48 px-4">
          <div className="w-full space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-text-primary">Completed ({stats.done})</span>
                <span className="text-text-muted">
                  {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface border border-border-subtle rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-done" 
                  style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-text-primary">Pending / Running ({stats.pending})</span>
                <span className="text-text-muted">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface border border-border-subtle rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-pending" 
                  style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-text-primary">Errors ({stats.error})</span>
                <span className="text-text-muted">
                  {stats.total > 0 ? Math.round((stats.error / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface border border-border-subtle rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-error" 
                  style={{ width: `${stats.total > 0 ? (stats.error / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
