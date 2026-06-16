'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Calendar, DollarSign, Activity, RefreshCcw, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { adminAPI, AdminStats } from '@/lib/api';
import type { RevenueData } from '@/types';
import Card from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

const mockAlerts = [
  { id: '1', level: 'critical', message: 'KYC queue: 12 seller applications pending verification', time: '10m ago' },
  { id: '2', level: 'warning', message: 'Dispute #DSP-2024-089 exceeding 48hr resolution SLA', time: '25m ago' },
  { id: '3', level: 'info', message: 'New seller onboarding: 3 applications submitted today', time: '1h ago' },
  { id: '4', level: 'warning', message: 'Booking #BK-4532 pickup overdue by 2 hours', time: '2h ago' },
];

const mockIncidents = [
  { id: '1', status: 'resolved', agent: 'Stylist-3', event: 'High latency spike', time: '15m ago', detail: 'Resolved via auto-scale' },
  { id: '2', status: 'investigating', agent: 'Recommend-1', event: 'Recommendation timeout', time: '45m ago', detail: 'Under investigation' },
  { id: '3', status: 'monitoring', agent: 'Search-2', event: 'Cache miss ratio > 5%', time: '2h ago', detail: 'Monitoring' },
];

function AlertBadge({ level }: { level: string }) {
  const colors = {
    critical: 'bg-error/10 text-error border-error/30',
    warning: 'bg-champagne/10 text-champagne border-champagne/30',
    info: 'bg-[#C9A96E]/5 text-[#8C8C8C] border-[#2A2A2A]',
  };
  return (
    <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border font-bold ${(colors as Record<string, string>)[level] || colors.info}`}>
      {level}
    </span>
  );
}

function IncidentDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    resolved: 'bg-success',
    investigating: 'bg-champagne',
    monitoring: 'bg-[#8C8C8C]',
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || 'bg-[#8C8C8C]'}`} />
  );
}

function ExecutiveCard({ label, val, desc, icon: Icon, trend, index }: { label: string; val: string; desc: string; icon: React.ElementType; trend?: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springTransition, delay: index * 0.05 }}
    >
      <div className="flex flex-col justify-between h-32 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 w-full relative overflow-hidden group hover:border-[#C9A96E]/30 hover:shadow-lg transition-all duration-300 cursor-default">
        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-gradient-to-br from-[#C9A96E]/10 to-[#C9A96E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-[#8C8C8C] relative">
          <span className="text-[10px] font-mono tracking-wider uppercase font-bold">{label}</span>
          <div className="w-8 h-8 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
            <Icon size={14} className="text-[#C9A96E]" />
          </div>
        </div>
        <div className="relative">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#E8E8E8]">{val}</span>
            {trend && (
              <span className="text-[9px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#8C8C8C] block mt-1 font-light">{desc}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsResp, revenueResp] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRevenueData(),
      ]);
      setStats(statsResp);
      setRevenueData(revenueResp);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Executive Overview
          </h1>
          <p className="text-[10px] text-[#8C8C8C] font-mono mt-1">Real-time platform intelligence</p>
        </div>
        <button
          onClick={() => loadStats(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] hover:border-[#C9A96E]/30 text-[#C9A96E] rounded-xl flex items-center gap-1.5 transition-all duration-300 cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync Analytics
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="shimmer h-3 bg-[#2A2A2A] rounded w-16" />
                  <div className="shimmer h-8 bg-[#2A2A2A] rounded-xl w-8" />
                </div>
                <div className="shimmer h-6 bg-[#2A2A2A] rounded w-20" />
                <div className="shimmer h-2 bg-[#2A2A2A] rounded w-24" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-80 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-36 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 animate-pulse" />
              <div className="h-36 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <ExecutiveCard label="GMV Today" val={`₹${stats ? Math.round(stats.total_revenue * 0.2).toLocaleString('en-IN') : '0'}`} desc="Escrow volume passing platform" icon={DollarSign} trend="+12%" index={0} />
            <ExecutiveCard label="Active Rentals" val={stats?.active_bookings?.toString() || '0'} desc="Outfits currently in use" icon={Calendar} index={1} />
            <ExecutiveCard label="Total Users" val={stats?.total_users?.toString() || '0'} desc="Registered profiles" icon={Users} trend={`${stats?.total_bookings || 0} bookings`} index={2} />
            <ExecutiveCard label="Open Disputes" val={stats?.open_disputes?.toString() || '0'} desc="Awaiting mediator response" icon={ShieldAlert} index={3} />
            <ExecutiveCard label="MTD Revenue" val={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`} desc="Gross commission released" icon={Activity} index={4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-lg">
                <h3 className="font-display text-base font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp size={15} className="text-[#C9A96E]" /> Escrow GMV & Platform Commissions (MTD)
                </h3>
                <div className="h-72 w-full text-xs">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="date" stroke="#8C8C8C" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8C8C8C" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#E8E8E8', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" name="Revenue (₹)" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#8C8C8C]">No revenue data available</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-lg">
                <h3 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#C9A96E]" /> Alert Prioritization
                </h3>
                <div className="space-y-2">
                  {mockAlerts.map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springTransition, delay: 0.2 + idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[#2A2A2A] bg-[#131313] hover:bg-[#1A1A1A] hover:border-[#C9A96E]/20 transition-all duration-300"
                    >
                      <AlertBadge level={alert.level} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#E8E8E8] leading-relaxed">{alert.message}</p>
                        <span className="text-[9px] font-mono text-[#8C8C8C] mt-1 block">{alert.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-lg">
                <h3 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-[#C9A96E]" /> Incident Feed
                </h3>
                <div className="space-y-2">
                  {mockIncidents.map((inc, idx) => (
                    <motion.div
                      key={inc.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springTransition, delay: 0.3 + idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[#2A2A2A] bg-[#131313] hover:bg-[#1A1A1A] hover:border-[#C9A96E]/20 transition-all duration-300"
                    >
                      <IncidentDot status={inc.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold text-[#E8E8E8]">{inc.agent}</span>
                          <span className="text-[8px] font-mono text-[#8C8C8C] uppercase bg-[#2A2A2A] px-1.5 py-0.5 rounded">{inc.status}</span>
                        </div>
                        <p className="text-[11px] text-[#E8E8E8]">{inc.event}</p>
                        <span className="text-[9px] font-mono text-[#8C8C8C] mt-1 block">{inc.time} &middot; {inc.detail}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
