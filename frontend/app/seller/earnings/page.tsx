'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Building, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/useAuthStore';
import { bookingsAPI, bankAPI, upiAPI } from '@/lib/api';
import type { Booking, BankAccount, UPIID } from '@/types';
import { toast } from 'sonner';

export default function SellerEarningsPage() {
  const { user } = useAuthStore();
  const [earningsList, setEarningsList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [upiIds, setUpiIds] = useState<UPIID[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(true);

  useEffect(() => {
    async function loadPayoutMethods() {
      try {
        const [banksResp, upisResp] = await Promise.all([
          bankAPI.list(),
          upiAPI.list(),
        ]);
        setBankAccounts(banksResp);
        setUpiIds(upisResp);
      } catch {
        console.warn('Failed to load payout methods.');
      } finally {
        setPayoutLoading(false);
      }
    }
    loadPayoutMethods();
  }, []);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const resp = await bookingsAPI.listSellerBookings(1, 10);
        setEarningsList(resp.bookings.filter((b) => b.status === 'completed' || b.status === 'returned'));
      } catch {
        console.warn('Failed to load completed payout orders.');
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  const totalBalance = user?.wallet_balance || 0;
  const defaultBank = bankAccounts.find((b) => b.is_default) || bankAccounts[0];
  const defaultUPI = upiIds.find((u) => u.is_default) || upiIds[0];
  const hasPayoutMethod = !!defaultBank || !!defaultUPI;

  const handleWithdraw = async () => {
    if (totalBalance <= 0) {
      toast.error('Your wallet balance is empty.');
      setShowWithdrawConfirm(false);
      return;
    }
    if (!hasPayoutMethod) {
      toast.error('Configure a payout method in Payout Settings first.');
      setShowWithdrawConfirm(false);
      return;
    }
    setWithdrawing(true);
    try {
      const { sellerPayoutAPI } = await import('@/lib/api');
      await sellerPayoutAPI.withdraw(totalBalance);
      toast.success('Payout withdrawal initiated! Transfer will credit in 2-3 business days.');
    } catch {
      toast.error('Failed to initiate withdrawal. Please try again or contact support.');
    } finally {
      setWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Seller Studio</span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Earnings & Payouts</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
      >
        <Card hoverEffect={false} padding="lg" className="md:col-span-7 bg-[#FAF9F6] border-border relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1 bg-champagne" />
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-champagne uppercase font-bold block">Studio Balance Wallet</span>
            <h2 className="text-4xl font-bold font-mono">₹{totalBalance.toLocaleString('en-IN')}</h2>
            <p className="text-xs text-charcoal-light leading-relaxed max-w-sm font-light">
              Released rental revenue is securely credited to your wallet after visual inspection.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="gold"
              isLoading={withdrawing}
              onClick={() => {
                if (totalBalance <= 0) { toast.error('Your wallet balance is empty.'); return; }
                if (!hasPayoutMethod) { toast.error('Configure a payout method in Payout Settings first.'); return; }
                setShowWithdrawConfirm(true);
              }}
              className="px-10 cursor-pointer"
            >
              Withdraw to {defaultBank ? 'Bank Account' : defaultUPI ? 'UPI' : 'Payout Method'}
            </Button>
          </div>
        </Card>

        <Card hoverEffect={false} padding="md" className="md:col-span-5 bg-white border-border flex flex-col justify-between">
          <div className="space-y-4 text-xs text-charcoal-light">
            <h3 className="font-display text-sm font-bold text-charcoal">Payout Methods</h3>
            {payoutLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-16 bg-ivory-dark rounded" />
              </div>
            ) : defaultBank ? (
              <div className="p-3 border border-border bg-ivory/30 rounded space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-champagne" />
                  <span className="text-[9px] uppercase tracking-wider text-charcoal-light/60">Bank</span>
                  {defaultBank.is_verified && <Badge variant="sage">Verified</Badge>}
                </div>
                <div className="font-bold text-charcoal">{defaultBank.bank_name} &middot; &bull;&bull;&bull;&bull;{defaultBank.account_number.slice(-4)}</div>
                <div className="text-charcoal">{defaultBank.account_holder_name}</div>
              </div>
            ) : defaultUPI ? (
              <div className="p-3 border border-border bg-ivory/30 rounded space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-champagne" />
                  <span className="text-[9px] uppercase tracking-wider text-charcoal-light/60">UPI</span>
                  {defaultUPI.is_verified && <Badge variant="sage">Verified</Badge>}
                </div>
                <div className="font-bold text-charcoal">{defaultUPI.upi_id}</div>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-border bg-ivory/30 rounded text-center">
                <p className="text-[10px] font-mono text-charcoal-light">No payout method configured</p>
                <Link href="/seller/settings" className="text-[10px] font-mono text-champagne underline mt-1 inline-block cursor-pointer">
                  Configure in Payout Settings
                </Link>
              </div>
            )}
          </div>
          <Link href="/seller/settings" className="text-[10px] font-mono uppercase tracking-wider text-champagne hover:text-charcoal hover:underline mt-4 text-left font-bold cursor-pointer font-sans border-0 bg-transparent inline-block">
            Manage Payout Settings
          </Link>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTransition, delay: 0.1 }}>
        <Card hoverEffect={false} padding="md" className="bg-white border-border w-full">
          <h3 className="font-display text-base font-semibold border-b border-border pb-4 mb-4">Earnings History</h3>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="shimmer h-12 bg-ivory-dark rounded" />
              <div className="shimmer h-12 bg-ivory-dark rounded" />
            </div>
          ) : earningsList.length === 0 ? (
            <p className="text-xs text-charcoal-light py-6 text-center font-light">No completed payouts registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-[9px] font-mono uppercase text-charcoal-light tracking-wider">
                    <th className="pb-3 font-semibold">Ref</th>
                    <th className="pb-3 font-semibold">Timeline Date</th>
                    <th className="pb-3 font-semibold">Design Listing</th>
                    <th className="pb-3 font-semibold">Gross Earned</th>
                    <th className="pb-3 font-semibold text-right">Escrow release</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {earningsList.map((e) => (
                    <tr key={e.id}>
                      <td className="py-4 font-mono font-bold text-charcoal">{e.booking_ref}</td>
                      <td className="py-4 text-charcoal-light">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="py-4 font-medium text-charcoal">{e.outfit?.title || 'Design item'}</td>
                      <td className="py-4 font-mono text-charcoal font-bold">₹{e.rental_amount.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <Badge variant="success">released</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleWithdraw}
        title="Withdraw Earnings"
        message={`Are you sure you want to withdraw ₹${totalBalance.toLocaleString('en-IN')} to your ${defaultBank ? 'bank account' : 'UPI ID'}?`}
        confirmLabel="Confirm Withdrawal"
        variant="info"
        isLoading={withdrawing}
      />
    </motion.div>
  );
}
