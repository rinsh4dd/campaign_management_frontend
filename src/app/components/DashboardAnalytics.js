"use client";

import { TrendingUp, Activity, PlayCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

  // Prepare Doughnut Chart Data (Filtering out 0 values)
  const rawStatusData = [
    { name: 'Completed', value: stats.done || 0, color: '#10b981' }, 
    { name: 'Running', value: stats.running || 0, color: '#3b82f6' }, 
    { name: 'Pending', value: stats.pending || 0, color: '#f59e0b' }, 
    { name: 'Failed', value: stats.error || 0, color: '#ef4444' }, 
  ];
  const doughnutData = rawStatusData.filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      
      {/* Top Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-elevated rounded-xl border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-muted font-semibold mb-1 uppercase tracking-wider">Running</p>
            <h3 className="text-2xl font-bold text-text-primary">{stats.running || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-status-running/10 flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-status-running animate-pulse-soft" />
          </div>
        </div>

        <div className="bg-surface-elevated rounded-xl border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-muted font-semibold mb-1 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold text-text-primary">{stats.pending || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-status-pending/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-status-pending" />
          </div>
        </div>

        <div className="bg-surface-elevated rounded-xl border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-muted font-semibold mb-1 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold text-text-primary">{stats.done || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-status-done/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-status-done" />
          </div>
        </div>

        <div className="bg-surface-elevated rounded-xl border border-border-subtle p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-muted font-semibold mb-1 uppercase tracking-wider">Failed</p>
            <h3 className="text-2xl font-bold text-text-primary">{stats.error || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-status-error" />
          </div>
        </div>
      </div>

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
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.leads} leads
                  </div>
                </div>
                <span className="text-[10px] text-text-muted font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Success Rate Doughnut Chart */}
        <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-text-secondary" /> Campaign Status Distribution
              </h3>
              <p className="text-xs text-text-muted mt-1">Status breakdown of all campaigns</p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[200px]">
            {doughnutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <p className="text-sm">No campaigns found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
