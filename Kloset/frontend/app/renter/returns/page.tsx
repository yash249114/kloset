'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Package,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Calendar,
  FileText,
  Inbox,
  ChevronDown,
  ChevronUp,
  Shield,
  Banknote,
 Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { returnsAPI, bookingsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { ReturnRequest, ReturnStatus, InspectionStatus, RefundStatus } from '@/lib/api';
import type { Booking } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

const RETURN_STATUS_CONFIG: Record<ReturnStatus, { label: string; variant: 'gold' | 'sage' | 'rose' | 'outline' | 'error' | 'success' }> = {
  requested: { label: 'Return Requested', variant: 'outline' },
  pickup_scheduled: { label: 'Pickup Scheduled', variant: 'gold' },
  picked_up: { label: 'Picked Up', variant: 'rose' },
  in_inspection: { label: 'Under Inspection', variant: 'gold' },
  inspection_complete: { label: 'Inspection Complete', variant: 'sage' },
  refund_pending: { label: 'Refund Pending', variant: 'gold' },
  refund_processed: { label: 'Refund Processed', variant: 'sage' },
  completed: { label: 'Completed', variant: 'success' },
  rejected: { label: 'Return Rejected', variant: 'error' },
};

const INSPECTION_CONFIG: Record<InspectionStatus, { label: string; color: string }> = {
  pending: { label: 'Awaiting Inspection', color: 'text-charcoal-light' },
  in_progress: { label: 'Inspection In Progress', color: 'text-champagne' },
  passed: { label: 'Passed — No Issues', color: 'text-success' },
  minor_damage: { label: 'Minor Wear Noted', color: 'text-amber-600' },
  significant_damage: { label: 'Significant Damage', color: 'text-error' },
};

const REFUND_CONFIG: Record<RefundStatus, { label: string; variant: 'gold' | 'sage' | 'rose' | 'outline' | 'success' }> = {
  not_applicable: { label: 'N/A', variant: 'outline' },
  pending: { label: 'Refund Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'gold' },
  completed: { label: 'Refunded', variant: 'success' },
  partially_refunded: { label: 'Partial Refund', variant: 'rose' },
};

const TIMELINE_STEPS = [
  { key: 'requested', label: 'Return Requested', icon: FileText },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Calendar },
  { key: 'picked_up', label: 'Item Picked Up', icon: Truck },
  { key: 'in_inspection', label: 'Quality Inspection', icon: Search },
  { key: 'inspection_complete', label: 'Inspection Passed', icon: CheckCircle2 },
  { key: 'refund_pending', label: 'Refund Initiated', icon: Banknote },
  { key: 'completed', label: 'Refund Complete', icon: ShieldCheck },
];

const STATUS_ORDER: ReturnStatus[] = ['requested', 'pickup_scheduled', 'picked_up', 'in_inspection', 'inspection_complete', 'refund_pending', 'completed'];

function getTimelineIndex(status: ReturnStatus): number {
  if (status === 'rejected') return -1;
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export default function ReturnsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [policy, setPolicy] = useState<{
    return_window_days: number;
    cancellation_free_days: number;
    cancellation_fee_percentage: number;
    late_fee_per_day: number;
    damage_assessment_policy: string;
    refund_timeline_days: number;
  } | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);

  // Request Return Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [returnsData, policyData] = await Promise.all([
        returnsAPI.getMyReturns().catch(() => []),
        returnsAPI.getReturnPolicy().catch(() => null),
      ]);
      setReturns(returnsData);
      setPolicy(policyData);
    } catch {
      toast.error('Failed to load returns data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to manage returns.');
      router.push('/auth/login?redirect=/renter/returns');
      return;
    }
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading]);

  const loadCompletedBookings = async () => {
    try {
      const resp = await bookingsAPI.listMyBookings(1, 50);
      const eligible = resp.bookings.filter(
        (b) => ['returned', 'completed', 'in_use'].includes(b.status) &&
               !returns.some((r) => r.booking_id === b.id)
      );
      setCompletedBookings(eligible);
    } catch {
      setCompletedBookings([]);
    }
  };

  const handleOpenRequestModal = async () => {
    await loadCompletedBookings();
    setShowRequestModal(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for the return.');
      return;
    }
    setSubmitting(true);
    try {
      await returnsAPI.createReturn({
        booking_id: selectedBooking.id,
        reason: returnReason.trim(),
        description: returnDescription.trim() || undefined,
      });
      toast.success('Return request submitted. We will schedule a pickup shortly.');
      setShowRequestModal(false);
      setSelectedBooking(null);
      setReturnReason('');
      setReturnDescription('');
      loadData();
    } catch {
      toast.error('Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-ivory min-h-screen pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-10 space-y-3">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-3 w-80" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-24 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none text-left">
      <div className="max-w-5xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-charcoal-light mb-6">
          <Link href="/profile" className="hover:text-charcoal transition-colors">Account Studio</Link>
          <ChevronRight size={10} />
          <Link href="/orders" className="hover:text-charcoal transition-colors">Bookings</Link>
          <ChevronRight size={10} />
          <span className="text-champagne">Returns</span>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            Garment Return Management
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal">
            Returns & Refunds
          </h1>
          <p className="text-xs text-charcoal-light font-mono mt-1">
            Track return requests, monitor pickup and inspection status, and view deposit refunds.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-3">
            <Link
              href="/orders"
              className="h-[52px] px-5 text-[10px] font-mono font-bold uppercase tracking-wider border border-border rounded flex items-center gap-2 hover:bg-ivory-dark transition-colors"
            >
              <RotateCcw size={12} /> View All Bookings
            </Link>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPolicy(true)}
              className="h-[52px] text-[10px] px-5 font-mono font-bold uppercase tracking-wider cursor-pointer"
            >
              <FileText size={12} className="mr-1" /> Return Policies
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenRequestModal}
              className="h-[52px] text-[10px] px-5 font-mono font-bold uppercase tracking-wider cursor-pointer"
            >
              <Package size={12} className="mr-1" /> Request Return
            </Button>
          </div>
        </div>

        {/* Returns List */}
        {returns.length === 0 ? (
          <Card hoverEffect={false} padding="lg" className="bg-white border-border text-center py-16">
            <Package size={32} className="mx-auto text-champagne mb-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal">No Active Returns</h3>
            <p className="text-[10px] font-mono text-charcoal-light/70 mt-1 max-w-sm mx-auto font-light">
              You have no return requests on file. When you need to return a garment, initiate a request from your bookings.
            </p>
            <Link href="/orders" className="btn btn-primary h-[52px] px-8 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center mt-6">
              View My Bookings
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {returns.map((ret) => {
                const isExpanded = expandedId === ret.id;
                const timelineIdx = getTimelineIndex(ret.status);
                const statusConfig = RETURN_STATUS_CONFIG[ret.status];
                const inspectionConfig = INSPECTION_CONFIG[ret.inspection_status || 'pending'];
                const refundConfig = REFUND_CONFIG[ret.deposit_refund_status || 'not_applicable'];

                return (
                  <motion.div
                    key={ret.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springTransition}
                  >
                    <Card hoverEffect={false} padding="md" className="bg-white border-border shadow-sm relative overflow-hidden text-left">
                      {/* Status bar */}
                      <div className={`absolute top-0 inset-x-0 h-1 ${
                        ret.status === 'completed' ? 'bg-success/40' :
                        ret.status === 'rejected' ? 'bg-error/40' : 'bg-champagne/30'
                      }`} />

                      {/* Main content */}
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full md:w-20 aspect-[3/4] rounded-lg border border-border overflow-hidden bg-ivory-dark flex-shrink-0">
                          {ret.outfit_image ? (
                            <img src={ret.outfit_image} alt={ret.outfit_title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-charcoal-light/40">
                              <Package size={20} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[9px] font-mono text-champagne font-bold uppercase tracking-wider block">
                                Return ID: {ret.id.slice(0, 8)}
                              </span>
                              <h3 className="text-sm font-display font-medium text-charcoal mt-0.5">
                                {ret.outfit_title}
                              </h3>
                              <p className="text-[10px] font-mono text-charcoal-light">
                                Booking: {ret.booking_ref}
                              </p>
                            </div>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </div>

                          {/* Status pills */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory-dark/50 rounded-full text-[9px] font-mono">
                              <Truck size={10} className="text-champagne" />
                              <span className="text-charcoal-light">Pickup:</span>
                              <span className="font-bold text-charcoal">
                                {ret.pickup_completed_at
                                  ? 'Completed'
                                  : ret.pickup_scheduled_date
                                    ? `Scheduled ${new Date(ret.pickup_scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                    : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory-dark/50 rounded-full text-[9px] font-mono">
                              <Search size={10} className="text-champagne" />
                              <span className="text-charcoal-light">Inspection:</span>
                              <span className={`font-bold ${inspectionConfig.color}`}>
                                {inspectionConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory-dark/50 rounded-full text-[9px] font-mono">
                              <Banknote size={10} className="text-champagne" />
                              <span className="text-charcoal-light">Refund:</span>
                              <span className="font-bold text-charcoal">
                                {refundConfig.label}
                                {ret.deposit_refund_amount != null && ret.deposit_refund_amount > 0 && (
                                  <span className="text-champagne ml-1">₹{ret.deposit_refund_amount.toLocaleString('en-IN')}</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : ret.id)}
                            className="mt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-champagne hover:text-charcoal transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded ? 'Hide Details' : 'View Timeline'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded timeline */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={springTransition}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t border-border">
                              {/* Timeline */}
                              <div className="space-y-0">
                                {TIMELINE_STEPS.map((step, idx) => {
                                  const isCompleted = timelineIdx >= idx;
                                  const isCurrent = timelineIdx === idx;
                                  const Icon = step.icon;
                                  return (
                                    <div key={step.key} className="flex gap-3">
                                      <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                          isCompleted
                                            ? 'bg-champagne border-champagne text-white'
                                            : 'bg-white border-border text-charcoal-light'
                                        }`}>
                                          <Icon size={14} />
                                        </div>
                                        {idx < TIMELINE_STEPS.length - 1 && (
                                          <div className={`w-0.5 h-8 ${isCompleted ? 'bg-champagne/40' : 'bg-border/60'}`} />
                                        )}
                                      </div>
                                      <div className="pb-6 pt-1">
                                        <p className={`text-xs font-mono font-bold ${isCurrent ? 'text-champagne' : isCompleted ? 'text-charcoal' : 'text-charcoal-light'}`}>
                                          {step.label}
                                        </p>
                                        {isCurrent && (
                                          <p className="text-[9px] font-mono text-charcoal-light mt-0.5">Current status</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {ret.status === 'rejected' && (
                                  <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-error bg-error/10 text-error flex-shrink-0">
                                      <AlertTriangle size={14} />
                                    </div>
                                    <div className="pt-1">
                                      <p className="text-xs font-mono font-bold text-error">Return Rejected</p>
                                      {ret.inspection_notes && (
                                        <p className="text-[9px] font-mono text-charcoal-light mt-0.5">{ret.inspection_notes}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Reason */}
                              <div className="mt-4 p-4 bg-ivory-dark/30 rounded-lg border border-border/60">
                                <span className="text-[9px] font-mono text-charcoal-light uppercase font-bold block mb-1">Return Reason</span>
                                <p className="text-xs text-charcoal">{ret.reason}</p>
                              </div>

                              {/* Inspection notes */}
                              {ret.inspection_notes && (
                                <div className="mt-3 p-4 bg-ivory-dark/30 rounded-lg border border-border/60">
                                  <span className="text-[9px] font-mono text-charcoal-light uppercase font-bold block mb-1">Inspection Notes</span>
                                  <p className="text-xs text-charcoal">{ret.inspection_notes}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ─── REQUEST RETURN MODAL ─── */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => { setShowRequestModal(false); setSelectedBooking(null); setReturnReason(''); setReturnDescription(''); }}
          title="Request Garment Return"
        >
          <form onSubmit={handleSubmitReturn} className="space-y-6 text-left">
            <div className="p-4 border border-champagne/30 bg-champagne/5 rounded-lg text-[10px] font-mono text-charcoal-light leading-relaxed flex items-start gap-2.5">
              <RotateCcw size={14} className="mt-0.5 text-champagne flex-shrink-0" />
              <div>
                <p className="font-bold uppercase mb-0.5 text-charcoal">return request notice</p>
                <p>Select the booking you wish to return. A pickup will be scheduled within 24-48 hours of approval. Security deposit refund is processed within 72 hours of quality inspection.</p>
              </div>
            </div>

            {/* Booking selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                Select Booking
              </label>
              {completedBookings.length === 0 ? (
                <p className="text-xs text-charcoal-light py-4 text-center bg-ivory-dark/30 rounded border border-dashed border-border">
                  No eligible bookings found for return.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto scroll-rail">
                  {completedBookings.map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer flex items-center gap-3 ${
                        selectedBooking?.id === b.id
                          ? 'border-champagne bg-champagne/5'
                          : 'border-border bg-white hover:border-champagne/40'
                      }`}
                    >
                      {b.outfit?.images?.[0] ? (
                        <img src={b.outfit.images[0].url} alt="" className="w-10 h-12 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-12 rounded bg-ivory-dark flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-charcoal-light/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-charcoal truncate">{b.outfit?.title || 'Garment'}</p>
                        <p className="text-[9px] font-mono text-charcoal-light">Ref: {b.booking_ref}</p>
                      </div>
                      {selectedBooking?.id === b.id && (
                        <CheckCircle2 size={16} className="text-champagne flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                Return Reason
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full h-[48px] px-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne"
                required
              >
                <option value="">Select a reason</option>
                <option value="size_mismatch">Size does not fit</option>
                <option value="not_as_described">Item not as described</option>
                <option value="changed_mind">Changed my mind</option>
                <option value="event_cancelled">Event cancelled</option>
                <option value="quality_issue">Quality issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                className="w-full min-h-[80px] p-4 text-xs font-sans bg-white border border-border rounded focus:outline-none focus:border-champagne resize-none leading-relaxed"
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                placeholder="Provide any additional context for your return request..."
              />
            </div>

            <div className="flex gap-3 pt-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowRequestModal(false); setSelectedBooking(null); setReturnReason(''); setReturnDescription(''); }}
                className="h-[52px] text-[10px] px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                disabled={!selectedBooking || !returnReason.trim()}
                className="h-[52px] text-[10px] px-6"
              >
                Submit Return Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* ─── POLICY MODAL ─── */}
        <Modal
          isOpen={showPolicy}
          onClose={() => setShowPolicy(false)}
          title="Return & Refund Policies"
          size="lg"
        >
          <div className="space-y-6 text-left">
            {/* Return Policy */}
            <div className="p-5 border border-border bg-[#FAF9F6] rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-champagne" />
                <h4 className="text-xs font-mono font-bold tracking-widest text-charcoal uppercase">Return Policy</h4>
              </div>
              <div className="space-y-2 text-xs text-charcoal-light leading-relaxed">
                <p>• Returns must be initiated within <strong className="text-charcoal">{policy?.return_window_days || 7} days</strong> of delivery.</p>
                <p>• Garments must be unworn, unwashed, and in original Kloset packaging with all tags attached.</p>
                <p>• Items with odour, makeup stains, or unauthorized alterations may be rejected.</p>
                <p>• Return pickup is arranged by Kloset at no additional cost to the renter.</p>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="p-5 border border-border bg-[#FAF9F6] rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-champagne" />
                <h4 className="text-xs font-mono font-bold tracking-widest text-charcoal uppercase">Cancellation Policy</h4>
              </div>
              <div className="space-y-2 text-xs text-charcoal-light leading-relaxed">
                <p>• Free cancellation up to <strong className="text-charcoal">{policy?.cancellation_free_days || 7} days</strong> before the rental pickup date.</p>
                <p>• Cancellations within {policy?.cancellation_free_days || 7} days of pickup incur a <strong className="text-charcoal">{policy?.cancellation_fee_percentage || 50}%</strong> cancellation fee.</p>
                <p>• No-shows are treated as completed rentals — no refund will be issued.</p>
              </div>
            </div>

            {/* Late Fee Policy */}
            <div className="p-5 border border-border bg-[#FAF9F6] rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-champagne" />
                <h4 className="text-xs font-mono font-bold tracking-widest text-charcoal uppercase">Late Return Fees</h4>
              </div>
              <div className="space-y-2 text-xs text-charcoal-light leading-relaxed">
                <p>• Late returns incur a fee of <strong className="text-charcoal">₹{policy?.late_fee_per_day || 200}/day</strong> beyond the scheduled return date.</p>
                <p>• Fees are deducted from the security deposit before refund.</p>
                <p>• Returns more than 3 days late may result in the full deposit being withheld.</p>
              </div>
            </div>

            {/* Damage Policy */}
            <div className="p-5 border border-border bg-[#FAF9F6] rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-champagne" />
                <h4 className="text-xs font-mono font-bold tracking-widest text-charcoal uppercase">Damage Assessment</h4>
              </div>
              <div className="space-y-2 text-xs text-charcoal-light leading-relaxed">
                <p>• Normal wear (minor wrinkles, light creasing) is covered by the platform.</p>
                <p>• Minor stains or damage may result in a partial deposit deduction of up to 30%.</p>
                <p>• Significant damage (tears, burns, permanent stains) may result in full deposit withholding.</p>
                <p>• {policy?.damage_assessment_policy || 'All damage assessments are reviewed by our quality team within 48 hours.'}</p>
              </div>
            </div>

            {/* Refund Timeline */}
            <div className="p-5 border border-success/30 bg-success/5 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Banknote size={16} className="text-success" />
                <h4 className="text-xs font-mono font-bold tracking-widest text-charcoal uppercase">Refund Timeline</h4>
              </div>
              <div className="space-y-2 text-xs text-charcoal-light leading-relaxed">
                <p>• Security deposit refunds are processed within <strong className="text-charcoal">{policy?.refund_timeline_days || 3} business days</strong> of inspection completion.</p>
                <p>• Refunds are credited to the original payment method or Kloset wallet.</p>
                <p>• Bank transfers may take an additional 2-3 business days to reflect.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" onClick={() => setShowPolicy(false)} className="w-full h-[52px] cursor-pointer">
                Understood
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}
