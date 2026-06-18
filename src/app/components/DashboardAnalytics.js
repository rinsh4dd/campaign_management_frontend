"use client";

import { TrendingUp, Activity, PlayCircle, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

const STAT_CARDS = [
  {
    key:   "running",
    label: "Running",
    icon:  PlayCircle,
    color: "text-status-running",
    bg:    "bg-status-running/10",
    pulse: true,
  },
  {
    key:   "pending",
    label: "Pending",
    icon:  Clock,
    color: "text-status-pending",
    bg:    "bg-status-pending/10",
  },
  {
    key:   "done",
    label: "Completed",
    icon:  CheckCircle2,
    color: "text-status-done",
    bg:    "bg-status-done/10",
  },
  {
    key:   "error",
    label: "Failed",
    icon:  AlertCircle,
    color: "text-status-error",
    bg:    "bg-status-error/10",
  },
];

export default function DashboardAnalytics({ stats, leads = [] }) {
  /* ── Build last-7-days data ─────────────────────────── */
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weeklyData = last7Days.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = leads.filter((l) => {
      if (!l.created_date) return false;
      const lDate = new Date(l.created_date);
      return lDate >= date && lDate < nextDay;
    }).length;
    return { name: date.toLocaleDateString("en-US", { weekday: "short" }), leads: count };
  });

  /* ── Doughnut data ──────────────────────────────────── */
  const rawStatusData = [
    { name: "Completed", value: stats.done    || 0, color: "#10b981" },
    { name: "Running",   value: stats.running || 0, color: "#3b82f6" },
    { name: "Pending",   value: stats.pending || 0, color: "#f59e0b" },
    { name: "Failed",    value: stats.error   || 0, color: "#ef4444" },
  ];
  const doughnutData = rawStatusData.filter((d) => d.value > 0);
  const totalCampaigns = stats.total || 0;

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          const val  = stats[card.key] || 0;
          return (
            <div
              key={card.key}
              className={`bg-surface-elevated rounded-2xl border border-border-subtle p-5 shadow-sm card-lift animate-fade-in-up`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">{card.label}</p>
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color} ${card.pulse ? "animate-pulse-soft" : ""}`} style={{ width: "18px", height: "18px" }} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-text-primary">{val}</h3>
              <p className="text-[11px] text-text-muted mt-1">
                {totalCampaigns > 0 ? `${Math.round((val / totalCampaigns) * 100)}% of total` : "No data"}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Area Chart – Leads over time */}
        <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col gap-4 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Leads Captured
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Daily lead generation — last 7 days</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg border border-border-subtle bg-surface text-xs text-text-muted font-medium">
              7 days
            </span>
          </div>

          <div className="w-full" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.6} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#71717a" }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e4e4e7", fontSize: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  itemStyle={{ color: "#3b82f6", fontWeight: 600 }}
                  cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart – Campaign status */}
        <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col gap-4 animate-fade-in-up delay-225">
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-text-secondary" />
              Campaign Status
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Breakdown of all campaigns by status</p>
          </div>

          <div className="w-full" style={{ height: 220 }}>
            {doughnutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="45%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e4e4e7", fontSize: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingLeft: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-text-muted">
                <Activity className="w-10 h-10 opacity-30" />
                <p className="text-sm">No campaigns yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Total Leads Banner ───────────────────────────── */}
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-5 flex items-center justify-between shadow-sm animate-fade-in-up delay-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Leads Captured</p>
            <h3 className="text-2xl font-bold text-text-primary">{leads.length}</h3>
          </div>
        </div>
        <span className="text-xs text-text-muted px-3 py-1.5 rounded-lg border border-border-subtle bg-surface">
          All time
        </span>
      </div>
    </div>
  );
}
