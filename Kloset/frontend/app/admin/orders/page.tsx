'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCcw, Eye } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import type { Booking } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const resp = await adminAPI.getBookings(1, 50);
      setOrders(resp.bookings || []);
    } catch {
      toast.error('Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const filteredOrders = query
    ? orders.filter(o =>
        (o.booking_ref?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (o.renter?.name?.toLowerCase() || '').includes(query.toLowerCase())
      )
    : orders;

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
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">Operations</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">All Orders</h1>
        </div>
        <button onClick={() => loadOrders(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" size={16} />
        <input type="text" placeholder="Search by booking ref or renter..." value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-[48px] pl-12 pr-4 text-xs font-sans bg-[#1A1A1A] border border-[#2A2A2A] rounded outline-none focus:border-[#C9A96E] text-[#E8E8E8] placeholder-[#8C8C8C]" />
      </div>

      <Card padding="md" theme="admin">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-[#2A2A2A] rounded" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs font-mono text-[#8C8C8C]">No orders found matching your search.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] text-[9px] font-mono uppercase text-[#8C8C8C] tracking-wider">
                <th className="pb-3 font-semibold">Booking Ref</th>
                <th className="pb-3 font-semibold">Renter</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-4 font-mono font-bold text-[#E8E8E8]">{order.booking_ref}</td>
                  <td className="py-4 text-[#8C8C8C]">{order.renter?.name || 'N/A'}</td>
                  <td className="py-4 font-mono">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                  <td className="py-4"><Badge variant="gold">{order.status}</Badge></td>
                  <td className="py-4 text-right">
                    <button className="text-[#C9A96E] hover:text-white transition-colors cursor-pointer"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </motion.div>
  );
}
