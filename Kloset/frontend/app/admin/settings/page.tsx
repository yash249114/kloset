'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { adminAPI, AdminSettings } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await adminAPI.getSettings();
      setSettings(data);
    } catch {
      toast.error('Failed to load platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Platform configurations saved successfully.');
    } catch {
      toast.error('Failed to save platform configurations.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AdminSettings, value: number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Settings
          </h1>
        </div>
        <button
          onClick={() => loadSettings(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Reload Config
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-20 rounded bg-[#1A1A1A] animate-pulse" />
          ))}
        </div>
      ) : !settings ? (
        <Card hoverEffect={false} padding="md" theme="admin">
          <div className="py-12 text-center text-[#8C8C8C]">Failed to load platform settings.</div>
        </Card>
      ) : (
        <>
          {/* Platform Config */}
          <Card hoverEffect={false} padding="md" theme="admin" className="max-w-3xl">
            <h3 className="font-display text-base font-semibold mb-6 pb-3 border-b border-[#2A2A2A]">
              Rental Configuration
            </h3>
            <form onSubmit={handleSave} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    Platform Take-Rate Commission (%)
                  </label>
                  <input
                    type="number"
                    value={settings.platform_take_rate}
                    onChange={(e) => updateField('platform_take_rate', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    GST / Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.gst_rate}
                    onChange={(e) => updateField('gst_rate', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    Standard Dry-Cleaning Base Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.cleaning_fee}
                    onChange={(e) => updateField('cleaning_fee', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    Security Deposit Multiplier
                  </label>
                  <input
                    type="number"
                    value={settings.security_deposit_multiplier}
                    onChange={(e) => updateField('security_deposit_multiplier', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    Min Rental Days
                  </label>
                  <input
                    type="number"
                    value={settings.min_rental_days}
                    onChange={(e) => updateField('min_rental_days', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    Max Rental Days
                  </label>
                  <input
                    type="number"
                    value={settings.max_rental_days}
                    onChange={(e) => updateField('max_rental_days', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C] font-bold block mb-1">
                    Auto-Release Days
                  </label>
                  <input
                    type="number"
                    value={settings.auto_release_days}
                    onChange={(e) => updateField('auto_release_days', Number(e.target.value))}
                    className="w-full h-[52px] px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#E8E8E8] text-sm outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[#2A2A2A] text-right">
                <Button
                  type="submit"
                  variant="gold"
                  isLoading={saving}
                  className="px-10 cursor-pointer"
                >
                  Save Configurations
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </motion.div>
  );
}
