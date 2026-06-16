'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Users, Eye, RefreshCcw } from 'lucide-react';
import Card from '@/components/ui/Card';
import { bookingsAPI, outfitsAPI } from '@/lib/api';
import type { Outfit, Booking } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  lehenga: '#C9A96E',
  saree: '#B76E79',
  sherwani: '#4CAF7D',
  gown: '#D4A853',
  anarkali: '#E8D5B0',
  sharara: '#F2C4CE',
  kurta_set: '#6B6B6B',
  co_ord: '#8C8C8C',
  western: '#A0A0A0',
  other: '#555555',
};

export default function SellerAnalyticsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [outfitsResp, bookingsResp] = await Promise.all([
        outfitsAPI.getSellerOutfits(1),
        bookingsAPI.listSellerBookings(1, 50),
      ]);
      setOutfits(outfitsResp.outfits || []);
      setBookings(bookingsResp.bookings || []);
    } catch {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [outfitsResp, bookingsResp] = await Promise.all([
          outfitsAPI.getSellerOutfits(1),
          bookingsAPI.listSellerBookings(1, 50),
        ]);
        setOutfits(outfitsResp.outfits || []);
        setBookings(bookingsResp.bookings || []);
      } catch {
        toast.error('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const totalViews = useMemo(() => outfits.reduce((sum, o) => sum + (o.view_count || 0), 0), [outfits]);
  const totalWishlists = useMemo(() => outfits.reduce((sum, o) => sum + (o.wishlist_count || 0), 0), [outfits]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'completed' || b.status === 'returned'), [bookings]);
  const activeBookings = useMemo(() => bookings.filter((b) => ['confirmed', 'picked_up', 'in_use'].includes(b.status)), [bookings]);
  const totalRevenue = useMemo(() => completedBookings.reduce((sum, b) => sum + b.rental_amount, 0), [completedBookings]);
  const conversionRate = useMemo(() => {
    if (totalViews === 0) return '0%';
    return `${((completedBookings.length / totalViews) * 100).toFixed(1)}%`;
  }, [totalViews, completedBookings]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    outfits.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [outfits]);

  const monthlyBookings = useMemo(() => {
    const monthly: Record<string, { month: string; views: number; rentals: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    outfits.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = monthNames[d.getMonth()];
      if (!monthly[key]) monthly[key] = { month: label, views: 0, rentals: 0 };
      monthly[key].views += o.view_count || 0;
    });

    bookings.forEach((b) => {
      const d = new Date(b.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = monthNames[d.getMonth()];
      if (!monthly[key]) monthly[key] = { month: label, views: 0, rentals: 0 };
      monthly[key].rentals += 1;
    });

    return Object.values(monthly).slice(-6);
  }, [outfits, bookings]);

  const topOutfits = useMemo(() => {
    return [...outfits]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);
  }, [outfits]);

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">
            Seller Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">
            Studio Analytics
          </h1>
        </div>
        <button
          onClick={() => loadData(true)}
          className="text-xs font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RefreshCcw size={12} /> Sync Analytics
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-28 rounded bg-ivory-dark animate-pulse" />
            ))}
          </div>
          <div className="shimmer h-72 rounded bg-ivory-dark animate-pulse" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Wardrobe Views', val: totalViews.toLocaleString(), icon: Eye, change: `${outfits.length} listings active` },
              { label: 'Booking Conversion', val: conversionRate, icon: TrendingUp, change: `${completedBookings.length} completed` },
              { label: 'Total Earnings', val: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: Calendar, change: `${completedBookings.length} orders fulfilled` },
              { label: 'Wishlist Saves', val: totalWishlists.toLocaleString(), icon: Users, change: `${activeBookings.length} active rentals` },
            ].map((st, index) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: index * 0.05 }}
              >
                <Card hoverEffect={true} padding="sm" className="bg-white border-border flex flex-col justify-between h-28 w-full">
                  <div className="flex items-center justify-between text-charcoal-light">
                    <span className="text-[10px] font-mono tracking-wider uppercase">{st.label}</span>
                    <st.icon size={14} className="text-champagne" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-charcoal">{st.val}</span>
                    <span className="text-[8px] text-success block mt-0.5">{st.change}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Monthly Impressions & Rentals */}
            <Card hoverEffect={false} padding="md" className="lg:col-span-8 bg-white border-border">
              <h3 className="font-display text-base font-semibold mb-6">Monthly Impressions & Rentals</h3>
              <div className="h-72 w-full text-xs">
                {monthlyBookings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyBookings}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE4" />
                      <XAxis dataKey="month" stroke="#6B6B6B" />
                      <YAxis stroke="#6B6B6B" />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stroke="#C9A96E" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-charcoal-light">No impressions data yet</div>
                )}
              </div>
            </Card>

            {/* Category Popularity */}
            <Card hoverEffect={false} padding="md" className="lg:col-span-4 bg-white border-border">
              <h3 className="font-display text-base font-semibold mb-6">Category Popularity (%)</h3>
              <div className="h-72 w-full text-xs">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE4" />
                      <XAxis dataKey="category" stroke="#6B6B6B" />
                      <YAxis stroke="#6B6B6B" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#B76E79">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#C9A96E'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-charcoal-light">No listings data yet</div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Top Performing Listings */}
          {topOutfits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.3 }}
            >
              <Card hoverEffect={false} padding="md" className="bg-white border-border">
                <h3 className="font-display text-base font-semibold mb-6">Top Performing Listings</h3>
                <div className="space-y-3 text-sm">
                  {topOutfits.map((outfit, i) => (
                    <div key={outfit.id} className="flex items-center justify-between p-3 bg-ivory/30 rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-champagne">#{i + 1}</span>
                        <div className="w-10 h-12 rounded overflow-hidden bg-ivory-dark flex-shrink-0">
                          <img
                            src={outfit.images?.[0]?.url || '/placeholder-outfit.jpg'}
                            alt={outfit.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-charcoal font-bold">{outfit.title}</span>
                          <span className="text-[9px] text-charcoal-light block">{outfit.category} • ₹{outfit.price_1day}/day</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-charcoal">{outfit.view_count || 0} views</div>
                        <div className="text-[10px] text-charcoal-light">{outfit.wishlist_count || 0} saves</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
