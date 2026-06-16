'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const data = await bookingsAPI.getById(bookingId!);
      setBooking(data);
    } catch {
      toast.error('Failed to load booking confirmation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookingId) {
      toast.error('No booking reference found.');
      router.push('/discover');
      return;
    }
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Confirming Escrow Booking...</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...springTransition, delay: 0.1 }}
            className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={32} />
          </motion.div>

          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block mb-2">
            Booking Confirmed
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal mb-2">Your Rental is Booked!</h1>
          <p className="text-xs text-charcoal-light font-mono">
            Booking Reference: <strong className="text-charcoal">{booking?.booking_ref || bookingId}</strong>
          </p>

          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
              className="mt-10 space-y-4 text-left"
            >
              <Card padding="md" className="bg-white border-border">
                <div className="flex gap-4">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                    {booking.outfit?.images?.[0] ? (
                      <img src={booking.outfit.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-charcoal-light/40">No Image</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-semibold text-charcoal">{booking.outfit?.title || 'Couture Rental'}</h3>
                    <p className="text-[10px] text-charcoal-light font-mono">Size: {booking.size_selected}</p>
                    <p className="text-[10px] text-charcoal-light font-mono flex items-center gap-1">
                      <Calendar size={10} className="text-champagne" />
                      {new Date(booking.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-charcoal-light font-mono flex items-center gap-1">
                      <MapPin size={10} className="text-champagne" /> {booking.delivery_type === 'delivery' ? 'Home Delivery' : 'Self Pickup'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="bg-white border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-light">Total Amount</span>
                  <span className="font-bold text-charcoal">₹{booking.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border">
                  <span className="text-charcoal-light">Security Deposit</span>
                  <span className="font-bold text-charcoal">₹{booking.security_deposit.toLocaleString('en-IN')}</span>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.3 }}
            className="mt-10 space-y-4"
          >
            <p className="text-xs text-charcoal-light font-light max-w-md mx-auto">
              <Sparkles size={12} className="inline mr-1 text-champagne" />
              Your booking is confirmed. You will receive a confirmation email with rental instructions shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/orders" className="btn btn-primary h-[52px] px-8 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center">
                View My Rentals
              </Link>
              <Link href="/discover" className="btn btn-outline h-[52px] px-8 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center">
                <ArrowRight size={14} className="mr-1" /> Continue Browsing
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Loading Confirmation...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
