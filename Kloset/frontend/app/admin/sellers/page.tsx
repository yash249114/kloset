'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ShieldCheck, RefreshCcw } from 'lucide-react';
import { adminAPI, AdminSellerEntry } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<AdminSellerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadSellers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const list = await adminAPI.getSellers();
      setSellers(list);
    } catch {
      toast.error('Failed to load seller registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await loadSellers(); };
    init();
  }, []);

  const filtered = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()) ||
      (s.business_name && s.business_name.toLowerCase().includes(query.toLowerCase()))
  );

  const verifiedCount = sellers.filter((s) => s.is_verified).length;

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
            Seller Registry
          </h1>
        </div>
        <button
          onClick={() => loadSellers(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync Registry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sellers', val: sellers.length.toString(), desc: 'Registered boutiques' },
          { label: 'Verified', val: verifiedCount.toString(), desc: 'Passed KYC verification' },
          { label: 'Pending', val: (sellers.length - verifiedCount).toString(), desc: 'Awaiting verification' },
        ].map((st) => (
          <Card key={st.label} hoverEffect={false} padding="sm" theme="admin" className="flex flex-col justify-between h-24">
            <span className="text-[9px] font-mono tracking-wider uppercase text-[#8C8C8C]">{st.label}</span>
            <div>
              <span className="text-xl font-bold font-mono text-[#E8E8E8]">{st.val}</span>
              <span className="text-[8px] text-[#8C8C8C] block mt-0.5">{st.desc}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" size={16} />
          <input
            type="text"
            placeholder="Search sellers by name, email, or business..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[52px] pl-12 pr-4 text-sm font-sans bg-[#1A1A1A] border border-[#2A2A2A] rounded outline-none focus:border-[#C9A96E] text-white"
          />
        </div>
      </div>

      {/* Table */}
      <Card hoverEffect={false} padding="md" theme="admin">
        <h3 className="font-display text-base font-semibold mb-6">Registered Seller Boutiques</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-16 rounded bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8C8C8C]">No sellers found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-[9px] font-mono uppercase text-[#8C8C8C] tracking-wider">
                  <th className="pb-3 font-semibold">Boutique Store</th>
                  <th className="pb-3 font-semibold">Business Name</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold">Trust Rating</th>
                  <th className="pb-3 font-semibold">KYC</th>
                  <th className="pb-3 font-semibold">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]/40">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#E8E8E8]">{s.name}</span>
                          {s.is_verified && <ShieldCheck size={13} className="text-[#4CAF7D]" />}
                        </div>
                        <span className="text-[#8C8C8C] text-[10px]">{s.email}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[#8C8C8C] font-mono">{s.business_name || '—'}</td>
                    <td className="py-4 text-[#8C8C8C]">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 font-mono font-bold text-[#C9A96E]">
                        <Star size={11} className="fill-current text-[#C9A96E]" /> {s.trust_score}%
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge variant={s.kyc_status === 'verified' ? 'success' : 'gold'}>
                        {s.kyc_status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant={s.is_verified ? 'success' : 'outline'}>
                        {s.is_verified ? 'verified' : 'unverified'}
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
