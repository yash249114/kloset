'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, RefreshCcw, Search, CheckCircle2, XCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const stats = await adminAPI.getStats();
      setPayments([]);
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
        <button onClick={loadPayments}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue MTD', val: '₹2,45,000', desc: 'Gross escrow volume' },
          { label: 'Pending Payouts', val: '₹42,000', desc: 'Awaiting settlement' },
          { label: 'Platform Commission', val: '₹12,250', desc: '5% take rate' },
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
        ) : (
          <div className="py-16 text-center">
            <DollarSign size={28} className="mx-auto text-[#C9A96E] mb-3" />
            <p className="text-xs font-mono text-[#8C8C8C]">All payment transactions will appear here once processed through Razorpay escrow.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
