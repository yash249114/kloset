'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCcw, Check, X, Edit, Trash2, Eye } from 'lucide-react';
import { adminAPI, AdminPendingOutfit } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminPendingOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadListings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const resp = await adminAPI.getPendingOutfits();
      setListings(resp || []);
    } catch {
      toast.error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filtered = listings.filter((l) => {
    const matchesQuery = l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.seller_name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveOutfit(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Listing approved.');
    } catch {
      toast.error('Failed to approve listing.');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await adminAPI.rejectOutfit(id, reason);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Listing rejected.');
    } catch {
      toast.error('Failed to reject listing.');
    }
  };

  return (
    <div className="space-y-8 text-left select-none bg-admin-bg min-h-screen text-[#E8E8E8] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold block">
            Operational Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-[#E8E8E8] mt-1">
            Listing Management
          </h1>
        </div>
        <button onClick={() => loadListings(true)} className="h-[52px] px-4 border border-[#2A2A2A] hover:bg-[#1A1A1A] text-[#C9A96E] rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono uppercase font-bold">
          <RefreshCcw size={12} /> Sync Listings
        </button>
      </div>

      <Card hoverEffect={false} padding="md" theme="admin">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" size={16} />
            <input
              type="text"
              placeholder="Search by title, seller..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-[52px] pl-12 pr-4 text-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded outline-none focus:border-[#C9A96E] text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 h-[52px] px-4 text-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded outline-none focus:border-[#C9A96E] text-white"
          >
            <option value="all">All Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-28 rounded bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8C8C8C]">
            No listings found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-[#2A2A2A] rounded-lg bg-[#1A1A1A] flex flex-col sm:flex-row gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-20 rounded overflow-hidden bg-[#2A2A2A] flex-shrink-0">
                    <img src={listing.images[0]?.url || '/placeholder-outfit.jpg'} alt={listing.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-medium text-[#E8E8E8] truncate">{listing.title}</h4>
                    <p className="text-[10px] text-[#8C8C8C]">Seller: {listing.seller_name} ({listing.seller_email})</p>
                    <p className="text-[10px] font-mono text-[#C9A96E]">₹{listing.price_1day}/day • Deposit: ₹{listing.security_deposit}</p>
                    <Badge variant={listing.status === 'pending_approval' ? 'gold' : 'error'} className="text-[9px]">
                      {listing.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" onClick={() => handleApprove(listing.id)} className="h-10 px-4 text-success hover:bg-success/10">
                    <Check size={14} /> Approve
                  </Button>
                  <Button variant="ghost" onClick={() => handleReject(listing.id)} className="h-10 px-4 text-error hover:bg-error/10">
                    <X size={14} /> Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}