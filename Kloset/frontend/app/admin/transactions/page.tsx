'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, CreditCard, DollarSign } from 'lucide-react';
import { adminAPI, AdminTransactionEntry } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<AdminTransactionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadTransactions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const list = await adminAPI.getTransactions();
      setTxs(list);
    } catch {
      toast.error('Failed to load escrow transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = txs.filter((t) => filter === 'all' || t.status === filter);

  const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
  const successfulCount = txs.filter((t) => t.status === 'successful').length;

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Escrow Transactions
          </h1>
        </div>
        <button
          onClick={() => loadTransactions(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync Ledger
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Volume', val: `₹${totalAmount.toLocaleString('en-IN')}`, desc: 'Gross transaction volume', icon: DollarSign },
          { label: 'Successful', val: successfulCount.toString(), desc: 'Completed transactions', icon: CreditCard },
          { label: 'Total Records', val: txs.length.toString(), desc: 'All escrow entries', icon: RefreshCcw },
        ].map((st) => (
          <Card key={st.label} hoverEffect={false} padding="sm" theme="admin" className="flex flex-col justify-between h-24">
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

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'successful', 'pending', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-9 px-4 rounded text-[10px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
              filter === f
                ? 'bg-[#C9A96E]/10 border-[#C9A96E]/30 text-[#C9A96E]'
                : 'bg-transparent border-[#2A2A2A] text-[#8C8C8C] hover:bg-[#1A1A1A]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <Card hoverEffect={false} padding="md" theme="admin">
        <h3 className="font-display text-base font-semibold mb-6">Escrow Transaction Logs</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-12 rounded bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8C8C8C]">No transactions found for the selected filter.</div>
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
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-[#E8E8E8]">{t.user_name}</p>
                        <span className="text-[#8C8C8C] text-[10px] font-mono">{t.user_id}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[#8C8C8C]">{t.booking_ref}</td>
                    <td className="py-4 text-[#8C8C8C] font-mono lowercase">
                      {t.type.replace('_', ' ')}
                    </td>
                    <td className="py-4 font-mono font-bold text-[#E8E8E8]">₹{t.amount.toLocaleString()}</td>
                    <td className="py-4 text-[#8C8C8C] font-mono uppercase">{t.gateway}</td>
                    <td className="py-4 text-[#8C8C8C]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <Badge
                        variant={
                          t.status === 'successful'
                            ? 'success'
                            : t.status === 'pending'
                            ? 'gold'
                            : 'error'
                        }
                      >
                        {t.status}
                      </Badge>
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
