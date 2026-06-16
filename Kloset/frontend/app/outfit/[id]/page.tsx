'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Calendar, MapPin, ShieldCheck, ChevronLeft, Heart, ShoppingBag, Sparkles, Check, MessageSquare, Truck, Shield, RotateCcw, Clock, User, Award } from 'lucide-react';
import { toast } from 'sonner';
import { outfitsAPI, reviewsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import type { Outfit, ReviewResponse } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { OutfitDetailSkeleton } from '@/components/ui/Skeleton';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [rentalDays, setRentalDays] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchOutfit = async () => {
      setLoading(true);
      try {
        const id = params?.id as string;
        if (!id) return;
        const data = await outfitsAPI.getById(id);
        setOutfit(data);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        const today = new Date();
        const end = new Date(today);
        end.setDate(end.getDate() + 3);
        setStartDate(today.toISOString().substring(0, 10));
        setEndDate(end.toISOString().substring(0, 10));
        const reviewData = await reviewsAPI.listOutfitReviews(id);
        setReviews(reviewData.reviews || []);
        const trending = await outfitsAPI.getTrending(4);
        setRecommendations(trending.filter((o) => o.id !== id).slice(0, 4));
      } catch {
        toast.error('Failed to load outfit details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOutfit();
  }, [params?.id]);

  const isInWishlist = outfit ? wishlist.some((w) => w.id === outfit.id) : false;

  const toggleWishlist = async () => {
    if (!outfit) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/outfit/${outfit.id}`);
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(outfit.id);
        toast.success('Removed from wishlist.');
      } else {
        await addToWishlist(outfit);
        toast.success('Added to wishlist!');
      }
    } catch {
      toast.error('Failed to update wishlist.');
    }
  };

  const handleAddToCart = () => {
    if (!outfit) return;
    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    addItem({
      id: outfit.id,
      title: outfit.title,
      price: outfit.price_3day || outfit.price_1day || 1500,
      deposit: outfit.security_deposit || 2000,
      size: selectedSize,
      startDate,
      endDate,
      image: outfit.images?.[0]?.url || '',
      sellerId: outfit.seller_id,
      sellerName: outfit.seller?.name || 'Partner Host',
    });
    toast.success('Added to Cart');
  };

  const handleBookNow = () => {
    if (!outfit) return;
    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/booking/checkout?outfit_id=${outfit.id}`);
      return;
    }
    router.push(`/booking/checkout?outfit_id=${outfit.id}`);
  };

  const priceMap: Record<number, number | null> = {
    1: outfit?.price_1day || null,
    3: outfit?.price_3day || null,
    7: outfit?.price_7day || null,
  };

  const currentPrice = priceMap[rentalDays] || null;

  if (loading) {
    return <OutfitDetailSkeleton />;
  }

  if (!outfit) {
    return (
      <div className="bg-ivory min-h-screen pt-36 text-center">
        <p className="font-display text-xl text-charcoal-light">Outfit not found.</p>
        <Link href="/discover" className="btn btn-primary mt-6 inline-flex">Browse Catalog</Link>
      </div>
    );
  }

  const images = outfit.images?.length ? outfit.images : [{ id: 'placeholder', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: true, sort_order: 0 }];

  return (
    <div className="bg-ivory min-h-screen pt-28 pb-16 font-sans text-charcoal select-none">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/discover" className="text-[10px] font-mono text-champagne hover:text-charcoal transition-colors flex items-center gap-1.5 mb-8 group">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springTransition}
            className="lg:col-span-7 space-y-4"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-ivory-dark to-ivory border border-border/60 relative group shadow-lg">
              {/* Main Image with Zoom */}
              <div className="relative w-full h-full" onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setZoomPosition({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100
                });
              }} onMouseEnter={() => setIsImageZoomed(true)} onMouseLeave={() => setIsImageZoomed(false)}>
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={images[selectedImageIndex]?.url}
                  alt={outfit.title}
                  className={`w-full h-full object-cover transition-transform duration-300 ease-out ${isImageZoomed ? 'scale-[1.8]' : ''}`}
                  style={isImageZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                />
                {/* Zoom Lens Indicator */}
                {isImageZoomed && (
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent pointer-events-none" />
                )}
              </div>

              {/* Wishlist Button */}
              <motion.button
                onClick={toggleWishlist}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md border border-border/40 rounded-full hover:bg-white transition-all cursor-pointer z-10 shadow-md"
              >
                <Heart size={18} className={isInWishlist ? 'fill-rose-gold text-rose-gold' : 'text-charcoal-light'} />
              </motion.button>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-charcoal/70 backdrop-blur-sm text-white text-[10px] font-mono px-3 py-1.5 rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Zoom Hint */}
              <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                Hover to zoom
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <motion.button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all duration-300 ${
                      idx === selectedImageIndex
                        ? 'border-champagne shadow-md ring-2 ring-champagne/20'
                        : 'border-border/60 hover:border-champagne/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Trust Badges Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: ShieldCheck, label: '100% Authentic', color: 'text-success', bg: 'bg-success/5' },
                { icon: RotateCcw, label: 'Free Dry-Clean', color: 'text-champagne', bg: 'bg-champagne/5' },
                { icon: Truck, label: 'Doorstep Delivery', color: 'text-champagne', bg: 'bg-champagne/5' },
                { icon: Shield, label: 'Escrow Protected', color: 'text-champagne', bg: 'bg-champagne/5' },
              ].map((badge, idx) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springTransition, delay: 0.2 + idx * 0.05 }}
                  className={`flex items-center gap-2.5 px-4 py-3 ${badge.bg} border border-border/40 rounded-xl`}
                >
                  <badge.icon size={16} className={badge.color} />
                  <span className="text-[10px] font-mono font-bold text-charcoal">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springTransition}
            className="lg:col-span-5 space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="gold" className="!rounded-full">{outfit.category}</Badge>
                {outfit.rating_avg > 0 && (
                  <span className="text-[10px] font-mono text-charcoal-light flex items-center gap-1 bg-ivory-dark px-2 py-1 rounded-full">
                    <Star size={12} className="fill-gold text-gold" /> {outfit.rating_avg} ({outfit.rating_count} reviews)
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal leading-tight">{outfit.title}</h1>
              {outfit.seller && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-charcoal-light font-mono">
                    by <span className="text-charcoal font-bold">{outfit.seller.name}</span>
                  </span>
                  {outfit.seller.is_verified && (
                    <span className="flex items-center gap-1 bg-success/10 text-success text-[9px] font-mono px-2 py-0.5 rounded-full">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {outfit.occasions?.map((occ) => (
                <Badge key={occ} variant="outline">{occ}</Badge>
              ))}
            </div>

            {outfit.description && (
              <p className="text-sm text-charcoal-light leading-relaxed font-light">{outfit.description}</p>
            )}

            <div className="p-6 bg-white border border-border/60 rounded-2xl space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase">Select Rental Duration</h3>
              <div className="flex gap-2">
                {[1, 3, 7].map((days) => (
                  <motion.button
                    key={days}
                    onClick={() => setRentalDays(days)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 h-12 rounded-xl text-xs font-mono uppercase font-bold border cursor-pointer transition-all duration-300 ${
                      rentalDays === days
                        ? 'bg-charcoal text-ivory border-charcoal shadow-md'
                        : 'bg-white border-border/60 text-charcoal-light hover:border-champagne/60 hover:shadow-sm'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </motion.button>
                ))}
              </div>
              {currentPrice && (
                <div className="text-center bg-ivory/50 rounded-xl py-3">
                  <span className="text-2xl font-display font-semibold text-charcoal">₹{currentPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-charcoal-light font-mono ml-1">for {rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-charcoal-light uppercase font-bold">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-[48px] px-3 text-xs font-sans bg-warm-white border border-border/60 rounded-lg outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-charcoal-light uppercase font-bold">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-[48px] px-3 text-xs font-sans bg-warm-white border border-border/60 rounded-lg outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {outfit.sizes?.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all duration-300 ${
                      selectedSize === size
                        ? 'bg-charcoal text-ivory border-charcoal shadow-md'
                        : 'bg-white border-border/60 text-charcoal-light hover:border-champagne/60 hover:shadow-sm'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sticky Booking Card */}
            <div className="sticky top-24 lg:top-28">
              <div className="p-6 bg-white border border-border/60 rounded-2xl space-y-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-champagne uppercase font-bold block mb-1">Total for {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}</span>
                    <span className="text-3xl font-display font-semibold text-charcoal">₹{currentPrice?.toLocaleString('en-IN') || '—'}</span>
                  </div>
                  {currentPrice && (
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-charcoal-light block">Per day</span>
                      <span className="text-sm font-mono font-bold text-champagne">₹{Math.round(currentPrice / rentalDays).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/60 pt-4 space-y-3 text-xs text-charcoal-light">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Calendar size={12} className="text-champagne" /> Rental</span>
                    <span className="font-mono font-bold text-charcoal">₹{currentPrice?.toLocaleString('en-IN') || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Shield size={12} className="text-champagne" /> Security Deposit</span>
                    <span className="font-mono font-bold text-charcoal">₹{outfit.security_deposit?.toLocaleString('en-IN') || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Award size={12} className="text-champagne" /> Platform Fee (5%)</span>
                    <span className="font-mono text-charcoal">₹{currentPrice ? Math.round(currentPrice * 0.05).toLocaleString('en-IN') : '—'}</span>
                  </div>
                  <div className="border-t border-border/60 pt-3 flex items-center justify-between text-sm font-semibold text-charcoal">
                    <span className="flex items-center gap-2"><Truck size={14} className="text-champagne" /> Total Payable</span>
                    <span className="font-display text-lg">₹{currentPrice ? (currentPrice + (outfit.security_deposit || 0) + Math.round(currentPrice * 0.05)).toLocaleString('en-IN') : '—'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button variant="primary" onClick={handleBookNow} className="w-full h-[52px] cursor-pointer !rounded-xl">
                    <Calendar size={16} className="mr-2" /> Book Now
                  </Button>
                  <Button variant="outline" onClick={handleAddToCart} className="w-full h-[52px] cursor-pointer !rounded-xl">
                    <ShoppingBag size={16} className="mr-2" /> Add to Cart
                  </Button>
                </div>

                {/* Security Deposit Explanation */}
                <div className="bg-ivory/50 border border-border/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-charcoal uppercase tracking-wider">
                    <Shield size={12} className="text-champagne" /> Security Deposit
                  </div>
                  <p className="text-[10px] text-charcoal-light leading-relaxed">
                    Fully refundable within 72 hours after return. Covers any potential damage or late returns.
                  </p>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2.5 text-[10px] font-mono text-charcoal-light">
                  <div className="flex items-center gap-2.5 text-success">
                    <ShieldCheck size={12} /> Deposit refunded within 72hrs post return
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RotateCcw size={12} className="text-champagne" /> Free dry-cleaning included
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck size={12} className="text-champagne" /> Doorstep delivery & pickup
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-3 text-xs text-charcoal-light">
              {outfit.city && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-champagne" /> Available in {outfit.city}{outfit.state ? `, ${outfit.state}` : ''}
                </p>
              )}
              {outfit.fabric && (
                <p className="flex items-center gap-2">
                  <Sparkles size={14} className="text-champagne" /> Fabric: {outfit.fabric}
                </p>
              )}
              {outfit.colors && outfit.colors.length > 0 && (
                <p className="flex items-center gap-2">
                  <Check size={14} className="text-champagne" /> Colors: {outfit.colors.join(', ')}
                </p>
              )}
              {outfit.security_deposit && (
                <p className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-champagne" /> Refundable Deposit: ₹{outfit.security_deposit.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.4 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
                Client Reviews
              </span>
              <h2 className="text-2xl font-display font-medium text-charcoal">What Renters Say</h2>
            </div>
            {outfit.rating_avg > 0 && (
              <div className="flex items-center gap-2 bg-ivory-dark px-4 py-2 rounded-full">
                <Star size={16} className="fill-gold text-gold" />
                <span className="font-bold text-charcoal">{outfit.rating_avg.toFixed(1)}</span>
                <span className="text-charcoal-light font-mono text-xs">({outfit.rating_count})</span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="shimmer h-32 rounded-xl bg-ivory-dark animate-pulse" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springTransition, delay: 0.4 + idx * 0.05 }}
                  className="bg-white border border-border/60 rounded-xl p-5 text-left hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-champagne/20 to-champagne/5 flex items-center justify-center text-xs font-bold text-charcoal flex-shrink-0 border border-champagne/20">
                      {(review.reviewer_name || 'U')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-charcoal truncate">{review.reviewer_name || 'Verified Renter'}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={11} className={star <= review.rating ? 'fill-gold text-gold' : 'text-charcoal-light'} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-xs text-charcoal-light leading-relaxed">{review.comment}</p>}
                      <span className="text-[9px] text-charcoal-light/60 font-mono block mt-2">{new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border/60 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-champagne/5 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-champagne" />
              </div>
              <p className="text-sm text-charcoal-light">No reviews yet. Be the first to rent and share your experience!</p>
            </div>
          )}
        </motion.div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.5 }}
            className="mt-16"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-champagne uppercase font-bold block mb-1">
                  You May Also Like
                </span>
                <h2 className="text-2xl font-display font-medium text-charcoal">Similar Couture</h2>
              </div>
              <Link href="/discover" className="text-xs font-mono text-champagne hover:text-charcoal transition-colors flex items-center gap-1">
                View All <ChevronLeft size={12} className="rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((rec, idx) => (
                <Link key={rec.id} href={`/outfit/${rec.id}`} className="block group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springTransition, delay: 0.5 + idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-border/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-ivory-dark to-ivory overflow-hidden relative">
                      <img src={rec.images?.[0]?.url || ''} alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-champagne font-bold block truncate">{rec.category}</span>
                      <h4 className="text-sm font-semibold text-charcoal truncate group-hover:text-charcoal transition-colors">{rec.title}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="text-sm font-mono font-bold text-charcoal">₹{rec.price_1day?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-charcoal-light">/day</span></span>
                        {rec.rating_avg > 0 && (
                          <span className="text-[9px] font-mono flex items-center gap-0.5">
                            <Star size={10} className="fill-gold text-gold" /> {rec.rating_avg}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
