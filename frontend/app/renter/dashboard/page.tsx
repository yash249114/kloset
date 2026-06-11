'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth.store';
import { bookingsAPI } from '@/lib/api/bookings';
import { outfitsAPI } from '@/lib/api/outfits';
import { reviewsAPI } from '@/lib/api/reviews';
import { disputesAPI } from '@/lib/api/disputes';
import { userAPI } from '@/lib/api/user';
import FloatIn from '@/components/motion/FloatIn';
import FloralDivider from '@/components/floral/FloralDivider';
import PetalBackground from '@/components/floral/PetalBackground';
import Skeleton, { DashboardSkeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Heart,
  Calendar,
  Wallet,
  ArrowRight,
  Clock,
  Sparkles,
  Star,
  ShieldAlert,
  X,
} from 'lucide-react';
import type { Booking, Outfit } from '@/types';

// Mock Bookings Data
const mockBookings: any[] = [
  {
    id: 'B-1029',
    booking_ref: 'B-1029',
    outfit: {
      id: 'outfit-1',
      title: 'Royal Maroon Bridal Lehenga',
      category: 'lehenga',
      images: [{ url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=400&fit=crop' }],
      price_1day: 3500,
    },
    pickup_date: '2026-06-12',
    return_date: '2026-06-15',
    status: 'confirmed',
    rental_days: 3,
    total_amount: 20800,
  },
  {
    id: 'B-1084',
    booking_ref: 'B-1084',
    outfit: {
      id: 'outfit-3',
      title: 'Midnight Blue Anarkali Set',
      category: 'anarkali',
      images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop' }],
      price_1day: 1800,
    },
    pickup_date: '2026-05-18',
    return_date: '2026-05-19',
    status: 'returned',
    rental_days: 1,
    total_amount: 7000,
  },
];

// Mock Wishlist Data
const mockWishlist: any[] = [
  {
    id: 'outfit-2',
    title: 'Golden Silk Zardozi Saree',
    price_1day: 3000,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-398883ce42d1?w=300&h=400&fit=crop' }],
    city: 'Delhi',
    category: 'saree',
  },
  {
    id: 'outfit-4',
    title: 'Blush Pink Gota Sharara',
    price_1day: 2200,
    images: [{ url: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7a75?w=300&h=400&fit=crop' }],
    city: 'Jaipur',
    category: 'sharara',
  },
];

export default function RenterDashboardPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile states
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [pref, setPref] = useState('');

  // Add address form state
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('Damaged Product Delivered');
  const [disputeDescription, setDisputeDescription] = useState('');

  // Guard in case user is null
  const userName = user?.name || 'Fashion Lover';
  const walletBalance = user?.wallet_balance || 15000;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'wishlist' || tab === 'bookings' || tab === 'profile') {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [bookingsResp, wishlistResp, profileResp, addressesResp] = await Promise.allSettled([
        bookingsAPI.listMyBookings(),
        outfitsAPI.getWishlist(),
        userAPI.getProfile(),
        userAPI.getAddresses(),
      ]);

      if (bookingsResp.status === 'fulfilled') {
        setBookings(bookingsResp.value.bookings);
      } else {
        console.warn('Failed to load bookings, using fallback:', bookingsResp.reason);
        setBookings(mockBookings);
      }

      if (wishlistResp.status === 'fulfilled') {
        setWishlist(wishlistResp.value.outfits);
      } else {
        console.warn('Failed to load wishlist, using fallback:', wishlistResp.reason);
        setWishlist(mockWishlist);
      }

      if (profileResp.status === 'fulfilled') {
        setProfile(profileResp.value);
        setName(profileResp.value.name || '');
        setPhone(profileResp.value.phone || '');
        setDob(profileResp.value.date_of_birth || '');
        setGender(profileResp.value.gender || '');
        setPref(profileResp.value.payment_preferences || '');
      }

      if (addressesResp.status === 'fulfilled') {
        setAddresses(addressesResp.value || []);
      }
    } catch (err) {
      console.error('Renter dashboard data load failure:', err);
      setBookings(mockBookings);
      setWishlist(mockWishlist);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile({
        name,
        phone,
        date_of_birth: dob,
        gender,
        payment_preferences: pref,
      });
      toast.success('Profile updated successfully!');
      if (user) {
        setUser({
          ...user,
          name,
          phone,
          date_of_birth: dob,
          gender,
          payment_preferences: pref,
        } as any);
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress || !newCity || !newState || !newPincode) {
      toast.error('Please fill out all required address fields.');
      return;
    }
    try {
      await userAPI.addAddress({
        label: newLabel,
        full_address: newAddress,
        city: newCity,
        state: newState,
        pincode: newPincode,
        is_default: addresses.length === 0,
      });
      toast.success('Address added to your account.');
      setNewAddress('');
      setNewCity('');
      setNewState('');
      setNewPincode('');
      loadDashboardData(true);
    } catch (err) {
      toast.error('Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userAPI.deleteAddress(id);
      toast.success('Address removed.');
      loadDashboardData(true);
    } catch (err) {
      toast.error('Failed to remove address.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await userAPI.setDefaultAddress(id);
      toast.success('Default address updated.');
      loadDashboardData(true);
    } catch (err) {
      toast.error('Failed to update default address.');
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.cancel(bookingId, 'User request via dashboard');
      toast.success('Booking cancelled successfully');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      toast.error('Could not cancel booking. Contact customer support.');
    }
  };

  const handleRetryPayment = async (booking: Booking) => {
    if (!booking.razorpay_order_id) {
      toast.error('Razorpay order ID not found for this booking.');
      return;
    }

    const verifyPaymentOnBackend = async (rzpResponse: any) => {
      try {
        const { default: api } = await import('@/lib/api/client');
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: rzpResponse.razorpay_order_id || booking.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature,
        });

        if (verifyRes.data?.success) {
          toast.success('Payment verified and booking confirmed successfully!');
          loadDashboardData();
        } else {
          throw new Error(verifyRes.data?.error || 'Signature verification failed');
        }
      } catch (verifyErr: any) {
        toast.error(verifyErr.message || 'Signature verification failed. Please contact support.');
      }
    };

    if ((window as any).Razorpay) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_keys',
        amount: Math.round(booking.total_amount * 100),
        currency: 'INR',
        name: 'Kloset',
        description: `Retry Payment: ${booking.outfit?.title || 'Outfit'}`,
        order_id: booking.razorpay_order_id,
        handler: verifyPaymentOnBackend,
        prefill: {
          name: user?.name || 'Guest User',
          email: user?.email || 'renter@kloset.in',
          contact: user?.phone || '9876543210',
        },
        theme: {
          color: '#111111',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      toast.error('Razorpay checkout module failed to load. Please refresh the page.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingId) return;

    try {
      await reviewsAPI.create({
        booking_id: reviewBookingId,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review posted successfully! Thank you for sharing your experience.');
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review. Have you already reviewed this?');
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeBookingId) return;

    try {
      await disputesAPI.raise({
        booking_id: disputeBookingId,
        reason: disputeReason,
        description: disputeDescription,
      });
      toast.success('Dispute raised successfully. Support team will review and contact you shortly.');
      setShowDisputeModal(false);
      setDisputeDescription('');
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to raise dispute.');
    }
  };

  const getStatusStyle = (status: string) => {
    const active = ['confirmed', 'picked_up', 'in_use', 'completed', 'returned'].includes(status);
    const pending = ['pending'].includes(status);
    if (active) {
      return {
        background: 'rgba(143, 175, 143, 0.15)',
        color: 'var(--sage-dark)',
        border: '1px solid rgba(143, 175, 143, 0.3)',
      };
    }
    if (pending) {
      return {
        background: 'rgba(201, 169, 110, 0.15)',
        color: 'var(--gold)',
        border: '1px solid rgba(201, 169, 110, 0.3)',
      };
    }
    return {
      background: 'var(--bloom)',
      color: 'var(--rose)',
      border: '1px solid var(--petal)',
    };
  };

  return (
    <div className="min-h-screen relative pb-24" style={{ background: 'var(--ivory)' }}>
      <PetalBackground />

      {/* Hero Header */}
      <section className="relative pt-12 pb-8">
        <div className="container mx-auto px-6">
          <FloatIn>
            <div
              className="rounded-[28px] p-8 md:p-10 relative overflow-hidden shadow-sm"
              style={{
                background: 'white',
                border: '1px solid var(--petal)',
              }}
            >
              {/* Decorative top strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--bloom)] to-[var(--rose)]" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[var(--gold)] font-bold">Renter Studio</span>
                  <h1 className="text-4xl md:text-5xl font-display font-bold mt-2" style={{ color: 'var(--ink)' }}>
                    Namaste, {userName}
                  </h1>
                  <p className="text-sm mt-2 max-w-md" style={{ color: 'var(--ink-light)' }}>
                    Manage your rental collections, explore saved couture pieces, and view your upcoming booking timelines.
                  </p>
                </div>
                
                {/* Wallet stats */}
                <div
                  className="rounded-2xl p-5 flex items-center gap-4 self-start md:self-auto shadow-sm bg-white"
                  style={{
                    background: 'var(--bloom)',
                    border: '1.5px solid var(--petal)',
                    minWidth: '220px',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[var(--rose)] shadow-sm">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase block text-[var(--ink-light)]">Ref. Deposit Wallet</span>
                    <span className="price text-xl font-bold mt-0.5 block">
                      ₹{walletBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FloatIn>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-4">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Outfits Rented', val: loading ? '...' : bookings.length.toString(), icon: ShoppingBag, desc: 'Total bookings made' },
              { label: 'Upcoming Event', val: loading ? '...' : bookings.filter(b => b.status === 'confirmed').length.toString(), icon: Calendar, desc: 'Confirmed reservations' },
              { label: 'Saved Designs', val: loading ? '...' : wishlist.length.toString(), icon: Heart, desc: 'Your boutique wishlist' },
              { label: 'Trust Score', val: '98%', icon: Sparkles, desc: 'Verified status score' },
            ].map((stat, i) => (
              <FloatIn key={stat.label} delay={i * 0.08}>
                <div
                  className="rounded-2xl p-5 bg-white transition-all duration-300 hover:shadow-md border border-[var(--petal)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono tracking-wider uppercase text-[var(--ink-light)]">{stat.label}</span>
                    <stat.icon size={16} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div className="text-3xl font-display font-bold" style={{ color: 'var(--ink)' }}>{stat.val}</div>
                  <span className="text-[11px] mt-1 block" style={{ color: 'var(--ink-lighter)' }}>{stat.desc}</span>
                </div>
              </FloatIn>
            ))}
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* Main Content Pane */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Tab switcher and items */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex gap-4 border-b border-[var(--bloom)] pb-1">
                  {[
                    { id: 'bookings', label: 'My Bookings' },
                    { id: 'wishlist', label: 'Saved Wishlist' },
                    { id: 'profile', label: 'Profile & Addresses' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className="relative pb-3 text-sm font-mono tracking-wider uppercase font-bold cursor-pointer"
                      style={{
                        color: activeTab === tab.id ? 'var(--rose)' : 'var(--ink-light)',
                      }}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="active-renter-tab"
                          className="absolute bottom-0 inset-x-0 h-[2px]"
                          style={{ background: 'var(--rose)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === 'bookings' && (
                  <div className="space-y-4">
                    {bookings.length > 0 ? (
                      bookings.map((booking) => {
                        const outfitImg = booking.outfit?.images?.[0]?.url || '/placeholder-outfit.jpg';
                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl p-5 bg-white flex flex-col sm:flex-row gap-4 items-center border border-[var(--petal)] shadow-sm"
                          >
                            <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={outfitImg}
                                alt={booking.outfit?.title || 'Outfit'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 text-center sm:text-left">
                              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                <span className="badge badge-gold !py-0.5 !px-2.5 text-[9px] uppercase tracking-wider">
                                  {booking.outfit?.category || 'Couture'}
                                </span>
                                <span className="text-[11px] font-mono" style={{ color: 'var(--ink-lighter)' }}>
                                  Ref: {booking.booking_ref}
                                </span>
                              </div>
                              <h3 className="font-display text-lg font-bold mt-1 text-[var(--ink)]">
                                {booking.outfit?.title || 'Heritage Wear'}
                              </h3>
                              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start text-xs" style={{ color: 'var(--ink-light)' }}>
                                <Clock size={12} />
                                <span>
                                  {new Date(booking.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} to{' '}
                                  {new Date(booking.return_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ({booking.rental_days} days)
                                </span>
                              </div>
                            </div>

                            <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[var(--bloom)] pt-4 sm:pt-0 sm:pl-6 flex-shrink-0">
                              <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--ink-lighter)] block">Total Paid</span>
                              <span className="price text-lg font-bold mt-0.5 block">
                                ₹{booking.total_amount.toLocaleString('en-IN')}
                              </span>
                              <span
                                className="badge mt-2 text-[10px] uppercase font-bold py-0.5 px-3 block text-center capitalize"
                                style={getStatusStyle(booking.status)}
                              >
                                {booking.status}
                              </span>

                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-[10px] text-[var(--rose)] hover:underline mt-2 block w-full text-center cursor-pointer"
                                >
                                  Cancel Booking
                                </button>
                              )}

                              {booking.status === 'pending' && (booking.payment_status === 'pending' || booking.payment_status === 'failed') && (
                                <button
                                  onClick={() => handleRetryPayment(booking)}
                                  className="btn-rose !h-7 !px-3 text-[9px] uppercase font-mono mt-2.5 w-full flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Wallet size={10} /> Retry Payment
                                </button>
                              )}

                              {(booking.status === 'completed' || booking.status === 'returned') && (
                                <button
                                  onClick={() => {
                                    setReviewBookingId(booking.id);
                                    setShowReviewModal(true);
                                  }}
                                  className="btn-gold !h-7 !px-3 text-[9px] uppercase font-mono mt-2.5 w-full flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Star size={10} /> Write Review
                                </button>
                              )}

                              {booking.status !== 'cancelled' && booking.status !== 'pending' && booking.status !== 'disputed' && (
                                <button
                                  onClick={() => {
                                    setDisputeBookingId(booking.id);
                                    setShowDisputeModal(true);
                                  }}
                                  className="text-[9px] text-[var(--rose-dark)] font-mono uppercase tracking-wider block text-center hover:underline mt-2 w-full cursor-pointer"
                                >
                                  🚨 Dispute Order
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-[var(--petal)]">
                        <p className="text-sm text-[var(--ink-lighter)]">You have no reservations scheduled.</p>
                        <Link href="/discover" className="btn-gold mt-4 inline-block text-xs uppercase font-mono tracking-wider">
                          Browse Collection
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.length > 0 ? (
                      wishlist.map((item) => {
                        const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all duration-300 border border-[var(--petal)]"
                          >
                            <div className="relative aspect-[4/3]">
                              <Image src={imgUrl} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="p-4">
                              <h4 className="font-display text-base font-bold text-[var(--ink)] line-clamp-1">{item.title}</h4>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--bloom)]">
                                <span className="price text-sm">
                                  ₹{(item.price_1day || 0).toLocaleString('en-IN')}{' '}
                                  <span className="text-[10px] text-[var(--ink-lighter)] font-normal">/ day</span>
                                </span>
                                <Link href={`/outfit/${item.id}`} className="text-xs font-mono uppercase tracking-wider text-[var(--rose)] font-bold flex items-center gap-1 hover:text-[var(--rose-dark)]">
                                  Book <ArrowRight size={12} />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-[var(--petal)]">
                        <p className="text-sm text-[var(--ink-lighter)]">Your wishlist is currently empty.</p>
                        <Link href="/discover" className="btn-gold mt-4 inline-block text-xs uppercase font-mono tracking-wider">
                          Explore Catalog
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Renter Profile details */}
                    <div className="bg-white rounded-2xl p-6 border border-[var(--petal)] shadow-sm space-y-6">
                      <h3 className="font-display text-lg font-semibold text-[var(--ink)] pb-3 border-b border-[var(--bloom)]">
                        Renter Profile Details
                      </h3>
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-kloset text-xs" required />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Phone Number</label>
                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-kloset text-xs" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Date of Birth</label>
                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input-kloset text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-kloset text-xs bg-white">
                              <option value="">Select Gender</option>
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                              <option value="non_binary">Non-Binary</option>
                              <option value="prefer_not_to_say">Prefer Not to Say</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Payment Preferences</label>
                          <input type="text" value={pref} onChange={(e) => setPref(e.target.value)} className="input-kloset text-xs" placeholder="e.g. Card ending 4321, UPI name@upi" />
                        </div>
                        <button type="submit" className="btn-gold !h-10 !px-6 text-xs uppercase font-mono tracking-wider cursor-pointer">
                          Save Profile Changes
                        </button>
                      </form>
                    </div>

                    {/* Saved Addresses list */}
                    <div className="bg-white rounded-2xl p-6 border border-[var(--petal)] shadow-sm space-y-6">
                      <h3 className="font-display text-lg font-semibold text-[var(--ink)] pb-3 border-b border-[var(--bloom)]">
                        Saved Shipping Destinations
                      </h3>
                      {addresses.length === 0 ? (
                        <p className="text-xs text-[var(--ink-lighter)]">No addresses saved yet. Use the form below to add one.</p>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div key={addr.id} className="p-4 rounded-xl border border-[var(--petal)] bg-[#faf9f6]/30 flex justify-between items-start gap-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[var(--ink)]">{addr.label || 'Address'}</span>
                                  {addr.is_default && <span className="badge badge-rose text-[8px] uppercase font-bold">Default</span>}
                                </div>
                                <p className="text-[var(--ink-light)] leading-relaxed">{addr.full_address}</p>
                                <p className="text-[var(--ink-lighter)] font-mono text-[10px]">{addr.city}, {addr.state} - {addr.pincode}</p>
                              </div>
                              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                                {!addr.is_default && (
                                  <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[9px] font-mono text-[var(--rose)] hover:underline uppercase tracking-wider cursor-pointer">
                                    Set Default
                                  </button>
                                )}
                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-[9px] font-mono text-gray-400 hover:text-red-500 hover:underline uppercase tracking-wider cursor-pointer">
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-[var(--bloom)] pt-6 space-y-4">
                        <h4 className="text-xs uppercase tracking-wider font-mono text-[var(--rose)]">Add New Address</h4>
                        <form onSubmit={handleCreateAddress} className="space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            {['Home', 'Office', 'Other'].map((lbl) => (
                              <button
                                key={lbl}
                                type="button"
                                onClick={() => setNewLabel(lbl)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                  newLabel === lbl
                                    ? 'bg-[var(--rose)] text-white'
                                    : 'bg-white border border-[var(--petal)] text-[var(--ink-light)]'
                                }`}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Street Address</label>
                            <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="input-kloset text-xs" placeholder="Flat number, building name, street address" required />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">City</label>
                              <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="input-kloset text-xs" placeholder="Mumbai" required />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">State</label>
                              <input type="text" value={newState} onChange={(e) => setNewState(e.target.value)} className="input-kloset text-xs" placeholder="Maharashtra" required />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">Pincode</label>
                              <input type="text" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} className="input-kloset text-xs" placeholder="400001" required />
                            </div>
                          </div>
                          <button type="submit" className="btn-gold !h-10 w-full text-xs uppercase font-mono tracking-wider cursor-pointer">
                            Add Address
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Mini profile settings widget */}
              <div className="lg:col-span-4 space-y-6">
                <div
                  className="rounded-2xl p-6 bg-white space-y-6 border border-[var(--petal)] shadow-sm"
                >
                  <div className="pb-4 border-b border-[var(--bloom)] text-center">
                    <div
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-3"
                      style={{ background: 'linear-gradient(135deg, var(--rose), var(--gold))' }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>{userName}</h3>
                    <span className="text-xs" style={{ color: 'var(--ink-light)' }}>Verified Premium Renter</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--bloom)]">
                      <span style={{ color: 'var(--ink-light)' }}>KYC Verification</span>
                      <span className="badge badge-sage font-bold uppercase text-[9px]">Verified</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--bloom)]">
                      <span style={{ color: 'var(--ink-light)' }}>Active City</span>
                      <span className="font-medium" style={{ color: 'var(--ink)' }}>Mumbai, India</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--ink-light)' }}>Member Since</span>
                      <span className="font-medium" style={{ color: 'var(--ink)' }}>June 2024</span>
                    </div>
                  </div>

                  <Link
                    href="/discover"
                    className="btn-gold w-full text-center flex items-center justify-center gap-2 !py-3.5 text-xs tracking-wider"
                  >
                    Browse Catalog
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Write Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-[var(--petal)] p-6 md:p-8 max-w-md w-full relative space-y-6 shadow-2xl"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-[var(--ink-lighter)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-[var(--bloom)]/30 rounded-full flex items-center justify-center mx-auto text-[var(--gold)]">
                  <Star size={20} fill="currentColor" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">Review Your Rental</h3>
                <p className="text-xs text-[var(--ink-light)]">Share your feedback to help other fashion seekers.</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block text-center mb-2">
                    Overall Outfit Rating
                  </label>
                  <div className="flex gap-1.5 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-2xl cursor-pointer focus:outline-none"
                        style={{ color: star <= reviewRating ? 'var(--gold)' : 'var(--petal)' }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                    Your Review Feedback
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how the garment fit, the fabric feel, and your experience..."
                    className="input-kloset text-xs min-h-[80px] py-2"
                  />
                </div>

                <button type="submit" className="btn-rose w-full text-xs font-mono uppercase tracking-wider py-3 cursor-pointer">
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Raise Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-[var(--petal)] p-6 md:p-8 max-w-md w-full relative space-y-6 shadow-2xl"
            >
              <button
                onClick={() => setShowDisputeModal(false)}
                className="absolute top-4 right-4 text-[var(--ink-lighter)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-[var(--bloom)]/30 rounded-full flex items-center justify-center mx-auto text-[var(--rose)]">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">File Order Dispute</h3>
                <p className="text-xs text-[var(--ink-light)]">Report a concern. Our arbitration team will review.</p>
              </div>

              <form onSubmit={handleDisputeSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                    Reason for Dispute
                  </label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="input-kloset text-xs py-2 bg-[var(--ivory)]"
                  >
                    <option value="Damaged Product Delivered">Damaged Product Delivered</option>
                    <option value="Wrong Item or Size Received">Wrong Item or Size Received</option>
                    <option value="Item Never Received / Not Delivered">Item Never Received / Not Delivered</option>
                    <option value="Sizing / Fit Extremely Out of Spec">Sizing / Fit Extremely Out of Spec</option>
                    <option value="Sellers Listing Details Incorrect">Sellers Listing Details Incorrect</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-[var(--ink-light)] block mb-1">
                    Describe Issue Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Provide a detailed explanation. If possible, list any evidence and timestamps..."
                    className="input-kloset text-xs min-h-[80px] py-2"
                  />
                </div>

                <button type="submit" className="btn-rose w-full text-xs font-mono uppercase tracking-wider py-3 cursor-pointer">
                  Raise Dispute Investigation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
