'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  Star, 
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Undo2, 
  Inbox,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { bookingsAPI, reviewsAPI, disputesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Booking, BookingStatus } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { OrdersSkeleton } from '@/components/ui/Skeleton';

// Status badge mapping helper
const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Verification Pending</Badge>;
    case 'confirmed':
      return <Badge variant="gold">Escrow Confirmed</Badge>;
    case 'picked_up':
      return <Badge variant="rose">Garment Picked Up</Badge>;
    case 'in_use':
      return <Badge variant="gold">In Use</Badge>;
    case 'return_initiated':
      return <Badge variant="rose">Return Transit</Badge>;
    case 'returned':
      return <Badge variant="sage">Garment Returned</Badge>;
    case 'cleaning':
      return <Badge variant="outline">Atelier Cleaning</Badge>;
    case 'completed':
      return <Badge variant="success">Order Completed</Badge>;
    case 'cancelled':
      return <Badge variant="error">Order Cancelled</Badge>;
    case 'disputed':
      return <Badge variant="error">Disputed</Badge>;
    default:
      return <Badge variant="charcoal">{status}</Badge>;
  }
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function RenterOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Review Modal State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute Modal State
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<Booking | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Cancel Modal State
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const loadOrders = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const resp = await bookingsAPI.listMyBookings(1, 20);
      setBookings(resp.bookings);
    } catch {
      toast.error('Failed to load transaction records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to view your orders.');
      router.push('/auth/login?redirect=/orders');
      return;
    }

    loadOrders();
  }, [isAuthenticated, authLoading]);

  const handleUpdateStatus = async (bookingId: string, nextStatus: BookingStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, nextStatus);
      toast.success(`Booking status transitioned to: ${nextStatus}`);
      loadOrders();
    } catch (err) {
      toast.error('Failed to transition order state.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        booking_id: selectedBookingForReview.id,
        rating: rating,
        comment: comment.trim(),
      });
      toast.success('Thank you! Your garment review has been posted.');
      setSelectedBookingForReview(null);
      setComment('');
      setRating(5);
      loadOrders();
    } catch (err) {
      toast.error('Failed to submit review. Already reviewed?');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForDispute) return;
    if (!disputeReason.trim() || !disputeDesc.trim()) {
      toast.error('Please fill in both dispute reason and incident context.');
      return;
    }

    setSubmittingDispute(true);
    try {
      await disputesAPI.raise({
        booking_id: selectedBookingForDispute.id,
        reason: disputeReason.trim(),
        description: disputeDesc.trim(),
      });
      toast.error('Dispute ticket raised. Escrow funds locked.');
      setSelectedBookingForDispute(null);
      setDisputeReason('');
      setDisputeDesc('');
      loadOrders();
    } catch (err) {
      toast.error('Failed to raise dispute ticket.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCancel) return;

    setSubmittingCancel(true);
    try {
      await bookingsAPI.cancel(selectedBookingForCancel.id, cancelReason.trim() || undefined);
      toast.success('Booking cancelled successfully. Refund will be processed per policy.');
      setSelectedBookingForCancel(null);
      setCancelReason('');
      loadOrders();
    } catch {
      toast.error('Failed to cancel booking. It may be too late to cancel.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'active') {
      return !['completed', 'cancelled', 'disputed'].includes(booking.status);
    }
    if (activeTab === 'completed') {
      return ['completed', 'returned'].includes(booking.status);
    }
    return true;
  });

  if (authLoading || loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none text-left">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Banner navigation */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-charcoal-light mb-6">
          <Link href="/profile" className="hover:text-charcoal transition-colors">Account Studio</Link>
          <ChevronRight size={10} />
          <span className="text-champagne">Booking Registry</span>
        </div>

        {/* Title */}
        <div className="mb-10 text-left">
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            Transactional Escrow Timeline
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal">
            My Rentals & Bookings
          </h1>
          <p className="text-xs text-charcoal-light font-mono mt-1">
            Track shipping schedules, mark courier hand-overs, and review luxury couture.
          </p>
        </div>

        {/* Tab Filters bar */}
        <div className="flex border-b border-border/80 mb-8">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'active' | 'completed')}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
              className={`h-[52px] px-6 text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                activeTab === tab.id 
                  ? 'border-champagne text-champagne' 
                  : 'border-transparent text-charcoal-light hover:text-charcoal'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Orders List Container */}
        {filteredBookings.length === 0 ? (
          <Card hoverEffect={false} padding="lg" className="bg-white border-border text-center py-16">
            <Inbox size={32} className="mx-auto text-champagne mb-4 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal">No bookings cataloged</h3>
            <p className="text-[10px] font-mono text-charcoal-light/70 mt-1 max-w-sm mx-auto font-light">
              You do not have any bookings listed in this query. Explore our collections of couture!
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springTransition} className="inline-block mt-6">
              <Link href="/discover" className="btn btn-primary h-[52px] px-8 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center">
                Browse Collections
              </Link>
            </motion.div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const startFmt = new Date(booking.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              const endFmt = new Date(booking.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              const createdFmt = new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <motion.div
                  key={booking.id}
                  whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.02)' }}
                  transition={springTransition}
                >
                  <Card 
                    hoverEffect={false} 
                    padding="md" 
                    className="bg-white border-border shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden text-left"
                  >
                    {/* Status Indicator Bar */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-[#D4AF37]/20" />

                    {/* Garment Image */}
                    <div className="w-full md:w-32 aspect-[3/4] rounded-lg border border-border overflow-hidden bg-ivory-dark flex-shrink-0 relative">
                      {booking.outfit?.images?.[0] ? (
                        <img 
                          src={booking.outfit.images[0].url} 
                          alt="Garment Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-charcoal-light/40">No Image</div>
                      )}
                    </div>

                    {/* Summary Block */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-mono text-champagne font-bold uppercase tracking-wider block">
                            Registry ID: {booking.booking_ref}
                          </span>
                          <h3 className="text-base font-display font-medium text-charcoal mt-0.5">
                            {booking.outfit?.title || 'Garment Rental'}
                          </h3>
                          <p className="text-[10px] font-mono text-charcoal-light font-light mt-1">
                            Booked on {createdFmt}
                          </p>
                        </div>

                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <span className="text-xs font-mono font-bold text-charcoal block mt-1">
                            ₹{booking.total_amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Timeline Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border/60 bg-[#FAF9F6] rounded-lg text-xs">
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-light uppercase block font-semibold">Rental Start</span>
                          <span className="font-semibold text-charcoal mt-0.5 block flex items-center gap-1">
                            <Calendar size={12} className="text-champagne" /> {startFmt}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-light uppercase block font-semibold">Rental End</span>
                          <span className="font-semibold text-charcoal mt-0.5 block flex items-center gap-1">
                            <Calendar size={12} className="text-champagne" /> {endFmt}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-light uppercase block font-semibold">Fit Size</span>
                          <span className="font-mono font-bold text-charcoal mt-0.5 block uppercase">
                            {booking.size_selected || 'M'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-light uppercase block font-semibold">Fulfillment</span>
                          <span className="font-semibold text-charcoal mt-0.5 block capitalize flex items-center gap-1">
                            <Truck size={12} className="text-champagne" /> {booking.delivery_type}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons inside the item layout */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        
                        {/* 1. Mark booking picked up */}
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="primary"
                            onClick={() => handleUpdateStatus(booking.id, 'picked_up')}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <CheckCircle2 size={12} className="mr-1" /> Garment Received
                          </Button>
                        )}

                        {/* 2. Transition from picked_up to in_use */}
                        {booking.status === 'picked_up' && (
                          <Button
                            variant="gold"
                            onClick={() => handleUpdateStatus(booking.id, 'in_use')}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Clock size={12} className="mr-1" /> Wear Couture (Activate)
                          </Button>
                        )}

                        {/* 3. Initiate return from in_use */}
                        {booking.status === 'in_use' && (
                          <Button
                            variant="primary"
                            onClick={() => handleUpdateStatus(booking.id, 'return_initiated')}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Undo2 size={12} className="mr-1" /> Handover to Courier
                          </Button>
                        )}

                        {/* 4. Complete / Review option */}
                        {(booking.status === 'returned' || booking.status === 'completed') && (
                          <Button
                            variant="gold"
                            onClick={() => setSelectedBookingForReview(booking)}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Star size={12} className="mr-1" /> Post Garment Review
                          </Button>
                        )}

                        {/* 5. Raising dispute ticket */}
                        {!['completed', 'cancelled', 'disputed'].includes(booking.status) && (
                          <Button
                            variant="outline"
                            onClick={() => setSelectedBookingForDispute(booking)}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider border-red-200 text-error hover:bg-red-50 hover:border-red-400 cursor-pointer"
                          >
                            <ShieldAlert size={12} className="mr-1" /> Dispute Escrow Funds
                          </Button>
                        )}

                        {/* 6. Cancel booking */}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <Button
                            variant="outline"
                            onClick={() => setSelectedBookingForCancel(booking)}
                            className="h-[52px] text-[10px] px-4 font-mono font-bold uppercase tracking-wider border-red-200 text-error hover:bg-red-50 hover:border-red-400 cursor-pointer"
                          >
                            <XCircle size={12} className="mr-1" /> Cancel Booking
                          </Button>
                        )}

                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── MODAL 1: GARMENT REVIEW DIALOG ─── */}
        <Modal
          isOpen={selectedBookingForReview !== null}
          onClose={() => setSelectedBookingForReview(null)}
          title="Garment Experience Review"
        >
          {selectedBookingForReview && (
            <form onSubmit={handleSubmitReview} className="space-y-6 text-left">
              <div className="text-xs">
                <span className="text-[9px] font-mono text-charcoal-light uppercase">Garment Title</span>
                <p className="font-semibold text-charcoal mt-0.5">{selectedBookingForReview.outfit?.title}</p>
              </div>

              {/* Rating selection stars */}
              <div>
                <span className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-2">
                  garment rating index
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = rating >= starVal;
                    return (
                      <motion.button
                        key={starVal}
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        transition={springTransition}
                        onClick={() => setRating(starVal)}
                        className="p-1 cursor-pointer"
                      >
                        <Star 
                          size={24} 
                          className={isFilled ? 'fill-champagne text-champagne' : 'text-border'}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  experience feedback
                </label>
                <textarea
                  className="w-full min-h-[120px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding fit accuracy, fabric cleanliness, accessories quality, and look compliments."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedBookingForReview(null)}
                  className="h-[52px] text-[10px] px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  isLoading={submittingReview}
                  className="h-[52px] text-[10px] px-6"
                >
                  Post Review
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* ─── MODAL 2: DISPUTE DIALOG ─── */}
        <Modal
          isOpen={selectedBookingForDispute !== null}
          onClose={() => setSelectedBookingForDispute(null)}
          title="File Escrow Dispute"
        >
          {selectedBookingForDispute && (
            <form onSubmit={handleSubmitDispute} className="space-y-6 text-left">
              <div className="p-4 border border-red-100 bg-red-50 text-error text-[10px] font-mono rounded leading-normal flex items-start gap-2.5">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold uppercase mb-0.5">escrow lockdown notice</p>
                  <p>Raising a dispute immediately locks down escrow payout settlements to the host. Platforms moderators will audit the claim timelines and coordinate validation.</p>
                </div>
              </div>

              <Input
                label="incident reason query"
                name="disputeReason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="e.g. Garment damaged upon courier arrival, Size mismatch"
                required
              />

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  incident context detail
                </label>
                <textarea
                  className="w-full min-h-[120px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Describe the incident precisely. Mention timeline, damage description, or transport tracking references."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedBookingForDispute(null)}
                  className="h-[52px] text-[10px] px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submittingDispute}
                  className="h-[52px] text-[10px] px-6 bg-error border-error hover:bg-red-700 hover:border-red-700 text-white"
                >
                  Lock Escrow Funds
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* ─── MODAL 3: CANCEL BOOKING DIALOG ─── */}
        <Modal
          isOpen={selectedBookingForCancel !== null}
          onClose={() => { setSelectedBookingForCancel(null); setCancelReason(''); }}
          title="Cancel Booking"
        >
          {selectedBookingForCancel && (
            <form onSubmit={handleCancelBooking} className="space-y-6 text-left">
              <div className="p-4 border border-red-100 bg-red-50 text-error text-[10px] font-mono rounded leading-normal flex items-start gap-2.5">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold uppercase mb-0.5">cancellation policy</p>
                  <p>Free cancellation is available up to 7 days before your rental pickup date. Within 7 days, a 50% cancellation fee applies. This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-4 border border-border/60 bg-[#FAF9F6] rounded-lg">
                <span className="text-[9px] font-mono text-charcoal-light uppercase font-bold block mb-1">Booking Being Cancelled</span>
                <p className="text-sm font-semibold text-charcoal">{selectedBookingForCancel.outfit?.title || 'Garment Rental'}</p>
                <p className="text-[10px] font-mono text-charcoal-light mt-0.5">Ref: {selectedBookingForCancel.booking_ref}</p>
                <p className="text-xs font-mono font-bold text-charcoal mt-1">₹{selectedBookingForCancel.total_amount.toLocaleString('en-IN')}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  Cancellation Reason (Optional)
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full h-[48px] px-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne"
                >
                  <option value="">Select a reason</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="found_alternative">Found an alternative</option>
                  <option value="event_cancelled">Event cancelled</option>
                  <option value="budget">Budget constraints</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setSelectedBookingForCancel(null); setCancelReason(''); }}
                  className="h-[52px] text-[10px] px-4"
                >
                  Keep Booking
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submittingCancel}
                  className="h-[52px] text-[10px] px-6 bg-error border-error hover:bg-red-700 hover:border-red-700 text-white cursor-pointer"
                >
                  Confirm Cancellation
                </Button>
              </div>
            </form>
          )}
        </Modal>

      </div>
    </div>
  );
}
