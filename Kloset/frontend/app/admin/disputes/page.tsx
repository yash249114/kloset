'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Scale, RefreshCcw } from 'lucide-react';
import { adminAPI, AdminDispute } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Resolution states
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [resolution, setResolution] = useState('refund_renter');
  const [note, setNote] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [resolving, setResolving] = useState(false);

  const loadDisputes = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const list = await adminAPI.getDisputes();
      setDisputes(list);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await loadDisputes();
    }
    init();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setResolving(true);
    try {
      await adminAPI.resolveDispute(selectedDispute.id, {
        resolution,
        note,
        refund_amount: Number(refundAmount),
      });
      toast.success('Dispute resolved. Escrow payouts adjusted accordingly.');
      setSelectedDispute(null);
      setNote('');
      setRefundAmount(0);
      loadDisputes(true);
    } catch {
      toast.error('Failed to register dispute resolution.');
    } finally {
      setResolving(false);
    }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans"
    >
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Resolutions Center
          </h1>
        </div>
        <button 
          onClick={() => loadDisputes(true)}
          className="text-[#C9A96E] hover:underline text-xs font-mono uppercase tracking-widest flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          <RefreshCcw size={12} /> Sync Lists
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="shimmer h-40 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl" />
      ) : disputes.length === 0 ? (
        <p className="text-xs text-charcoal-light py-6 text-center font-light">No escalated dispute cases active.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {disputes.map((d, index) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: index * 0.05 }}
            >
              <Card hoverEffect={false} padding="md" theme="admin" className="flex flex-col md:flex-row justify-between gap-6 items-start w-full">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-charcoal-light font-bold">Case Ref: {d.id}</span>
                    <Badge variant={d.status === 'resolved' || d.status === 'closed' ? 'sage' : 'gold'}>
                      {d.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold text-[#E8E8E8]">
                      {d.outfit_title}
                    </h4>
                    <p className="text-[10px] text-[#8C8C8C]">
                      Customer: {d.renter_name} | Security deposit held: ₹{d.deposit_amount}
                    </p>
                  </div>
                  <div className="p-3 border border-[#2A2A2A] bg-[#131313] rounded text-xs text-[#8C8C8C] space-y-1">
                    <span className="font-bold text-[#C9A96E]">Dispute Reason: {d.reason}</span>
                    <p className="leading-relaxed font-light">{d.description}</p>
                  </div>
                </div>

                {d.status === 'open' && (
                  <div className="self-end md:self-center flex-shrink-0">
                    <Button
                      variant="gold"
                      onClick={() => {
                        setSelectedDispute(d);
                        setRefundAmount(d.deposit_amount);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-mono uppercase"
                    >
                      <Scale size={14} /> Resolve Case
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* RESOLUTION MODAL */}
      <Modal
        isOpen={selectedDispute !== null}
        onClose={() => setSelectedDispute(null)}
        title="Escalate Dispute Resolution"
      >
        {selectedDispute && (
          <form onSubmit={handleResolve} className="space-y-6 text-left">
            <div>
              <label className="text-[10px] font-mono tracking-widest uppercase text-charcoal-light font-bold block mb-1">
                Escrow Adjustments Policy
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full h-[52px] px-4 border border-border bg-warm-white rounded outline-none text-xs font-mono uppercase tracking-wider text-charcoal"
              >
                <option value="refund_renter">100% Refund Renter (Release Escrow)</option>
                <option value="payout_seller">100% Payout Host (Forfeit Deposit)</option>
                <option value="split_resolution">Split Escrow Release</option>
              </select>
            </div>

            <Input
              type="number"
              label="Refund Amount released to Renter (₹)"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              max={selectedDispute.deposit_amount}
              required
            />

            <div>
              <label className="text-[10px] font-mono tracking-widest uppercase text-charcoal-light font-bold block mb-1">
                Internal Auditor Resolution Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[100px] p-4 text-xs font-sans bg-warm-white border border-border rounded outline-none"
                placeholder="Detail verification steps, photos analyzed, and reason for payout modifications..."
                required
              />
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setSelectedDispute(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" isLoading={resolving}>
                Release Escrow Funds
              </Button>
            </div>
          </form>
        )}
      </Modal>

      </motion.div>
  );
}
