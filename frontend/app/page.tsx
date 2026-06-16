'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star,
  ShieldCheck,
  Lock,
  MapPin,
  Truck,
  Search,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { outfitsAPI } from '@/lib/api';
import type { Outfit } from '@/types';
import { toast } from 'sonner';

const MOCK_TRENDING: Partial<Outfit>[] = [
  {
    id: 'outfit-1',
    title: 'Ivory Zardozi Lehenga',
    price_1day: 2500,
    security_deposit: 8000,
    rating_avg: 4.9,
    seller: { id: 's1', name: 'Ritu V.', avatar_url: null, is_verified: true, trust_score: 98 },
    images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'lehenga',
  },
  {
    id: 'outfit-2',
    title: 'Crimson Banarasi Saree',
    price_1day: 1800,
    security_deposit: 5000,
    rating_avg: 4.8,
    seller: { id: 's2', name: 'Ananya S.', avatar_url: null, is_verified: true, trust_score: 95 },
    images: [{ id: 'img-2', url: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'saree',
  },
  {
    id: 'outfit-3',
    title: 'Emerald Velvet Sherwani',
    price_1day: 3200,
    security_deposit: 10000,
    rating_avg: 5.0,
    seller: { id: 's3', name: 'Kabir D.', avatar_url: null, is_verified: true, trust_score: 99 },
    images: [{ id: 'img-3', url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'sherwani',
  },
  {
    id: 'outfit-4',
    title: 'Rose Gold Anarkali Suit',
    price_1day: 1500,
    security_deposit: 4000,
    rating_avg: 4.7,
    seller: { id: 's4', name: 'Sanjana K.', avatar_url: null, is_verified: false, trust_score: 90 },
    images: [{ id: 'img-4', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'anarkali',
  },
];

const MOCK_NEW: (Partial<Outfit> & { isNew: boolean })[] = [
  {
    id: 'outfit-5',
    title: 'Pastel Mint Sharara Set',
    price_1day: 1600,
    security_deposit: 4500,
    rating_avg: 4.6,
    images: [{ id: 'img-5', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'sharara',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: 'outfit-6',
    title: 'Midnight Blue Gown',
    price_1day: 2800,
    security_deposit: 8000,
    rating_avg: 4.9,
    images: [{ id: 'img-6', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'gown',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: 'outfit-7',
    title: 'Gold Brocade Kurta Set',
    price_1day: 1200,
    security_deposit: 3000,
    rating_avg: 4.5,
    images: [{ id: 'img-7', url: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'kurta_set',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: 'outfit-8',
    title: 'Floral Silk Co-Ord Set',
    price_1day: 1100,
    security_deposit: 2500,
    rating_avg: 4.7,
    images: [{ id: 'img-8', url: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=600&q=80', is_primary: true, sort_order: 0 }],
    category: 'co_ord',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
];

const MOCK_DESIGNERS = [
  { name: 'Sabyasachi', logo: 'S', bg: 'bg-[#2A2A22]' },
  { name: 'Manish Malhotra', logo: 'M', bg: 'bg-[#222A2A]' },
  { name: 'Anita Dongre', logo: 'A', bg: 'bg-[#2A2226]' },
  { name: 'Tarun Tahiliani', logo: 'T', bg: 'bg-[#22262A]' },
  { name: 'Ritu Kumar', logo: 'R', bg: 'bg-[#262A22]' },
  { name: 'Raw Mango', logo: 'RM', bg: 'bg-[#2C2C2C]' },
];

const MOCK_SELLERS = [
  { id: 's1', name: 'House of Couture', verified: true, score: 98, location: 'Mumbai', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', rate: '97%' },
  { id: 's2', name: 'Aura Bridal Studio', verified: true, score: 95, location: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', rate: '94%' },
];

const MOCK_REVIEWS = [
  { id: 'rev-1', author: 'Priya M.', text: 'Rented the Crimson Saree for my cousin\u2019s wedding. The fabric was pristine, dry-cleaned beautifully, and fit perfectly.', stars: 5, date: 'Yesterday' },
  { id: 'rev-2', author: 'Rahul V.', text: 'First time trying rental sherwanis and the experience was top notch. Fit assistance via customer support was exact, delivery was right on time.', stars: 5, date: '3 days ago' },
  { id: 'rev-3', author: 'Sneha G.', text: 'The velvet lehenga was gorgeous. It looked completely new. Escrow deposit returned within 48 hours.', stars: 5, date: '1 week ago' },
];

const easeConfig = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: easeConfig,
};

export default function Homepage() {
  const { isAuthenticated } = useAuthStore();
  const setAIStylistOpen = useUIStore((s) => s.setAIStylistOpen);

  const [activeOccasion, setActiveOccasion] = useState('wedding');
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const [trending, setTrending] = useState<Partial<Outfit>[]>(MOCK_TRENDING);
  const [newArrivals, setNewArrivals] = useState<(Partial<Outfit> & { isNew: boolean })[]>(MOCK_NEW);

  useEffect(() => {
    async function loadData() {
      try {
        const trendResp = await outfitsAPI.getTrending(4);
        if (trendResp && trendResp.length > 0) setTrending(trendResp);
      } catch (err) {
        console.warn('Could not load trending outfits, using fallbacks.', err);
      }
      try {
        const discoverResp = await outfitsAPI.browse({ sort: 'newest', per_page: 4 });
        if (discoverResp && discoverResp.outfits.length > 0) {
          setNewArrivals(discoverResp.outfits.map((o) => ({ ...o, isNew: true })));
        }
      } catch (err) {
        console.warn('Could not load new arrivals, using fallbacks.', err);
      }
    }
    loadData();
  }, []);

  const occasionOutfits = useMemo(() => {
    const items = [...MOCK_TRENDING, ...MOCK_NEW].filter(
      (item) =>
        item.category ===
        (activeOccasion === 'wedding'
          ? 'lehenga'
          : activeOccasion === 'reception'
            ? 'saree'
            : activeOccasion === 'festive'
              ? 'anarkali'
              : 'sherwani')
    );
    return items.length > 0 ? items : MOCK_TRENDING.slice(0, 2);
  }, [activeOccasion]);

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-ivory text-charcoal min-h-screen pt-[72px]">
      <div className="grain-overlay" />

      {/* ─── SECTION 1: HERO ─── */}
      <section className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="flex flex-col justify-center px-6 lg:px-16 py-24 lg:py-0 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...easeConfig, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-medium text-charcoal leading-[1.05] tracking-tight"
          >
            Wear Legacy,
            <br />
            <span className="italic text-champagne">Return the Rest.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...easeConfig, delay: 0.2 }}
            className="mt-6 text-sm md:text-base text-charcoal-light leading-relaxed max-w-md font-light"
          >
            Access luxury designer wedding sets, sarees, and sherwanis for a
            fraction of the cost, with dry-cleaned precision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...easeConfig, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/discover"
              className="btn btn-primary px-10 cursor-pointer"
            >
              Browse Couture
            </Link>
            <button
              onClick={() => setAIStylistOpen(true)}
              className="btn btn-ghost gap-2 text-charcoal-light hover:text-charcoal cursor-pointer"
            >
              <Sparkles size={16} />
              AI Stylist
            </button>
          </motion.div>
        </div>

        <div className="relative h-[50dvh] lg:h-auto overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1610030470216-5cf4b63ff8cd?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-ivory hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent lg:hidden" />
        </div>
      </section>

      {/* ─── SECTION 2: TRENDING RENTALS ─── */}
      <motion.section {...fadeUp} className="section-pad max-w-[1440px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase">
              Curated Selection
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-2 leading-tight">
              Trending Rentals
            </h2>
          </div>
          <Link
            href="/discover?sort=popular"
            className="text-xs font-mono uppercase tracking-widest text-charcoal-light hover:text-charcoal transition-colors flex items-center gap-1 flex-shrink-0"
          >
            See All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scroll-rail snap-x">
          {trending.map((item) => {
            const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
            return (
              <div
                key={item.id}
                className="min-w-[300px] w-[300px] snap-start flex-shrink-0"
              >
                <div className="double-bezel">
                  <div className="double-bezel-inner">
                    <Link
                      href={`/outfit/${item.id}`}
                      className="block group"
                    >
                      <div className="h-[380px] relative overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                        />
                        {item.rating_avg && (
                          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm">
                            <Star
                              size={10}
                              className="fill-champagne text-champagne"
                            />{' '}
                            {item.rating_avg}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="p-5 space-y-2">
                        <span className="text-[9px] font-mono text-champagne uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="font-display text-sm font-semibold text-charcoal truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                          <span className="text-sm font-bold text-charcoal">
                            ₹{item.price_1day?.toLocaleString('en-IN')}
                            <span className="text-[10px] font-normal text-charcoal-light">
                              /day
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── SECTION 3: HERITAGE COLLECTIONS ─── */}
      <motion.section {...fadeUp} className="section-pad bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mb-12 leading-tight">
            Heritage Collections
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 relative h-[500px] lg:h-[600px] bento-cell group">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="text-[10px] font-mono tracking-widest text-champagne uppercase">
                  Bridal Couture
                </span>
                <h3 className="text-3xl font-display text-warm-white font-medium mt-2">
                  The Wedding Atelier
                </h3>
                <p className="text-sm text-ivory/70 font-light mt-2 max-w-sm">
                  Hand-crafted lehengas and heavy designer sets for your special
                  day.
                </p>
                <Link
                  href="/discover?occasion=wedding"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase text-champagne tracking-widest mt-4 hover:underline"
                >
                  Explore Collection <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative h-[240px] lg:h-[292px] bento-cell group">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[9px] font-mono tracking-widest text-champagne uppercase">
                    Grooms & Guests
                  </span>
                  <h3 className="text-xl font-display text-warm-white font-medium mt-1">
                    Modern Sherwanis
                  </h3>
                  <Link
                    href="/discover?category=sherwani"
                    className="inline-flex items-center gap-1 text-xs font-mono uppercase text-champagne tracking-widest mt-2 hover:underline"
                  >
                    View Outfits <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
              <div className="relative h-[240px] lg:h-[292px] bento-cell group">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[9px] font-mono tracking-widest text-champagne uppercase">
                    Reception Elegance
                  </span>
                  <h3 className="text-xl font-display text-warm-white font-medium mt-1">
                    Cocktail Sarees
                  </h3>
                  <Link
                    href="/discover?category=saree"
                    className="inline-flex items-center gap-1 text-xs font-mono uppercase text-champagne tracking-widest mt-2 hover:underline"
                  >
                    View Outfits <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── SECTION 4: STYLE BY OCCASION ─── */}
      <motion.section {...fadeUp} className="section-pad max-w-[1440px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal leading-tight">
            Select Your Event
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            {[
              { id: 'wedding', label: 'Wedding' },
              { id: 'reception', label: 'Reception' },
              { id: 'festive', label: 'Festive' },
              { id: 'engagement', label: 'Engagement' },
            ].map((occ) => {
              const active = activeOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  onClick={() => setActiveOccasion(occ.id)}
                  className={`px-6 h-[48px] rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-bold border cursor-pointer ${
                    active
                      ? 'bg-charcoal text-ivory border-charcoal'
                      : 'bg-transparent border-border text-charcoal-light hover:border-charcoal hover:text-charcoal'
                  }`}
                >
                  {occ.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {occasionOutfits.map((item, idx) => {
              const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
              return (
                <motion.div
                  key={`${item.id}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="double-bezel">
                    <div className="double-bezel-inner">
                      <Link
                        href={`/outfit/${item.id}`}
                        className="block group"
                      >
                        <div className="h-[340px] relative overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                            <span className="px-6 h-[48px] inline-flex items-center bg-warm-white text-charcoal text-[10px] font-mono uppercase tracking-widest font-bold rounded-full">
                              Quick View
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-display text-sm font-semibold text-charcoal truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-bold font-mono">
                            <span>
                              ₹
                              {item.price_1day?.toLocaleString('en-IN')}
                              <span className="text-[9px] font-normal text-charcoal-light">
                                /day
                              </span>
                            </span>
                            {item.rating_avg && (
                              <span className="text-champagne flex items-center gap-0.5">
                                <Star size={10} className="fill-current" />{' '}
                                {item.rating_avg}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ─── SECTION 5: AI STYLIST + DESIGNERS ─── */}
      <motion.section {...fadeUp} className="section-pad bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-3xl md:text-5xl font-display font-medium text-charcoal leading-tight">
                Your Personal
                <br />
                <span className="italic text-champagne">AI Stylist</span>
              </h2>
              <p className="text-sm text-charcoal-light leading-relaxed font-light max-w-md">
                Indecisive about measurements, fabric, or color coordination? Our
                Gemini-powered assistant understands traditional couture and
                finds recommendations tailored to your aesthetic.
              </p>
              <button
                onClick={() => setAIStylistOpen(true)}
                className="btn btn-primary gap-3 px-8 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Consult AI Stylist</span>
                <span className="btn-icon-wrap">
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>

            <div className="lg:col-span-2">
              <div className="p-1.5 rounded-[2rem] bg-ivory-dark/50 ring-1 ring-border/60">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-8 space-y-8">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-champagne uppercase">
                      Featured Couturiers
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {MOCK_DESIGNERS.map((des) => (
                      <div
                        key={des.name}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-16 h-16 rounded-full ${des.bg} flex items-center justify-center text-warm-white text-sm font-display ring-1 ring-white/10`}
                        >
                          {des.logo}
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal-light text-center leading-tight">
                          {des.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── SECTION 6: RECENTLY ADDED ─── */}
      <motion.section {...fadeUp} className="section-pad max-w-[1440px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase">
              Fresh Arrivals
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-2 leading-tight">
              Recently Added
            </h2>
          </div>
          <Link
            href="/discover?sort=newest"
            className="text-xs font-mono uppercase tracking-widest text-charcoal-light hover:text-charcoal transition-colors flex items-center gap-1 flex-shrink-0"
          >
            Browse New <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map((item) => {
            const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
            return (
              <div key={item.id}>
                <div className="double-bezel">
                  <div className="double-bezel-inner relative">
                    {item.isNew && (
                      <span className="absolute top-3 left-3 z-10 bg-champagne text-warm-white text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm">
                        New
                      </span>
                    )}
                    <Link
                      href={`/outfit/${item.id}`}
                      className="block group"
                    >
                      <div className="h-[320px] relative overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                          <span className="px-6 h-[48px] inline-flex items-center bg-warm-white text-charcoal text-[10px] font-mono uppercase tracking-widest font-bold rounded-full">
                            Inspect
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] font-mono text-champagne uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="font-display text-sm font-semibold text-charcoal truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-bold font-mono text-charcoal">
                          <span>
                            ₹{item.price_1day?.toLocaleString('en-IN')}
                            <span className="text-[9px] font-normal text-charcoal-light">
                              /day
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── SECTION 7: TRUST ─── */}
      <motion.section {...fadeUp} className="section-pad max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal leading-tight">
              Redefining
              <br />
              <span className="italic text-champagne">Ownership</span>
            </h2>
            <p className="text-sm text-charcoal-light leading-relaxed font-light max-w-md">
              Kloset Luxe enables circular fashion for the modern muse. Enjoy
              premium heritage wear sustainably, with pristine professional care
              and verified authenticity.
            </p>
            <div className="space-y-6">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Authenticity Guarantee',
                  desc: 'Every designer piece is rigorously inspected by our authentication team.',
                },
                {
                  icon: Sparkles,
                  title: 'Professional Sanitization',
                  desc: 'Each rental undergoes advanced steam dry-cleaning prior to dispatch.',
                },
                {
                  icon: ArrowRight,
                  title: 'Circular Sustainability',
                  desc: 'Extending the life cycle of premium apparel while reducing environmental footprint.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-champagne/10 ring-1 ring-champagne/20 flex items-center justify-center text-champagne flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-charcoal">
                      {item.title}
                    </h3>
                    <p className="text-xs text-charcoal-light font-light mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-1.5 rounded-[2rem] bg-ivory-dark/50 ring-1 ring-border/60">
            <div className="rounded-[calc(2rem-0.375rem)] bg-white p-8 lg:p-10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-champagne/40" />
              <div className="space-y-2">
                <span className="text-[9px] font-mono tracking-widest text-champagne uppercase">
                  The Kloset Journal
                </span>
                <h3 className="font-display text-2xl font-medium text-charcoal">
                  Subscribe to the Chronicles
                </h3>
                <p className="text-xs text-charcoal-light leading-relaxed font-light">
                  Receive curated collection announcements, exclusive partner
                  closet access, and styling tips from our editorial board.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Welcome to the Kloset Journal!');
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-kloset w-full"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary w-full gap-2 cursor-pointer"
                >
                  Join the Circle
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── SECTION 8: TESTIMONIALS ─── */}
      <motion.section {...fadeUp} className="section-pad bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mb-12 leading-tight text-center">
            What Renters Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_REVIEWS.map((rev) => (
              <div key={rev.id}>
                <div className="double-bezel">
                  <div className="double-bezel-inner p-6 space-y-4">
                    <div className="flex gap-0.5 text-champagne">
                      {[...Array(rev.stars)].map((_, i) => (
                        <Star key={i} size={14} className="fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-charcoal-light leading-relaxed italic font-light">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between border-t border-border/40 pt-4 text-[10px] font-mono uppercase text-charcoal-light">
                      <span className="font-bold text-charcoal">
                        {rev.author}
                      </span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── SELLER SPOTLIGHT ─── */}
      <motion.section {...fadeUp} className="section-pad max-w-[1440px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mb-12 leading-tight">
          Seller Spotlight
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MOCK_SELLERS.map((sel) => (
            <div key={sel.id}>
              <div className="double-bezel">
                <div className="double-bezel-inner p-6 flex gap-5 items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border/40">
                    <img
                      src={sel.image}
                      alt={sel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg font-bold text-charcoal leading-tight">
                        {sel.name}
                      </h3>
                      {sel.verified && (
                        <span className="text-[8px] font-mono uppercase tracking-wider font-bold text-success flex items-center gap-0.5 bg-success/5 px-2 py-0.5 rounded-full">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-light flex items-center gap-1">
                      <MapPin size={12} className="text-champagne" />{' '}
                      {sel.location}
                    </p>
                    <div className="flex items-center gap-6 pt-2 text-[10px] font-mono uppercase tracking-wider text-charcoal-light">
                      <span>
                        Score: <strong className="text-charcoal">{sel.score}</strong>
                      </span>
                      <span>
                        Response:{' '}
                        <strong className="text-success">{sel.rate}</strong>
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/discover"
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-champagne hover:text-warm-white hover:border-champagne transition-all duration-300 text-charcoal flex-shrink-0"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── SECTION 10: FAQ ─── */}
      <motion.section {...fadeUp} className="section-pad bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mb-12 leading-tight text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'How does the rental timeline work?',
                a: 'Rentals are structured in durations of 1, 3, or 7 days. Your rental starts on your selected pick-up date and returns must be packed for return pickup on the final day.',
              },
              {
                q: 'What is the security deposit policy?',
                a: 'Every couture piece listed requires a security deposit held in platform escrow. Within 72 hours of return and quality review, funds are released back to your Kloset wallet or bank account.',
              },
              {
                q: 'Who handles dry-cleaning of outfits?',
                a: 'Kloset Luxe handles all dry-cleaning. Every outfit undergoes premium steam-sterilization and sanitization before dispatch. Renters should not wash or dry-clean outfits themselves.',
              },
              {
                q: 'What happens in case of minor damage?',
                a: 'Normal wear and tear is covered. For major stains or fabric tears, repair costs will be deducted from the security deposit.',
              },
            ].map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div
                  key={idx}
                  className="rounded-[1.5rem] bg-ivory/50 ring-1 ring-border/50 overflow-hidden transition-colors duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 flex items-center justify-between text-left font-display text-sm font-semibold text-charcoal hover:bg-ivory-dark/30 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="w-6 h-6 rounded-full bg-champagne/10 text-champagne flex items-center justify-center flex-shrink-0 ml-4 text-sm font-bold">
                      {isOpen ? '\u2212' : '+'}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0 border-t border-border/30 text-xs text-charcoal-light leading-relaxed font-light">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
