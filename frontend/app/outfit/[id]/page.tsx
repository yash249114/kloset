'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Calendar, MapPin, ShieldCheck, ChevronLeft, Heart, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { outfitsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import type { Outfit } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

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
    return (
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-champagne rounded-full border-t-transparent mb-2" />
        <p>Loading Couture Detail...</p>
      </div>
    );
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
        <Link href="/discover" className="text-[10px] font-mono text-champagne hover:text-charcoal transition-colors flex items-center gap-1 mb-6">
          <ChevronLeft size={12} /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springTransition}
            className="lg:col-span-7 space-y-4"
          >
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-ivory-dark border border-border relative group">
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[selectedImageIndex]?.url}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />
              <button onClick={toggleWishlist}
                className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm border border-border/40 rounded-full hover:bg-white transition-colors cursor-pointer"
              >
                <Heart size={18} className={isInWishlist ? 'fill-rose-gold text-rose-gold' : 'text-charcoal-light'} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button key={img.id} onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-colors ${
                      idx === selectedImageIndex ? 'border-champagne' : 'border-border hover:border-champagne/50'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springTransition}
            className="lg:col-span-5 space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="gold">{outfit.category}</Badge>
                {outfit.rating_avg > 0 && (
                  <span className="text-[10px] font-mono text-charcoal-light flex items-center gap-1">
                    <Star size={12} className="fill-gold text-gold" /> {outfit.rating_avg} ({outfit.rating_count})
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal">{outfit.title}</h1>
              {outfit.seller && (
                <p className="text-xs text-charcoal-light font-mono mt-1">
                  by {outfit.seller.name}
                  {outfit.seller.is_verified && <ShieldCheck size={12} className="inline ml-1 text-success" />}
                </p>
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

            <div className="p-6 bg-white border border-border rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase">Select Rental Duration</h3>
              <div className="flex gap-2">
                {[1, 3, 7].map((days) => (
                  <button key={days} onClick={() => setRentalDays(days)}
                    className={`flex-1 h-12 rounded text-xs font-mono uppercase font-bold border cursor-pointer transition-colors ${
                      rentalDays === days ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-border text-charcoal-light hover:border-charcoal'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
              {currentPrice && (
                <div className="text-center">
                  <span className="text-2xl font-display font-semibold text-charcoal">₹{currentPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-charcoal-light font-mono ml-1">for {rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-charcoal-light uppercase font-bold">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-[44px] px-3 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-charcoal-light uppercase font-bold">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-[44px] px-3 text-xs font-sans bg-warm-white border border-border rounded outline-none focus:border-champagne" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold tracking-widest text-champagne uppercase">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {outfit.sizes?.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded text-xs font-mono font-bold border cursor-pointer transition-colors ${
                      selectedSize === size ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-border text-charcoal-light hover:border-charcoal'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={handleBookNow} className="w-full h-[52px] cursor-pointer">
                <Calendar size={16} className="mr-2" /> Book Now
              </Button>
              <Button variant="outline" onClick={handleAddToCart} className="w-full h-[52px] cursor-pointer">
                <ShoppingBag size={16} className="mr-2" /> Add to Cart
              </Button>
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
      </div>
    </div>
  );
}
