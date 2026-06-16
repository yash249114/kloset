'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Smartphone, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { bankAPI, upiAPI } from '@/lib/api';
import type { BankAccount, UPIID } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export default function SellerSettingsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [upiIds, setUpiIds] = useState<UPIID[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBankForm, setShowBankForm] = useState(false);
  const [showUPIForm, setShowUPIForm] = useState(false);

  const [bankForm, setBankForm] = useState({ account_holder_name: '', bank_name: '', account_number: '', ifsc_code: '' });
  const [upiForm, setUpiForm] = useState({ upi_id: '' });
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'bank' | 'upi'; id: string } | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [banks, upis] = await Promise.all([bankAPI.list(), upiAPI.list()]);
      setBankAccounts(banks);
      setUpiIds(upis);
    } catch {
      toast.error('Failed to load payout settings.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await loadData(); };
    init();
  }, []);

  const validateUPI = (upi: string): string | null => {
    if (!upi.trim()) return 'UPI ID is required';
    if (!UPI_REGEX.test(upi.trim())) return 'Invalid UPI format (e.g. name@bank)';
    return null;
  };

  const validateIFSC = (ifsc: string): string | null => {
    if (!ifsc.trim()) return 'IFSC code is required';
    if (!IFSC_REGEX.test(ifsc.toUpperCase())) return 'Invalid IFSC format (e.g. HDFC0000241)';
    return null;
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const ifscError = validateIFSC(bankForm.ifsc_code);
    if (ifscError) { toast.error(ifscError); return; }
    if (!bankForm.account_holder_name.trim() || !bankForm.bank_name.trim() || !bankForm.account_number.trim()) {
      toast.error('Please fill in all bank fields.'); return;
    }
    setSaving(true);
    try {
      await bankAPI.create({
        ...bankForm,
        account_number: bankForm.account_number.trim(),
        ifsc_code: bankForm.ifsc_code.toUpperCase().trim(),
      });
      toast.success('Bank account added successfully.');
      setShowBankForm(false);
      setBankForm({ account_holder_name: '', bank_name: '', account_number: '', ifsc_code: '' });
      loadData(true);
    } catch { toast.error('Failed to add bank account.'); }
    finally { setSaving(false); }
  };

  const handleAddUPI = async (e: React.FormEvent) => {
    e.preventDefault();
    const upiError = validateUPI(upiForm.upi_id);
    if (upiError) { toast.error(upiError); return; }
    setSaving(true);
    try {
      await upiAPI.create({ upi_id: upiForm.upi_id.trim() });
      toast.success('UPI ID added successfully.');
      setShowUPIForm(false);
      setUpiForm({ upi_id: '' });
      loadData(true);
    } catch { toast.error('Failed to add UPI ID.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'bank') {
        await bankAPI.delete(deleteConfirm.id);
        toast.success('Bank account removed.');
      } else {
        await upiAPI.delete(deleteConfirm.id);
        toast.success('UPI ID removed.');
      }
      loadData(true);
    } catch { toast.error('Failed to remove.'); }
    finally { setDeleteConfirm(null); }
  };

  const handleSetDefaultBank = async (id: string) => {
    try {
      await bankAPI.setDefault(id);
      toast.success('Default bank account updated.');
      loadData(true);
    } catch { toast.error('Failed to set default.'); }
  };

  const handleSetDefaultUPI = async (id: string) => {
    try {
      await upiAPI.setDefault(id);
      toast.success('Default UPI ID updated.');
      loadData(true);
    } catch { toast.error('Failed to set default.'); }
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none text-left">
        <div className="h-10 bg-ivory-dark w-1/4 rounded mb-8" />
        <div className="h-40 bg-white border border-border rounded-xl" />
        <div className="h-40 bg-white border border-border rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div>
        <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Configuration</span>
        <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Payout Settings</h1>
      </div>

      {/* Bank Accounts */}
      <Card padding="lg" className="bg-white border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-champagne" />
            <h3 className="font-display text-base font-semibold">Bank Accounts</h3>
          </div>
          {!showBankForm && (
            <Button variant="gold" onClick={() => setShowBankForm(true)} className="h-[44px] text-[10px] px-4 cursor-pointer">
              <Plus size={14} className="mr-1" /> Add Bank Account
            </Button>
          )}
        </div>

        {showBankForm && (
          <form onSubmit={handleAddBank} className="p-5 border border-border/80 bg-[#FAF9F6] rounded-lg mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Account Holder Name" value={bankForm.account_holder_name}
                onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })} required />
              <Input label="Bank Name" value={bankForm.bank_name}
                onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Account Number" value={bankForm.account_number}
                onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} required />
              <Input label="IFSC Code" value={bankForm.ifsc_code}
                onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value })}
                placeholder="e.g. HDFC0000241" required />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowBankForm(false)} className="h-[44px] text-[10px] px-4 cursor-pointer">Cancel</Button>
              <Button type="submit" variant="primary" isLoading={saving} className="h-[44px] text-[10px] px-6 cursor-pointer">Save Bank Account</Button>
            </div>
          </form>
        )}

        {bankAccounts.length === 0 ? (
          <p className="text-xs font-mono text-charcoal-light font-light py-8 text-center bg-ivory-dark/30 rounded border border-dashed border-border">
            No bank accounts configured. Add a bank account for payouts.
          </p>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4 hover:border-champagne/40 transition-colors">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{acc.bank_name}</span>
                    {acc.is_verified && <Badge variant="sage"><ShieldCheck size={10} className="mr-0.5" /> Verified</Badge>}
                    {acc.is_default && <Badge variant="gold">Default</Badge>}
                  </div>
                  <p className="font-mono text-charcoal-light">{acc.account_holder_name}</p>
                  <p className="font-mono text-charcoal-light">••••{acc.account_number.slice(-4)} &middot; IFSC: {acc.ifsc_code}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!acc.is_default && (
                    <button onClick={() => handleSetDefaultBank(acc.id)}
                      className="p-2 border border-border bg-white hover:bg-ivory-dark text-charcoal-light rounded text-[9px] font-mono uppercase font-bold cursor-pointer">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => setDeleteConfirm({ type: 'bank', id: acc.id })}
                    className="p-2 border border-border bg-white hover:border-error/30 hover:text-error text-charcoal-light rounded cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* UPI IDs */}
      <Card padding="lg" className="bg-white border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-champagne" />
            <h3 className="font-display text-base font-semibold">UPI IDs</h3>
          </div>
          {!showUPIForm && (
            <Button variant="gold" onClick={() => setShowUPIForm(true)} className="h-[44px] text-[10px] px-4 cursor-pointer">
              <Plus size={14} className="mr-1" /> Add UPI ID
            </Button>
          )}
        </div>

        {showUPIForm && (
          <form onSubmit={handleAddUPI} className="p-5 border border-border/80 bg-[#FAF9F6] rounded-lg mb-6 space-y-4">
            <Input label="UPI ID" value={upiForm.upi_id}
              onChange={(e) => setUpiForm({ upi_id: e.target.value })}
              placeholder="e.g. seller@bank" helperText="Format: name@provider" required />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowUPIForm(false)} className="h-[44px] text-[10px] px-4 cursor-pointer">Cancel</Button>
              <Button type="submit" variant="primary" isLoading={saving} className="h-[44px] text-[10px] px-6 cursor-pointer">Save UPI ID</Button>
            </div>
          </form>
        )}

        {upiIds.length === 0 ? (
          <p className="text-xs font-mono text-charcoal-light font-light py-8 text-center bg-ivory-dark/30 rounded border border-dashed border-border">
            No UPI IDs configured. Add a UPI ID for instant payouts.
          </p>
        ) : (
          <div className="space-y-3">
            {upiIds.map((upi) => (
              <div key={upi.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4 hover:border-champagne/40 transition-colors">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-charcoal">{upi.upi_id}</span>
                    {upi.is_verified && <Badge variant="sage"><ShieldCheck size={10} className="mr-0.5" /> Verified</Badge>}
                    {upi.is_default && <Badge variant="gold">Default</Badge>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!upi.is_default && (
                    <button onClick={() => handleSetDefaultUPI(upi.id)}
                      className="p-2 border border-border bg-white hover:bg-ivory-dark text-charcoal-light rounded text-[9px] font-mono uppercase font-bold cursor-pointer">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => setDeleteConfirm({ type: 'upi', id: upi.id })}
                    className="p-2 border border-border bg-white hover:border-error/30 hover:text-error text-charcoal-light rounded cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Remove Payout Method"
        message={`Are you sure you want to remove this ${deleteConfirm?.type === 'bank' ? 'bank account' : 'UPI ID'}? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </motion.div>
  );
}
