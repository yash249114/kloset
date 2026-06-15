'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Plus,
  Minus,
  Star,
  ShieldCheck,
  Lock,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { outfitsAPI } from '@/lib/api';
import type { Outfit } from '@/types';
import { toast } from 'sonner';

// Mock Backup Data for Editorial Presentation
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
  { id: 'rev-1', author: 'Priya M.', text: 'Rented the Crimson Saree for my cousin’s wedding. The fabric was pristine, dry-cleaned beautifully, and fit perfectly. Absolutely recommend Kloset Luxe!', stars: 5, date: 'Yesterday' },
  { id: 'rev-2', author: 'Rahul V.', text: 'First time trying rental sherwanis and the experience was top notch. The fit assistance via customer support was exact, and delivery was right on time.', stars: 5, date: '3 days ago' },
  { id: 'rev-3', author: 'Sneha G.', text: 'The velvet lehenga was gorgeous. It looked completely new. Escrow deposit was returned to my wallet within 48 hours. Five stars!', stars: 5, date: '1 week ago' },
];

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };
const springSlow = { type: 'spring' as const, stiffness: 200, damping: 25 };

const sectionsTransition = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: springSlow,
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
        if (trendResp && trendResp.length > 0) {
          setTrending(trendResp);
        }
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
      (item) => item.category === (activeOccasion === 'wedding' ? 'lehenga' : activeOccasion === 'reception' ? 'saree' : activeOccasion === 'festive' ? 'anarkali' : 'sherwani')
    );
    return items.length > 0 ? items : MOCK_TRENDING.slice(0, 2);
  }, [activeOccasion]);

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-ivory text-charcoal min-h-screen pt-[72px]">
      
      {/* ────────────────── SECTION 1: HERO ────────────────── */}
      <section className="relative h-[calc(100vh-72px)] min-h-[600px] flex items-center justify-center overflow-hidden bg-charcoal">
         <motion.div 
           className="absolute inset-0 bg-cover bg-center opacity-40 filter brightness-75"
           style={{ backgroundImage: `url('https://images.unsplash.com/photo-1610030470216-5cf4b63ff8cd?auto=format&fit=crop&w=1920&q=80')`, willChange: 'transform, opacity' }}
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 0.4 }}
           transition={{ ...springSlow, duration: 1.5 }}
         />
        
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/50 to-transparent z-0" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
          }}
          className="relative max-w-7xl mx-auto px-6 text-center z-10 space-y-6"
        >
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, duration: 0.7 }}
            className="text-[11px] font-mono tracking-[0.3em] uppercase text-champagne font-extrabold"
            style={{ willChange: 'transform, opacity' }}
          >
            Luxury Heritage Wear Rentals
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springSlow, duration: 0.9 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold text-warm-white leading-none max-w-5xl mx-auto"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', willChange: 'transform, opacity' }}
          >
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...springTransition }}>
              Wear Legacy,
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, ...springTransition }}>
              Return the Rest.
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.35 }}
            className="text-sm md:text-lg text-ivory/80 font-light max-w-2xl mx-auto leading-relaxed"
            style={{ willChange: 'transform, opacity' }}
          >
            Access luxury designer wedding sets, sarees, and sherwanis for a fraction of the cost, handled with dry-cleaned precision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springTransition} className="w-full sm:w-auto">
              <Link href="/discover" className="btn btn-gold w-full sm:w-auto px-10 h-[56px]">
                Browse Couture
              </Link>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }} 
              transition={springTransition}
              onClick={() => setAIStylistOpen(true)}
              className="btn btn-outline border-warm-white text-warm-white hover:bg-warm-white hover:text-charcoal w-full sm:w-auto px-10 h-[56px]"
            >
              Consult AI Stylist
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ────────────────── SECTION 2: TRENDING RENTALS ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="text-left">
            <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Highly Coveted</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Trending Rentals</h2>
          </div>
          <motion.div whileHover={{ x: 3 }} transition={springTransition}>
            <Link href="/discover?sort=popular" className="text-xs font-mono uppercase tracking-widest text-champagne hover:text-charcoal transition-colors font-bold flex items-center gap-1">
              See All <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Rail */}
        <div className="flex gap-6 overflow-x-auto pb-6 scroll-rail snap-x">
          {trending.map((item) => {
            const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
            return (
              <motion.div 
                key={item.id} 
                className="min-w-[280px] w-[280px] snap-start bg-white border border-border rounded-lg overflow-hidden group text-left"
                whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04)' }}
                transition={springTransition}
              >
                <div className="h-[380px] relative overflow-hidden bg-ivory-dark">
                  <motion.div whileHover={{ scale: 1.05 }} transition={springTransition} className="w-full h-full">
                    <Image src={imgUrl} alt={item.title} width={600} height={380} className="w-full h-full object-cover" unoptimized />
                  </motion.div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition}>
                      <Link href={`/outfit/${item.id}`} className="btn btn-gold !h-[52px] px-6 text-[10px] font-mono tracking-widest uppercase">
                        Quick View
                      </Link>
                    </motion.div>
                  </div>

                  {item.rating_avg && (
                    <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm border border-border/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-gold text-gold" /> {item.rating_avg}
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-1">
                  <span className="text-[9px] font-mono text-champagne uppercase font-bold tracking-wider">{item.category}</span>
                  <h4 className="font-display text-sm font-semibold truncate text-charcoal">{item.title}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                    <span className="price text-xs font-bold text-charcoal">
                      ₹{item.price_1day?.toLocaleString('en-IN')}<span className="text-[9px] font-normal text-charcoal-light">/day</span>
                    </span>
                    <span className="text-[9px] font-mono text-charcoal-light">Dep: ₹{item.security_deposit}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ────────────────── SECTION 3: COLLECTIONS ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="mb-12">
            <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Curated Ensembles</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Heritage Collections</h2>
          </div>

          {/* Asymmetric 3-col Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1 Large Left */}
            <motion.div 
              className="lg:col-span-7 relative h-[500px] rounded-lg overflow-hidden group bg-charcoal"
              whileHover={{ y: -4 }}
              transition={springTransition}
            >
              <motion.div 
                className="absolute inset-0 bg-cover bg-center opacity-65"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80')` }}
                whileHover={{ scale: 1.03 }}
                transition={springTransition}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-left space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-champagne uppercase font-bold">Bridal Couture</span>
                <h3 className="text-3xl font-display text-warm-white font-medium">The Wedding Atelier</h3>
                <p className="text-xs text-ivory/70 font-light max-w-sm">Rethink wedding style. Rented luxury hand-crafted lehengas and heavy designer sets.</p>
                <Link href="/discover?occasion=wedding" className="inline-flex items-center gap-2 text-xs font-mono uppercase text-champagne font-bold tracking-widest pt-2 hover:underline">
                  Explore Collection <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>

            {/* 2 Stacked Right */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Stack 1 */}
              <motion.div 
                className="h-[238px] relative rounded-lg overflow-hidden group bg-charcoal"
                whileHover={{ y: -4 }}
                transition={springTransition}
              >
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80')` }}
                  whileHover={{ scale: 1.03 }}
                  transition={springTransition}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-left space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-champagne uppercase font-bold">Grooms & Guests</span>
                  <h3 className="text-xl font-display text-warm-white font-medium">Modern Sherwanis</h3>
                  <Link href="/discover?category=sherwani" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-champagne font-bold tracking-widest pt-1 hover:underline">
                    View Outfits <ArrowRight size={10} />
                  </Link>
                </div>
              </motion.div>

              {/* Stack 2 */}
              <motion.div 
                className="h-[238px] relative rounded-lg overflow-hidden group bg-charcoal"
                whileHover={{ y: -4 }}
                transition={springTransition}
              >
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800&q=80')` }}
                  whileHover={{ scale: 1.03 }}
                  transition={springTransition}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-left space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-champagne uppercase font-bold">Reception Elegance</span>
                  <h3 className="text-xl font-display text-warm-white font-medium">Cocktail Sarees</h3>
                  <Link href="/discover?category=saree" className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-champagne font-bold tracking-widest pt-1 hover:underline">
                    View Outfits <ArrowRight size={10} />
                  </Link>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </motion.section>

      {/* ────────────────── SECTION 4: OCCASIONS ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 space-y-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Style By Occasion</span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Select Your Event</h2>
          
          {/* Animated Pill Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            {[
              { id: 'wedding', label: 'Wedding Ceremonies' },
              { id: 'reception', label: 'Reception & Soiree' },
              { id: 'festive', label: 'Festive Gatherings' },
              { id: 'engagement', label: 'Engagement Gala' },
            ].map((occ) => {
              const active = activeOccasion === occ.id;
              return (
                <motion.button
                  key={occ.id}
                  onClick={() => setActiveOccasion(occ.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springTransition}
                  className={`
                    px-6 h-[52px] rounded-full text-xs font-mono uppercase tracking-wider transition-colors duration-300 font-bold border cursor-pointer
                    ${active 
                      ? 'bg-charcoal text-ivory border-charcoal' 
                      : 'bg-white border-border text-charcoal-light hover:border-charcoal hover:text-charcoal'
                    }
                  `}
                >
                  {occ.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Outfit Grid Below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  whileHover={{ y: -6 }}
                  transition={springTransition}
                  className="bg-white border border-border rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-md text-left"
                >
                  <div className="h-[340px] relative overflow-hidden bg-ivory-dark">
                    <motion.div whileHover={{ scale: 1.05 }} transition={springTransition} className="w-full h-full">
                      <Image src={imgUrl} alt={item.title} width={600} height={340} className="w-full h-full object-cover" unoptimized />
                    </motion.div>
                    
                    {/* Hover Link */}
                    <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition}>
                        <Link href={`/outfit/${item.id}`} className="btn btn-gold !h-[52px] px-6 text-[10px] font-mono tracking-widest uppercase">
                          Book Outfit
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-display text-sm font-semibold truncate text-charcoal">{item.title}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2 text-xs font-bold font-mono">
                      <span>₹{item.price_1day?.toLocaleString('en-IN')}<span className="text-[9px] font-normal text-charcoal-light">/day</span></span>
                      <span className="text-champagne flex items-center gap-0.5"><Star size={10} className="fill-current" /> {item.rating_avg}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ────────────────── SECTION 5: AI STYLIST TEASER ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image side */}
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-charcoal shadow-sm">
              <div className="absolute inset-0 bg-cover bg-center opacity-70"
                   style={{ backgroundImage: `url('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80')` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 p-6 bg-white/15 backdrop-blur-md border border-white/20 rounded text-left text-warm-white">
                <span className="text-[9px] font-mono uppercase text-champagne tracking-widest font-bold">Powered by Gemini Pro</span>
                <h4 className="font-display text-lg mt-1 font-semibold">Instant Fit Consultation</h4>
                <p className="text-[10px] text-ivory/80 max-w-xs mt-1">Get instant styling advice, cancellation checks, and curation filters mapped by AI.</p>
              </div>
            </div>

            {/* Content side */}
            <div className="text-left space-y-6 lg:pl-6">
              <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Next Gen Fitting</span>
              <h2 className="text-3xl md:text-5xl font-display font-medium text-charcoal leading-tight">Your Personal AI Couture Stylist</h2>
              <p className="text-sm text-charcoal-light leading-relaxed font-light">
                Indecisive about measurements, fabric, or color coordination? Our Gemini-powered AI assistant understands traditional couture. Describe the wedding aesthetic, and find recommendations.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springTransition}
                onClick={() => setAIStylistOpen(true)}
                className="btn btn-gold px-8 flex items-center gap-2 cursor-pointer text-xs font-mono uppercase"
              >
                <Sparkles size={16} /> Open AI Stylist Assistant
              </motion.button>
            </div>

          </div>
        </div>
      </motion.section>

      {/* ────────────────── SECTION 6: TOP DESIGNERS ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 space-y-1">
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Aesthetic Benchmarks</span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Featured Couturiers</h2>
        </div>

        {/* Circular Avatars Rail */}
        <div className="flex justify-between items-center overflow-x-auto pb-4 gap-6 scroll-rail">
          {MOCK_DESIGNERS.map((des) => (
            <div key={des.name} className="flex flex-col items-center gap-3 min-w-[120px]">
              <motion.div 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={springTransition}
                className={`w-24 h-24 rounded-full ${des.bg} flex items-center justify-center text-warm-white text-xl font-display shadow-sm border border-border/10 cursor-pointer`}
              >
                {des.logo}
              </motion.div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-charcoal-light">{des.name}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ────────────────── SECTION 7: SELLER SPOTLIGHT ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left mb-12">
            <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Trusted Closets</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Seller Spotlight</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {MOCK_SELLERS.map((sel) => (
              <motion.div 
                key={sel.id} 
                className="p-6 border border-border rounded-xl flex gap-6 bg-ivory/20 items-center"
                whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.03)' }}
                transition={springTransition}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-ivory-dark border border-border">
                  <Image src={sel.image} alt={sel.name} width={64} height={64} unoptimized className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-lg font-bold text-charcoal leading-tight">{sel.name}</h4>
                    {sel.verified && (
                      <span className="badge badge-sage text-[8px] flex items-center gap-0.5 font-bold uppercase py-0.5"><ShieldCheck size={10} /> Verified Seller</span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-light flex items-center gap-1">
                    <MapPin size={12} className="text-champagne" /> {sel.location}
                  </p>
                  <div className="flex items-center gap-6 pt-3 mt-2 border-t border-border/40 text-[10px] font-mono uppercase tracking-wider text-charcoal-light">
                    <span>Trust Score: <strong className="text-charcoal">{sel.score}</strong></span>
                    <span>Response: <strong className="text-success">{sel.rate}</strong></span>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={springTransition}>
                  <Link href="/discover" className="w-[52px] h-[52px] border border-border rounded-full flex items-center justify-center hover:bg-champagne hover:text-white transition-colors cursor-pointer text-charcoal">
                    <ChevronRight size={18} />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ────────────────── SECTION 8: RECENTLY ADDED ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="text-left">
            <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Fresh Releases</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Recently Added</h2>
          </div>
          <motion.div whileHover={{ x: 3 }} transition={springTransition}>
            <Link href="/discover?sort=newest" className="text-xs font-mono uppercase tracking-widest text-champagne hover:text-charcoal transition-colors font-bold flex items-center gap-1">
              Browse New <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* 4-col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((item) => {
            const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
            const showNew = item.isNew;

            return (
              <motion.div 
                key={item.id} 
                className="bg-white border border-border rounded-lg overflow-hidden group text-left relative"
                whileHover={{ y: -6, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)' }}
                transition={springTransition}
              >
                
                {/* New Badge */}
                {showNew && (
                  <span className="absolute top-3 left-3 bg-rose-gold text-white text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow z-10">
                    New
                  </span>
                )}

                <div className="h-[320px] relative overflow-hidden bg-ivory-dark">
                  <motion.div whileHover={{ scale: 1.05 }} transition={springTransition} className="w-full h-full">
                    <Image src={imgUrl} alt={item.title} width={600} height={320} className="w-full h-full object-cover" unoptimized />
                  </motion.div>
                  
                  {/* Hover view link */}
                  <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition}>
                      <Link href={`/outfit/${item.id}`} className="btn btn-gold !h-[52px] px-6 text-[10px] font-mono tracking-widest uppercase">
                        Inspect
                      </Link>
                    </motion.div>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[9px] font-mono text-champagne uppercase font-bold tracking-wider">{item.category}</span>
                  <h4 className="font-display text-sm font-semibold truncate text-charcoal">{item.title}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2 text-xs font-bold font-mono text-charcoal">
                    <span>₹{item.price_1day?.toLocaleString('en-IN')}<span className="text-[9px] font-normal text-charcoal-light">/day</span></span>
                    <span className="text-[9px] font-normal text-charcoal-light">Dep: ₹{item.security_deposit}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ────────────────── SECTION 9: FOR YOU (AUTH-GATED) ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left mb-12">
            <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Personalized Picks</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">Recommended For You</h2>
          </div>

          {isAuthenticated ? (
            // Authenticated Grid view
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((item, idx) => {
                const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
                return (
                  <motion.div 
                    key={`rec-${item.id}-${idx}`} 
                    className="bg-white border border-border rounded-lg overflow-hidden group text-left"
                    whileHover={{ y: -6, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)' }}
                    transition={springTransition}
                  >
                    <div className="h-[280px] relative overflow-hidden bg-ivory-dark">
                      <motion.div whileHover={{ scale: 1.05 }} transition={springTransition} className="w-full h-full">
                        <Image src={imgUrl} alt={item.title} width={600} height={280} className="w-full h-full object-cover" unoptimized />
                      </motion.div>
                      <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={springTransition}>
                          <Link href={`/outfit/${item.id}`} className="btn btn-gold !h-[52px] px-6 text-[10px] font-mono tracking-widest uppercase">
                            Inspect
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="font-display text-sm font-semibold truncate text-charcoal">{item.title}</h4>
                      <p className="text-[10px] text-charcoal-light">Curated based on search history</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Auth-gated Locked Screen
            <div className="p-12 border border-border rounded-2xl bg-ivory/30 text-center space-y-4 max-w-xl mx-auto relative overflow-hidden shadow-sm">
              <div className="absolute top-0 inset-x-0 h-1 bg-champagne" />
              <div className="w-14 h-14 bg-champagne/10 text-champagne border border-champagne/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Lock size={20} />
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal">Unlock Personalized Couture Recommendations</h3>
              <p className="text-xs text-charcoal-light leading-relaxed max-w-sm mx-auto font-light">
                Sign in to create your fashion profile and unlock recommendations customized for your city, events, and measurements.
              </p>
              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springTransition}>
                  <Link href="/auth/login?redirect=/" className="btn btn-primary px-8 text-xs font-mono uppercase">
                    Login & Unlock
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ────────────────── SECTION 10: REVIEWS ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 space-y-1">
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Customer Journals</span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Renter Testimonials</h2>
        </div>

        {/* Horizontal Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {MOCK_REVIEWS.map((rev) => (
            <motion.div 
              key={rev.id} 
              className="p-6 bg-white border border-border rounded-lg space-y-4 relative flex flex-col justify-between"
              whileHover={{ y: -6, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.02)' }}
              transition={springTransition}
            >
              <div className="space-y-3">
                <div className="flex gap-0.5 text-gold">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-xs text-charcoal-light leading-relaxed italic font-light">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 text-[10px] font-mono uppercase text-charcoal-light">
                <span className="font-bold text-charcoal">{rev.author}</span>
                <span>{rev.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ────────────────── SECTION 11: FAQ ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-left">
          <div className="text-center mb-12 space-y-1">
            <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Assistance</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Frequently Asked Questions</h2>
          </div>

          {/* Accordion Layout */}
          <div className="space-y-4">
            {[
              { q: 'How does the rental timeline work?', a: 'Rentals are structured in durations of 1, 3, or 7 days. Your rental starts on your selected pick-up date and returns must be packed and ready for return pickup on the final day.' },
              { q: 'What is the security deposit policy?', a: 'Every couture piece listed requires a security deposit. This deposit is securely held in platform escrow during the rental. Within 72 hours of return and quality review, the funds are released back to your Kloset wallet or bank account.' },
              { q: 'Who handles the dry-cleaning of outfits?', a: 'Kloset Luxe handles all dry-cleaning! Every outfit undergoes premium steam-sterilization and sanitization before dispatch. Renters should not wash or dry-clean outfits themselves.' },
              { q: 'What happens in case of minor damage or stains?', a: 'Normal wear and tear (such as loose threads or tiny removable stains) is covered by our damage policies. For major stains, fabric tears, or permanent burns, repair costs will be deducted from the security deposit.' },
            ].map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="border border-border rounded-lg overflow-hidden bg-ivory/10 transition-colors duration-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 flex items-center justify-between text-left font-display text-sm font-semibold text-charcoal hover:bg-ivory-dark/30 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-champagne font-mono text-base font-bold flex-shrink-0 ml-4">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false} mode="popLayout">
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springTransition}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-border/30 text-xs text-charcoal-light leading-relaxed font-light">
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

      {/* ────────────────── SECTION 12: TRUST ATELIER & JOURNAL ────────────────── */}
      <motion.section {...sectionsTransition} className="py-24 max-w-7xl mx-auto px-6 border-t border-border/40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Brand Story / Trust Factors */}
          <div className="text-left space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">Circular Luxury</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal">Redefining Ownership</h2>
              <p className="text-sm text-charcoal-light leading-relaxed font-light animate-fade-in">
                Kloset Luxe enables circular fashion for the modern muse. Enjoy premium heritage wear sustainably, with pristine professional care and verified authenticity.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: '100% Authenticity Guarantee', desc: 'Every designer masterwork is rigorously inspected by our authentication team.' },
                { icon: Sparkles, title: 'Professional Sanitization', desc: 'Each rental undergoes advanced steam dry-cleaning and packaging prior to dispatch.' },
                { icon: ArrowRight, title: 'Circular Sustainability', desc: 'Extending the life cycle of premium apparel while reducing environmental footprint.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded bg-champagne/10 border border-champagne/20 flex items-center justify-center text-champagne flex-shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-semibold text-charcoal">{item.title}</h4>
                    <p className="text-xs text-charcoal-light font-light mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimal Editorial Newsletter Subscription */}
          <div className="p-10 border border-border bg-white rounded-xl shadow-sm space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-champagne" />
            <div className="space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-champagne uppercase font-bold block">The Kloset Journal</span>
              <h3 className="font-display text-2xl font-medium text-charcoal">Subscribe to the Chronicles</h3>
              <p className="text-xs text-charcoal-light leading-relaxed font-light">
                Receive curated collection announcements, exclusive partner closet access, and styling tips from our editorial board.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); toast.success('Welcome to the Kloset Journal!'); }} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="input-kloset w-full"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springTransition}
                type="submit"
                className="btn btn-primary w-full"
              >
                Join the Circle
              </motion.button>
            </form>
          </div>

        </div>
      </motion.section>

      {/* FOOTER IS INTEGRATED GLOBALLY VIA APPSHELL. GLOBALS CONTAINER CONTEXT HANDLED. */}
    </div>
  );
}
