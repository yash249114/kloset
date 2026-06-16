'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, RefreshCcw, CreditCard } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import type { AdminTransactionEntry, AdminStats } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminTransactionEntry[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [txList, adminStats] = await Promise.all([
        adminAPI.getPaymentTransactions(1, 50),
        adminAPI.getStats(),
      ]);
      setPayments(txList.transactions || []);
      setStats(adminStats);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

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
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">Finance</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">Payment Transactions</h1>
        </div>
        <button onClick={() => loadPayments(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', val: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`, desc: 'Gross escrow volume' },
          { label: 'Total Bookings', val: (stats?.total_bookings || 0).toString(), desc: 'Completed transactions' },
          { label: 'Active Rentals', val: (stats?.active_bookings || 0).toString(), desc: 'Ongoing rentals' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: i * 0.05 }}>
            <Card padding="sm" theme="admin" className="flex flex-col justify-between h-24">
              <div className="flex items-center justify-between text-[#8C8C8C]">
                <span className="text-[9px] font-mono tracking-wider uppercase">{s.label}</span>
                <DollarSign size={13} className="text-[#C9A96E]" />
              </div>
              <div>
                <span className="text-xl font-bold font-mono text-[#E8E8E8]">{s.val}</span>
                <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{s.desc}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card padding="md" theme="admin">
        {loading ? (
          <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-12 bg-[#2A2A2A] rounded" />)}</div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign size={28} className="mx-auto text-[#C9A96E] mb-3" />
            <p className="text-xs font-mono text-[#8C8C8C]">All payment transactions will appear here once processed through Razorpay escrow.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-[9px] font-mono uppercase text-[#8C8C8C] tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Booking Ref</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Gateway</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]/40">
                {payments.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-[#E8E8E8]">{t.user_name}</p>
                        <span className="text-[#8C8C8C] text-[10px] font-mono">{t.user_id}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[#8C8C8C]">{t.booking_ref}</td>
                    <td className="py-4 text-[#8C8C8C] font-mono lowercase">{t.type.replace('_', ' ')}</td>
                    <td className="py-4 font-mono font-bold text-[#E8E8E8]">₹{t.amount.toLocaleString()}</td>
                    <td className="py-4 text-[#8C8C8C] font-mono uppercase">{t.gateway}</td>
                    <td className="py-4 text-[#8C8C8C]">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <Badge variant={t.status === 'successful' ? 'success' : t.status === 'pending' ? 'gold' : 'error'}>{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
