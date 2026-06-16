'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ShieldCheck, CreditCard, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { bookingsAPI, outfitsAPI, paymentsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { loadRazorpayScript, openRazorpay } from '@/lib/razorpay';
import type { Outfit, Address } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outfitId = searchParams.get('outfit_id');
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { cartItems, clearCart } = useCartStore();

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/booking/checkout${outfitId ? `?outfit_id=${outfitId}` : ''}`);
      return;
    }
    loadCheckoutData();
  }, [isAuthenticated, authLoading]);

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      const id = outfitId || (cartItems.length > 0 ? cartItems[0].id : null);
      if (id) {
        const outfitData = await outfitsAPI.getById(id);
        setOutfit(outfitData);
        if (outfitData.sizes && outfitData.sizes.length > 0) {
          setSelectedSize(outfitData.sizes[0]);
        }
      }
      if (user) {
        const { userAPI } = await import('@/lib/api');
        const addrList = await userAPI.getAddresses();
        setAddresses(addrList);
        const defaultAddr = addrList.find((a) => a.is_default);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      }
    } catch {
      toast.error('Failed to load checkout details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!outfit) return;
    if (!startDate || !endDate) {
      toast.error('Please select rental dates.');
      return;
    }
    if (deliveryType === 'delivery' && !selectedAddress) {
      toast.error('Please select a delivery address.');
      return;
    }
    setProcessing(true);
    try {
      const booking = await bookingsAPI.create({
        outfit_id: outfit.id,
        pickup_date: startDate,
        return_date: endDate,
        size_selected: selectedSize,
        delivery_type: deliveryType,
        delivery_address_id: deliveryType === 'delivery' ? selectedAddress : undefined,
      });

      const razorpayOrderId = booking.razorpay_order_id;
      if (!razorpayOrderId) {
        toast.error('Payment gateway did not return an order ID.');
        setProcessing(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        setProcessing(false);
        return;
      }

      const result = await openRazorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_keys',
        amount: Math.round((booking.total_amount || calculateTotal()) * 100),
        currency: 'INR',
        name: 'Kloset Luxe',
        description: `Rental: ${outfit.title}`,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || 'Premium Renter',
          email: user?.email || 'renter@kloset.in',
          contact: user?.phone || '9876543210',
        },
        theme: { color: '#2C2C2C' },
      });

      if (result.status === 'success') {
        const paymentResp = result.response as any;
        await paymentsAPI.verify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentResp.razorpay_payment_id,
          razorpay_signature: paymentResp.razorpay_signature,
        });
        clearCart();
        toast.success('Payment confirmed! Booking is complete.');
        router.push(`/booking/confirmation?id=${booking.id}`);
      } else if (result.status === 'failed') {
        toast.error('Payment failed. Please try again.');
      } else {
        toast('Payment cancelled. Your booking is pending payment.');
        router.push(`/booking/confirmation?id=${booking.id}&pending=true`);
      }
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!outfit) return 0;
    const daysDiff = startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const dailyRate = outfit.price_1day || 1500;
    const rentalAmount = dailyRate * daysDiff;
    const delivery = deliveryType === 'delivery' ? (outfit.delivery_fee || 150) : 0;
    return rentalAmount + delivery + (outfit.security_deposit || 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Preparing Escrow Checkout...</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="text-left mb-8"
        >
          <Link href="/discover" className="text-[10px] font-mono text-champagne hover:text-charcoal transition-colors flex items-center gap-1 mb-4">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
          <span className="text-xs font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
            Secure Checkout
          </span>
          <h1 className="text-3xl font-display font-medium text-charcoal">Complete Your Rental</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {outfit && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: 0.1 }}
              >
                <Card padding="md" className="bg-white border-border">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 rounded-lg overflow-hidden bg-ivory-dark flex-shrink-0">
                      <img src={outfit.images?.[0]?.url || ''} alt={outfit.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Badge variant="gold">{outfit.category}</Badge>
                      <h3 className="font-display text-base font-semibold text-charcoal mt-1">{outfit.title}</h3>
                      <p className="text-xs text-charcoal-light mt-0.5">by {outfit.seller?.name || 'Partner Host'}</p>
                      <p className="text-xs font-mono text-charcoal mt-2 font-bold">₹{outfit.price_1day?.toLocaleString('en-IN')}<span className="text-[9px] font-normal text-charcoal-light">/day</span></p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.15 }}
            >
              <Card padding="md" className="bg-white border-border space-y-5">
                <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                  <Calendar size={14} /> Rental Timeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-charcoal-light uppercase font-bold block">Pickup Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-[48px] px-4 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-charcoal-light uppercase font-bold block">Return Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-[48px] px-4 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
            >
              <Card padding="md" className="bg-white border-border space-y-5">
                <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                  <MapPin size={14} /> Delivery Method
                </h3>
                <div className="flex gap-3">
                  {(['delivery', 'pickup'] as const).map((type) => (
                    <button key={type} onClick={() => setDeliveryType(type)}
                      className={`flex-1 h-12 rounded text-xs font-mono uppercase font-bold border cursor-pointer transition-colors ${
                        deliveryType === type ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-border text-charcoal-light hover:border-charcoal'
                      }`}
                    >
                      {type === 'delivery' ? 'Home Delivery' : 'Self Pickup'}
                    </button>
                  ))}
                </div>
                {deliveryType === 'delivery' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-charcoal-light uppercase font-bold block">Delivery Address</label>
                    {addresses.length === 0 ? (
                      <p className="text-xs text-charcoal-light">No addresses saved. <Link href="/profile" className="text-champagne font-bold">Add one in your profile.</Link></p>
                    ) : (
                      <div className="space-y-2">
                        {addresses.map((addr) => (
                          <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                            className={`w-full p-4 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                              selectedAddress === addr.id ? 'border-champagne bg-champagne/5' : 'border-border bg-white hover:border-champagne/40'
                            }`}
                          >
                            <span className="font-bold text-charcoal uppercase">{addr.label}</span>
                            <p className="text-charcoal-light mt-0.5">{addr.full_address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.25 }}
            >
              <Card padding="md" className="bg-white border-border space-y-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                  <CreditCard size={14} /> Payment Method
                </h3>
                <div className="p-4 bg-ivory-dark/50 border border-border rounded-lg flex items-center gap-3">
                  <Lock size={16} className="text-champagne" />
                  <div>
                    <p className="text-xs font-semibold text-charcoal">Secure Escrow Payment via Razorpay</p>
                    <p className="text-[10px] text-charcoal-light">Encrypted checkout. Your deposit is held securely in escrow.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.3 }}
            >
              <Card padding="md" className="bg-white border-border sticky top-28 space-y-5">
                <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase flex items-center gap-2">
                  <ShieldCheck size={14} /> Order Summary
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-charcoal-light">
                    <span>Rental Deposit</span>
                    <span className="font-bold text-charcoal">₹{(outfit?.security_deposit || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-light">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-charcoal">{deliveryType === 'delivery' ? `₹${(outfit?.delivery_fee || 150).toLocaleString('en-IN')}` : 'Free'}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span className="text-charcoal">Total Due Today</span>
                    <span className="text-champagne text-sm">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <p className="text-[9px] text-charcoal-light font-mono leading-relaxed">
                  <Sparkles size={10} className="inline mr-1 text-champagne" />
                  Security deposit is fully refundable upon timely return and quality check.
                </p>
                <Button variant="primary" onClick={handlePlaceOrder} isLoading={processing} className="w-full h-[52px] cursor-pointer">
                  <Lock size={14} className="mr-2" /> Pay & Place Order
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Preparing Escrow Checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
