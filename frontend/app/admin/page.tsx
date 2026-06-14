'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Calendar, DollarSign, Activity, RefreshCcw } from 'lucide-react';
import { adminAPI, AdminStats } from '@/lib/api';
import type { RevenueData } from '@/types';
import Card from '@/components/ui/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

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

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Dashboard Overview
          </h1>
        </div>
        <button
          onClick={() => loadStats(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync Analytics
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="shimmer h-28 rounded bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
          <div className="shimmer h-80 rounded bg-[#1A1A1A] animate-pulse" />
        </div>
      ) : (
        <>
          {/* KPI stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'GMV Today', val: `₹${(stats ? Math.round(stats.total_revenue * 0.2) : 0).toLocaleString('en-IN')}`, desc: 'Escrow volume passing platform', icon: DollarSign },
              { label: 'Active Rentals', val: stats?.active_bookings?.toString() || '0', desc: 'Outfits currently in use', icon: Calendar },
              { label: 'Total Users', val: stats?.total_users?.toString() || '0', desc: 'Registered renter/seller profiles', icon: Users },
              { label: 'Open Disputes', val: stats?.open_disputes?.toString() || '0', desc: 'Awaiting mediator response', icon: ShieldAlert },
              { label: 'MTD Revenue', val: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`, desc: 'Gross commission released', icon: Activity },
            ].map((st, index) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: index * 0.05 }}
              >
                <Card
                  hoverEffect={true}
                  padding="sm"
                  theme="admin"
                  className="flex flex-col justify-between h-28 w-full"
                >
                  <div className="flex items-center justify-between text-[#8C8C8C]">
                    <span className="text-[9px] font-mono tracking-wider uppercase">{st.label}</span>
                    <st.icon size={13} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <span className="text-xl font-bold font-mono text-[#E8E8E8]">{st.val}</span>
                    <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{st.desc}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.25 }}
            className="grid grid-cols-1 gap-6"
          >
            <Card hoverEffect={false} padding="md" theme="admin">
              <h3 className="font-display text-base font-semibold mb-6">Escrow GMV & Platform Commissions (MTD)</h3>
              <div className="h-80 w-full text-xs">
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
                      <XAxis dataKey="date" stroke="#8C8C8C" />
                      <YAxis stroke="#8C8C8C" />
                      <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#E8E8E8' }} />
                      <Area type="monotone" name="Revenue (₹)" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8C8C8C]">No revenue data available</div>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
