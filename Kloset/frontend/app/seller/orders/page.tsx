'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RefreshCcw, Calendar, Truck, Check } from 'lucide-react';
import { bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SellerOrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; bookingId: string; nextStatus: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const resp = await bookingsAPI.listSellerBookings(1, 50);
      setBookings(resp.bookings || []);
    } catch {
      toast.error('Failed to load rental orders.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await loadOrders();
    }
    init();
  }, []);

  const handleStatusChange = async () => {
    if (!confirmDialog) return;
    setUpdatingId(confirmDialog.bookingId);
    try {
      const updated = await bookingsAPI.updateStatus(confirmDialog.bookingId, confirmDialog.nextStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === confirmDialog.bookingId ? { ...b, status: updated.status } : b))
      );
      toast.success(`Booking status updated to ${confirmDialog.nextStatus} successfully.`);
    } catch {
      toast.error('Failed to update booking status.');
    } finally {
      setUpdatingId(null);
      setConfirmDialog(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  const statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Picked Up', value: 'picked_up' },
    { label: 'In Use', value: 'in_use' },
    { label: 'Returned', value: 'returned' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Disputed', value: 'disputed' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'sage';
      case 'pending':
        return 'gold';
      case 'cancelled':
        return 'rose';
      case 'disputed':
        return 'rose';
      case 'picked_up':
      case 'in_use':
      case 'return_initiated':
      case 'returned':
      case 'cleaning':
        return 'charcoal';
      default:
        return 'gold';
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 'Booking Cancelled';
      case 'disputed':
        return 'Dispute Raised';
      default:
        return status;
    }
  };

  const showUpdateAction = (b: Booking) => {
    return ['confirmed', 'picked_up', 'returned', 'cleaning'].includes(b.status);
  };

  const getBorderColorClass = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 'border-error/20';
      case 'disputed':
        return 'border-rose-gold/20';
      default:
        return '';
    }
  };

  const getEmptyStateMessage = () => {
    switch (statusFilter) {
      case 'pending':
        return 'No pending bookings.';
      case 'confirmed':
        return 'No confirmed bookings.';
      case 'picked_up':
        return 'No picked up bookings.';
      case 'in_use':
        return 'No in-use bookings.';
      case 'return_initiated':
        return 'No return initiated bookings.';
      case 'returned':
        return 'No returned bookings.';
      case 'cleaning':
        return 'No cleaning bookings.';
      case 'completed':
        return 'No completed bookings.';
      case 'cancelled':
        return 'No cancelled bookings.';
      case 'disputed':
        return 'No disputed bookings.';
      default:
        return 'No rental orders registered.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">
            Seller Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">
            Rental Orders
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-colors cursor-pointer ${statusFilter === tab.value
                  ? 'bg-champagne text-charcoal font-bold'
                  : 'text-champagne hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => loadOrders(true)}
            className="text-xs font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCcw size={12} /> Sync Lists
          </button>
        </div>
      </div>

      {/* Orders Grid/List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="shimmer h-24 rounded bg-ivory-dark" />
          <div className="shimmer h-24 rounded bg-ivory-dark" />
          <div className="shimmer h-24 rounded bg-ivory-dark" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card hoverEffect={false} padding="lg" className="bg-white border-border text-center space-y-4">
          <Calendar size={36} className="text-champagne mx-auto animate-pulse" />
          <h3 className="font-display text-lg font-bold">No rental orders registered</h3>
            <p className="text-xs text-charcoal-light leading-relaxed max-w-sm mx-auto font-light">
              {getEmptyStateMessage()}
            </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b, index) => {
            const outfitImg = b.outfit?.images?.[0]?.url || '/placeholder-outfit.jpg';

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: index * 0.05 }}
              >
                <Card
                  hoverEffect={false}
                  padding="md"
                  className={`bg-white border-border flex flex-col md:flex-row gap-6 items-center justify-between ${getBorderColorClass(b.status)}`}
                >
                
                {/* Product/timeline description */}
                <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 text-center sm:text-left">
                  <div className="w-16 h-20 relative rounded overflow-hidden bg-ivory-dark border border-border flex-shrink-0">
                    <Image src={outfitImg} alt={b.outfit?.title || 'Outfit'} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="font-mono text-[10px] text-charcoal font-bold">{b.booking_ref}</span>
                      <Badge variant={getStatusBadgeVariant(b.status)}>
                        {getStatusDisplayText(b.status)}
                      </Badge>
                    </div>
                    <h4 className="font-display text-base font-bold text-charcoal leading-tight">
                      {b.outfit?.title || 'Heritage Design'}
                    </h4>
                    <p className="text-[10px] text-charcoal-light font-mono">
                      Timeline: {new Date(b.pickup_date).toLocaleDateString()} to {new Date(b.return_date).toLocaleDateString()}
                    </p>
                    <span className="text-[9px] text-charcoal-light/75 block">Customer: {b.renter?.name || 'Guest User'}</span>
                  </div>
                </div>

                {/* Pricing / Revenue ledger */}
                <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-border/45 pt-4 md:pt-0 md:pl-8 flex-shrink-0 space-y-1">
                  <span className="text-[8px] font-mono tracking-wider uppercase text-charcoal-light block">Rental Payout</span>
                  <span className="font-mono text-base font-bold text-charcoal block">₹{b.rental_amount.toLocaleString()}</span>
                  <span className="text-[8px] font-mono text-charcoal-light/60 block">Deposit holds: ₹{b.security_deposit}</span>
                </div>

                {/* Status action switches */}
                {showUpdateAction(b) && (
                  <div className="border-t md:border-t-0 md:border-l border-border/45 pt-4 md:pt-0 md:pl-8 flex-shrink-0 w-full md:w-auto">
                    <label className="text-[8px] font-mono tracking-wider uppercase text-charcoal-light block mb-2 text-center md:text-left">
                      Update Logistic Stage
                    </label>
                    <div className="flex gap-2 justify-center md:justify-start">
                      
                      {b.status === 'confirmed' && (
                        <Button
                          variant="gold"
                          isLoading={updatingId === b.id}
                          onClick={() => setConfirmDialog({ show: true, bookingId: b.id, nextStatus: 'picked_up' })}
                          className="!h-[52px] !px-4 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Truck size={12} /> Dispatched
                        </Button>
                      )}

                      {b.status === 'picked_up' && (
                        <Button
                          variant="gold"
                          isLoading={updatingId === b.id}
                          onClick={() => setConfirmDialog({ show: true, bookingId: b.id, nextStatus: 'returned' })}
                          className="!h-[52px] !px-4 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Mark Returned
                        </Button>
                      )}

                      {b.status === 'returned' && (
                        <Button
                          variant="gold"
                          isLoading={updatingId === b.id}
                          onClick={() => setConfirmDialog({ show: true, bookingId: b.id, nextStatus: 'cleaning' })}
                          className="!h-[52px] !px-4 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCcw size={12} /> Sent To Dry Clean
                        </Button>
                      )}

                      {b.status === 'cleaning' && (
                        <Button
                          variant="gold"
                          isLoading={updatingId === b.id}
                          onClick={() => setConfirmDialog({ show: true, bookingId: b.id, nextStatus: 'completed' })}
                          className="!h-[52px] !px-4 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Complete Order
                        </Button>
                      )}

                    </div>
                  </div>
                )}

                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog !== null}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleStatusChange}
        title="Update Booking Status"
        message={`Are you sure you want to update this booking to "${confirmDialog?.nextStatus}"?`}
        confirmLabel="Confirm"
        variant="warning"
        isLoading={updatingId !== null}
      />

      </motion.div>
  );
}
