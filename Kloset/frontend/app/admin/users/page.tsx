'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, RefreshCcw, X, Check } from 'lucide-react';
import { adminAPI, AdminUserEntry } from '@/lib/api';
import client from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set());
  const [banningId, setBanningId] = useState<string | null>(null);

  const loadUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const list = await adminAPI.getUsers();
      setUsers(list);
    } catch {
      toast.error('Failed to load user registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBan = async (userId: string, name: string, currentlyBanned: boolean) => {
    setBanningId(userId);
    try {
      await client.post(`/admin/users/${userId}/ban`);
      setBannedIds(prev => {
        const next = new Set(prev);
        if (currentlyBanned) next.delete(userId);
        else next.add(userId);
        return next;
      });
      toast.success(`${currentlyBanned ? 'Unbanned' : 'Banned'} ${name}`);
    } catch {
      toast.error(`Failed to ${currentlyBanned ? 'unban' : 'ban'} ${name}.`);
    } finally {
      setBanningId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.phone.includes(query)
  );

  const renterCount = users.filter((u) => u.role === 'renter').length;
  const sellerCount = users.filter((u) => u.role === 'seller').length;

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
            User Registry
          </h1>
        </div>
        <button
          onClick={() => loadUsers(true)}
          className="h-10 px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold"
        >
          <RefreshCcw size={12} /> Sync Registry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', val: users.length.toString(), desc: 'All registered accounts' },
          { label: 'Renters', val: renterCount.toString(), desc: 'Active renter profiles' },
          { label: 'Sellers', val: sellerCount.toString(), desc: 'Registered boutiques' },
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
            placeholder="Search users by name, email, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[52px] pl-12 pr-4 text-sm font-sans bg-[#1A1A1A] border border-[#2A2A2A] rounded outline-none focus:border-[#C9A96E] text-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card hoverEffect={false} padding="md" theme="admin">
        <h3 className="font-display text-base font-semibold mb-6">Registered User Profiles</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-16 rounded bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8C8C8C]">No users found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-[9px] font-mono uppercase text-[#8C8C8C] tracking-wider">
                  <th className="pb-3 font-semibold">User Details</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Trust Score</th>
                  <th className="pb-3 font-semibold">KYC</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold text-right">Verified</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]/40">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-[#E8E8E8]">{u.name}</p>
                        <span className="text-[#8C8C8C] text-[10px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[#8C8C8C] font-mono">{u.phone}</td>
                    <td className="py-4">
                      <Badge variant={u.role === 'admin' ? 'gold' : u.role === 'seller' ? 'sage' : 'outline'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 font-mono font-bold text-[#C9A96E]">
                        <Star size={11} className="fill-current text-[#C9A96E]" /> {u.trust_score}%
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge variant={u.kyc_status === 'verified' ? 'success' : 'gold'}>
                        {u.kyc_status}
                      </Badge>
                    </td>
                    <td className="py-4 text-[#8C8C8C]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <Badge variant={u.is_verified ? 'success' : 'error'}>
                        {u.is_verified ? 'yes' : 'no'}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => toggleBan(u.id, u.name, bannedIds.has(u.id))}
                        disabled={banningId === u.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border cursor-pointer transition-colors disabled:opacity-50 ${
                          bannedIds.has(u.id)
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/20'
                            : 'bg-error/10 text-error border-error/30 hover:bg-error/20'
                        }`}
                      >
                        {banningId === u.id ? (
                          <RefreshCcw size={11} className="animate-spin" />
                        ) : bannedIds.has(u.id) ? (
                          <Check size={11} />
                        ) : (
                          <X size={11} />
                        )}
                        {bannedIds.has(u.id) ? 'Unban' : 'Ban'}
                      </button>
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
