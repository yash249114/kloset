'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Star, Calendar, RefreshCcw, LayoutGrid, TrendingUp, Eye, Package, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { outfitsAPI, bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function KPICard({ label, val, desc, icon: Icon, trend, index }: { label: string; val: string; desc: string; icon: React.ElementType; trend?: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springTransition, delay: index * 0.05 }}
    >
      <div className="flex flex-col justify-between h-32 bg-white border border-border/60 rounded-2xl p-5 w-full relative overflow-hidden group hover:shadow-lg hover:border-champagne/20 transition-all duration-300 cursor-default">
        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-gradient-to-br from-champagne/10 to-champagne/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between text-charcoal-light relative">
          <span className="text-[10px] font-mono tracking-wider uppercase font-bold">{label}</span>
          <div className="w-8 h-8 rounded-xl bg-champagne/10 flex items-center justify-center">
            <Icon size={15} className="text-champagne" />
          </div>
        </div>
        <div className="relative">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-charcoal font-mono">{val}</span>
            {trend && (
              <span className="text-[9px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
          <span className="text-[10px] text-charcoal-light block mt-1 font-light">{desc}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [listingsCount, setListingsCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const outfitsResp = await outfitsAPI.getSellerOutfits(1);
      setListingsCount(outfitsResp.meta?.total || 0);
      const bookingsResp = await bookingsAPI.listSellerBookings(1, 5);
      setBookings(bookingsResp.bookings || []);
    } catch (err) {
      console.warn('Failed to load seller dashboard details:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEarnings = bookings
    .filter((b) => b.status === 'completed' || b.status === 'returned')
    .reduce((acc, b) => acc + b.rental_amount, 0);

  const activeRentals = bookings.filter((b) => ['confirmed', 'picked_up', 'in_use'].includes(b.status));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none text-left">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="shimmer h-3 bg-ivory-dark rounded-full w-24" />
            <div className="shimmer h-8 bg-ivory-dark rounded-lg w-48" />
          </div>
          <div className="shimmer h-11 bg-ivory-dark rounded-lg w-36" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-border/60 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between">
                <div className="shimmer h-3 bg-ivory-dark rounded w-16" />
                <div className="shimmer h-8 bg-ivory-dark rounded-xl w-8" />
              </div>
              <div className="shimmer h-6 bg-ivory-dark rounded w-20" />
              <div className="shimmer h-2 bg-ivory-dark rounded w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8 h-64 bg-white border border-border/60 rounded-2xl p-6" />
          <div className="lg:col-span-4 h-64 bg-white border border-border/60 rounded-2xl p-6" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">
            Seller Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">
            Studio Overview
          </h1>
          <p className="text-xs text-charcoal-light font-mono mt-1">Welcome back, {user?.name || 'Designer'}</p>
        </div>
        <Link
          href="/seller/listings"
          className="btn btn-gold h-11 px-6 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 self-start sm:self-auto cursor-pointer !rounded-xl"
        >
          <Plus size={14} /> Add New Couture
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Listings" val={listingsCount.toString()} desc="Designs in wardrobe" icon={LayoutGrid} trend="active" index={0} />
        <KPICard label="Active Rentals" val={activeRentals.length.toString()} desc="Outfits currently rented" icon={Calendar} trend={`${activeRentals.length} ongoing`} index={1} />
        <KPICard label="Studio Earnings" val={`₹${totalEarnings.toLocaleString('en-IN')}`} desc="Escrow released funds" icon={DollarSign} trend="MTD" index={2} />
        <KPICard label="Trust Score" val={`${user?.trust_score || 98}%`} desc="Based on quality audits" icon={Star} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Calendar size={15} className="text-champagne" /> Recent Rental Activity
            </h3>
            <button
              onClick={() => loadData(true)}
              className="text-[10px] font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <RefreshCcw size={12} /> Sync
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 text-center text-charcoal-light">
              <div className="w-16 h-16 mx-auto rounded-full bg-champagne/5 flex items-center justify-center mb-4">
                <Package size={24} className="text-champagne" />
              </div>
              <p className="text-sm font-light">No recent rental transactions registered for your outfits.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-[9px] font-mono uppercase text-charcoal-light tracking-wider">
                    <th className="pb-3 pl-6 font-bold">Booking Ref</th>
                    <th className="pb-3 font-bold">Couture Listing</th>
                    <th className="pb-3 font-bold">Renter</th>
                    <th className="pb-3 font-bold">Timeline</th>
                    <th className="pb-3 font-bold">Revenue</th>
                    <th className="pb-3 pr-6 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bookings.map((b, idx) => (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springTransition, delay: idx * 0.03 }}
                      className="hover:bg-ivory/30 transition-colors duration-200"
                    >
                      <td className="py-4 pl-6 font-mono font-bold text-charcoal">{b.booking_ref}</td>
                      <td className="py-4 font-medium text-charcoal max-w-[200px] truncate">
                        {b.outfit?.title || 'Heritage Design'}
                      </td>
                      <td className="py-4 text-charcoal-light">{b.renter?.name || 'Customer'}</td>
                      <td className="py-4 text-charcoal-light font-mono text-[10px]">
                        {new Date(b.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} &mdash;{' '}
                        {new Date(b.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-4 font-mono text-charcoal font-bold">₹{b.total_amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 pr-6 text-right">
                        <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'sage' : b.status === 'pending' ? 'gold' : 'rose'}>
                          {b.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold border-b border-border/40 pb-4 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-champagne" /> Quick Actions
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Manage Listings', href: '/seller/listings', icon: LayoutGrid, desc: `${listingsCount} designs in wardrobe` },
              { label: 'View Orders', href: '/seller/orders', icon: Calendar, desc: `${activeRentals.length} active rentals` },
              { label: 'Analytics', href: '/seller/analytics', icon: TrendingUp, desc: 'Performance insights' },
              { label: 'Earnings', href: '/seller/earnings', icon: DollarSign, desc: `₹${totalEarnings.toLocaleString('en-IN')} earned` },
            ].map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springTransition, delay: 0.2 + i * 0.05 }}
              >
                <Link href={item.href}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-champagne/40 hover:bg-ivory/30 hover:shadow-sm transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-champagne/5 border border-champagne/20 flex items-center justify-center flex-shrink-0 group-hover:bg-champagne/10 transition-colors">
                      <item.icon size={16} className="text-champagne" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-charcoal block">{item.label}</span>
                      <span className="text-[10px] text-charcoal-light font-mono">{item.desc}</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-champagne/60 group-hover:text-champagne group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
