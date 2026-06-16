'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Inbox, ChevronRight, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { bookingsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Booking } from '@/types';
import Card from '@/components/ui/Card';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function DashboardOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const resp = await bookingsAPI.listMyBookings(1, 10);
      setBookings(resp.bookings);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/orders');
      return;
    }
    loadBookings();
  }, [isAuthenticated, authLoading]);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-champagne/20 text-champagne',
      confirmed: 'bg-success/20 text-success',
      picked_up: 'bg-rose-gold/20 text-rose-gold',
      in_use: 'bg-champagne/20 text-champagne',
      return_initiated: 'bg-rose-gold/20 text-rose-gold',
      returned: 'bg-success/20 text-success',
      completed: 'bg-success/20 text-success',
      cancelled: 'bg-error/20 text-error',
      disputed: 'bg-error/20 text-error',
    };
    return map[status] || 'bg-ivory-dark text-charcoal-light';
  };

  if (authLoading || loading) {
    return (
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={springTransition} className="mb-8">
          <span className="text-[10px] font-mono tracking-[0.2em] text-champagne uppercase font-bold block">Dashboard</span>
          <h1 className="text-2xl font-display font-medium text-charcoal mt-1">My Orders</h1>
        </motion.div>

        {bookings.length === 0 ? (
          <Card padding="lg" className="bg-white border-border text-center py-12">
            <Inbox size={28} className="mx-auto text-champagne mb-3" />
            <p className="text-xs font-mono text-charcoal-light">No orders yet.</p>
            <Link href="/discover" className="btn btn-primary mt-4 inline-flex h-11 px-6 text-xs font-mono uppercase">Browse Collections</Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <motion.div key={booking.id} whileHover={{ y: -2 }} transition={springTransition}
                className="bg-white border border-border rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                  {booking.outfit?.images?.[0] ? (
                    <img src={booking.outfit.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-charcoal-light/40">No Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-charcoal truncate">{booking.outfit?.title || 'Couture Rental'}</p>
                      <p className="text-[10px] font-mono text-charcoal-light mt-0.5">Ref: {booking.booking_ref}</p>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${getStatusColor(booking.status)}`}>{booking.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-charcoal-light">
                    <span className="flex items-center gap-1"><Calendar size={10} className="text-champagne" /> {new Date(booking.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="flex items-center gap-1"><Truck size={10} className="text-champagne" /> {booking.delivery_type}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs font-mono font-bold text-charcoal">₹{booking.total_amount.toLocaleString('en-IN')}</span>
                    <Link href={`/orders`} className="text-[10px] font-mono text-champagne hover:text-charcoal transition-colors flex items-center gap-0.5 font-bold">
                      View Details <ChevronRight size={10} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
