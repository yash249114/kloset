'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, BarChart2, DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { adminAPI, AdminStats } from '@/lib/api';
import type { RevenueData } from '@/types';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function AdminAnalyticsPage() {
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
      toast.error('Failed to load analytics data.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Analytics Overview
          </h1>
        </div>
        <button
          onClick={() => loadStats(true)}
          className="h-[52px] px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Revenue', val: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`, desc: 'Gross commission released', icon: DollarSign },
              { label: 'Active Rentals', val: stats?.active_bookings?.toString() || '0', desc: 'Outfits currently in use', icon: Package },
              { label: 'Total Users', val: stats?.total_users?.toString() || '0', desc: 'Registered renter/seller profiles', icon: Users },
              { label: 'Total Bookings', val: stats?.total_bookings?.toString() || '0', desc: 'All-time rental transactions', icon: BarChart2 },
              { label: 'Pending Approvals', val: stats?.pending_approval_count?.toString() || '0', desc: 'Listings awaiting review', icon: TrendingUp },
            ].map((st) => (
              <Card key={st.label} hoverEffect={true} padding="sm" theme="admin" className="flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-[#8C8C8C]">
                  <span className="text-[9px] font-mono tracking-wider uppercase">{st.label}</span>
                  <st.icon size={13} className="text-[#C9A96E]" />
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-[#E8E8E8]">{st.val}</span>
                  <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{st.desc}</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card hoverEffect={false} padding="md" theme="admin">
              <h3 className="font-display text-base font-semibold mb-6">Platform Revenue & Bookings (MTD)</h3>
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
                  <div className="h-full flex items-center justify-center text-[#8C8C8C] text-xs">No revenue data available</div>
                )}
              </div>
            </Card>

            <Card hoverEffect={false} padding="md" theme="admin">
              <h3 className="font-display text-base font-semibold mb-6">Daily Booking Volume</h3>
              <div className="h-80 w-full text-xs">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis dataKey="date" stroke="#8C8C8C" />
                      <YAxis stroke="#8C8C8C" />
                      <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#E8E8E8' }} />
                      <Bar dataKey="bookings" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8C8C8C] text-xs">No booking data available</div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card hoverEffect={false} padding="md" theme="admin">
              <h3 className="font-display text-base font-semibold mb-6">Platform Health</h3>
              <div className="space-y-4 text-sm">
                {[
                  { label: 'Open Disputes', val: stats?.open_disputes || 0, color: '#E07070' },
                  { label: 'KYC Queue', val: stats?.kyc_queue_count || 0, color: '#C9A96E' },
                  { label: 'Pending Approvals', val: stats?.pending_approval_count || 0, color: '#B76E79' },
                  { label: 'Total Outfits', val: stats?.total_outfits || 0, color: '#4CAF7D' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#E8E8E8]">{item.label}</span>
                      <span className="font-mono font-bold" style={{ color: item.color }}>{item.val}</span>
                    </div>
                    <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min((item.val / Math.max(stats?.total_outfits || 1, 1)) * 100, 100)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card hoverEffect={false} padding="md" theme="admin">
              <h3 className="font-display text-base font-semibold mb-6">Revenue Breakdown</h3>
              <div className="space-y-4 text-sm">
                {[
                  { label: 'Gross GMV', val: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`, desc: 'Total transaction volume' },
                  { label: 'Platform Commission', val: `₹${((stats?.total_revenue || 0) * 0.05).toLocaleString('en-IN')}`, desc: '5% take rate applied' },
                  { label: 'GST Collected', val: `₹${((stats?.total_revenue || 0) * 0.08).toLocaleString('en-IN')}`, desc: '8% tax rate applied' },
                  { label: 'Seller Payouts', val: `₹${((stats?.total_revenue || 0) * 0.87).toLocaleString('en-IN')}`, desc: 'Net to boutique accounts' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between p-3 bg-[#1A1A1A] rounded">
                    <div>
                      <span className="text-[#E8E8E8]">{item.label}</span>
                      <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{item.desc}</span>
                    </div>
                    <span className="font-mono text-[#C9A96E] font-bold">{item.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card hoverEffect={false} padding="md" theme="admin">
              <h3 className="font-display text-base font-semibold mb-6">Quick Actions</h3>
              <div className="space-y-3 text-sm">
                <a href="/admin/kyc" className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer">
                  <span className="text-[#E8E8E8]">Review KYC Queue</span>
                  <span className="font-mono text-[#C9A96E]">{stats?.kyc_queue_count || 0} pending</span>
                </a>
                <a href="/admin/listings" className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer">
                  <span className="text-[#E8E8E8]">Approve Listings</span>
                  <span className="font-mono text-[#C9A96E]">{stats?.pending_approval_count || 0} pending</span>
                </a>
                <a href="/admin/disputes" className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer">
                  <span className="text-[#E8E8E8]">Resolve Disputes</span>
                  <span className="font-mono text-[#E07070]">{stats?.open_disputes || 0} open</span>
                </a>
                <a href="/admin/transactions" className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded hover:bg-[#1C1C1C] transition-colors cursor-pointer">
                  <span className="text-[#E8E8E8]">View Transactions</span>
                  <span className="font-mono text-[#4CAF7D]">Live</span>
                </a>
              </div>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
