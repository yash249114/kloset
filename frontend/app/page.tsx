'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronRight as AccordionIcon,
  UserCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  Headphones,
  Sparkles,
  Shield,
  ArrowRight,
  Search,
} from 'lucide-react';
import OutfitCard from '@/components/outfit/OutfitCard';
import { outfitsAPI } from '@/lib/api/outfits';
import { reviewsAPI } from '@/lib/api/reviews';
import type { Outfit, OutfitCategory } from '@/types';

/* ─── Mock Data ────────────────────────────── */
const trendingOutfits: Outfit[] = Array.from({ length: 8 }, (_, i) => ({
  id: `outfit-${i + 1}`,
  seller_id: `seller-${i + 1}`,
  title: ['Royal Maroon Lehenga','Golden Silk Saree','Midnight Blue Anarkali','Blush Pink Sharara','Emerald Green Gown','Ivory Sherwani Set','Coral Co-Ord Set','Dusty Rose Lehenga'][i],
  slug: `outfit-${i + 1}`,
  description: '',
  ai_description: null,
  category: ['lehenga','saree','anarkali','sharara','gown','sherwani','co_ord','lehenga'][i] as OutfitCategory,
  occasions: ['wedding','party'],
  colors: ['red','gold'],
  fabric: 'Silk',
  sizes: ['S','M','L'],
  accessories_included: [],
  city: ['Mumbai','Delhi','Bangalore','Jaipur','Hyderabad','Chennai','Mumbai','Delhi'][i],
  state: '',
  price_1day: [2500,3000,1800,2200,4000,3500,1500,2800][i],
  price_3day: null,
  price_7day: null,
  security_deposit: 5000,
  delivery_available: true,
  delivery_fee: 200,
  status: ['active', 'active', 'rented', 'active', 'active', 'active', 'active', 'rented'][i] as any,
  rating_avg: [4.9,4.6,4.8,4.5,4.7,4.9,4.4,4.8][i],
  rating_count: [48,22,59,14,31,42,19,37][i],
  view_count: 0,
  wishlist_count: 0,
  images: [{
    id: `img-${i+1}`,
    url: `https://images.unsplash.com/photo-${['1583939003579-730e3918a45a','1610030469983-398883ce42d1','1595777457583-95e059d581b8','1594463750939-ebb28c3f7a75','1566174053879-31528523f8ae','1617627143750-d86bc21e42bb','1583939003579-730e3918a45a','1610030469983-398883ce42d1'][i]}?w=400&h=500&fit=crop`,
    is_primary: true,
    sort_order: 0,
  }],
  seller: { id: `s-${i+1}`, name: ['Priya Collections','Anaya Fashion','Zara Studio','Roshni Boutique','Maya Designer','Arjun Menswear','Suhana Studio','Delhi Heritage'][i], avatar_url: null, is_verified: true, trust_score: 95 },
  is_wishlisted: false,
  created_at: new Date().toISOString(),
}));

const collectionsList = [
  {
    title: 'Bridal Lehengas',
    tag: 'lehenga',
    img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=600&fit=crop',
    desc: 'Intricate embroidery & heavy silks'
  },
  {
    title: 'Festive Sarees',
    tag: 'saree',
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=600&fit=crop',
    desc: 'Classic weaves & modern drapes'
  },
  {
    title: 'Royal Sherwanis',
    tag: 'sherwani',
    img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop',
    desc: 'Heritage cuts for groomsmen'
  },
  {
    title: 'Modern Gowns',
    tag: 'gown',
    img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=600&fit=crop',
    desc: 'Flowing silhouettes for evenings'
  }
];

const customerReviews = [
  {
    name: 'Mira Rajput',
    rating: 5,
    outfit: 'Royal Maroon Lehenga',
    comment: 'The lehenga arrived in pristine condition, smelling fresh and fitted perfectly. It felt like wearing a brand new ₹3 Lakh outfit for just a fraction of the cost!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    photo: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=150&h=200&fit=crop'
  },
  {
    name: 'Alia Bhatt',
    rating: 5,
    outfit: 'Midnight Blue Anarkali',
    comment: 'Rented this for my best friend\'s reception. Got so many compliments. Kloset has solved the "wear once and dump" problem permanently.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    photo: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=200&fit=crop'
  },
  {
    name: 'Ranveer Singh',
    rating: 5,
    outfit: 'Ivory Sherwani Set',
    comment: 'Absolutely seamless experience. Picked it up directly from the partner boutique, alterations were done on the spot. Will definitely rent again!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    photo: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=150&h=200&fit=crop'
  }
];

const faqs = [
  { q: 'How does renting work?', a: 'Browse outfits, select your dates and size, pay securely online. The outfit arrives dry-cleaned at your doorstep. After your event, schedule a pickup and we handle the return.' },
  { q: 'Is dry cleaning included?', a: 'Yes. Every outfit is professionally dry-cleaned and sanitized before delivery. The cost is included in your rental fee.' },
  { q: 'What if something gets damaged?', a: 'Minor wear is expected and covered. For significant damage, a portion of the security deposit may be retained to cover repairs. You can add damage protection during checkout.' },
  { q: 'When do I get my deposit back?', a: 'Within 48 hours of the seller confirming the outfit was returned in good condition. The refund goes directly to your original payment method.' },
  { q: 'How do I list my outfits?', a: 'Create a seller account, upload photos of your outfit, set your price and availability. We handle logistics, payments, and cleaning. You earn 95% of each rental.' },
];

const occasions = [
  { name: 'Wedding', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80' },
  { name: 'Reception', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80' },
  { name: 'Festival', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80' },
  { name: 'Party', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80' },
  { name: 'Vacation', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80' },
  { name: 'College Events', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80' },
  { name: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' }
];

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroQuery, setHeroQuery] = useState('');
  const [discoveryTab, setDiscoveryTab] = useState<'trending' | 'new' | 'most_rented' | 'recent'>('trending');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>(customerReviews);

  useEffect(() => {
    async function loadReviews() {
      try {
        const liveReviews = await reviewsAPI.listAll(3);
        if (liveReviews && liveReviews.length > 0) {
          setReviews(liveReviews);
        }
      } catch (err) {
        console.error('Failed to load live reviews:', err);
      }
    }
    loadReviews();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(heroQuery)}`);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        let data: Outfit[] = [];
        if (discoveryTab === 'trending') {
          data = await outfitsAPI.getTrending(8);
        } else if (discoveryTab === 'new') {
          const res = await outfitsAPI.browse({ sort: 'newest', per_page: 8 });
          data = res.outfits;
        } else if (discoveryTab === 'most_rented') {
          const res = await outfitsAPI.browse({ sort: 'popular', per_page: 8 });
          data = res.outfits;
        } else if (discoveryTab === 'recent') {
          const res = await outfitsAPI.browse({ sort: 'rating', per_page: 8 });
          data = res.outfits;
        }
        
        if (active) {
          if (!data || data.length === 0) {
            let mockData = trendingOutfits;
            if (discoveryTab === 'new') {
              mockData = [...trendingOutfits].reverse();
            } else if (discoveryTab === 'most_rented') {
              mockData = [...trendingOutfits].sort((a, b) => b.rating_count - a.rating_count);
            } else if (discoveryTab === 'recent') {
              mockData = [...trendingOutfits].slice(2, 8);
            }
            setOutfits(mockData);
          } else {
            setOutfits(data);
          }
        }
      } catch (err) {
        console.error('Failed to load home outfits:', err);
        if (active) {
          let mockData = trendingOutfits;
          if (discoveryTab === 'new') {
            mockData = [...trendingOutfits].reverse();
          } else if (discoveryTab === 'most_rented') {
            mockData = [...trendingOutfits].sort((a, b) => b.rating_count - a.rating_count);
          } else if (discoveryTab === 'recent') {
            mockData = [...trendingOutfits].slice(2, 8);
          }
          setOutfits(mockData);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [discoveryTab]);

  return (
    <div className="pb-24 bg-[#faf9f6] text-[#111111] select-none">
      
      {/* ─── SECTION 1: Luxury Editorial Hero Banner ─── */}
      <section className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden bg-gray-900 mt-[70px]">
        <Image
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1800&h=1000&fit=crop"
          alt="Luxury Couture Editorial"
          fill
          priority
          className="object-cover object-top opacity-85"
        />
        
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
        
        {/* Editorial Title Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-16 md:px-24 max-w-3xl text-white">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#c5a880] font-bold mb-3">
            sustainable luxury couture
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide leading-[1.1] mb-6">
            Designer wardrobes. <br />Available for rent.
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 tracking-wider font-light leading-relaxed mb-6 max-w-lg">
            Rent high-end designer lehengas, sarees, sherwanis, and luxury evening wear at 80% off retail value. Professional dry cleaning and delivery included.
          </p>

          {/* Core Search Bar Integration */}
          <form onSubmit={handleHeroSearch} className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1.5 w-full max-w-md mb-8">
            <input
              type="text"
              placeholder="Search 'Maroon lehenga', 'Sherwani', 'Saree'..."
              className="bg-transparent text-white placeholder-white/60 text-xs px-4 py-2.5 outline-none flex-1 font-light"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
            />
            <button type="submit" className="bg-white text-gray-950 hover:bg-gray-150 transition-colors px-6 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer">
              Search
            </button>
          </form>

          <div className="flex gap-4">
            <Link
              href="/discover"
              className="btn-luxury-primary px-8 cursor-pointer"
            >
              Browse Collections
            </Link>
            <Link
              href="/register?role=seller"
              className="btn-luxury-secondary !border-white !text-white hover:!bg-white hover:!text-gray-950 px-8 cursor-pointer"
            >
              Earn From Your Closet
            </Link>
          </div>
        </div>
      </section>

      {/* ─── NEW STEPPER SECTION: Understand in 5 Seconds ─── */}
      <section className="bg-white border-b border-[var(--kloset-border)] py-8 relative z-30 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 divide-y lg:divide-y-0 lg:divide-x divide-[var(--kloset-border)] text-center">
            {[
              { num: '01', title: 'Rent Outfit', desc: 'Select premium designer wear' },
              { num: '02', title: 'Choose Dates', desc: 'Book for 1, 3, or 7 days' },
              { num: '03', title: 'Pay Securely', desc: 'Secure payments via Razorpay' },
              { num: '04', title: 'Wear & Shine', desc: 'Delivered fresh and altered' },
              { num: '05', title: 'Easy Return', desc: 'Free doorstep pickup return' }
            ].map((step, i) => (
              <div key={i} className="flex-1 w-full pt-4 lg:pt-0 lg:pl-6 first:pl-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] tracking-wider text-[var(--kloset-gold)] font-bold">{step.num}</span>
                  <h4 className="font-display font-bold text-sm text-gray-900">{step.title}</h4>
                </div>
                <p className="text-[10px] text-gray-400 font-sans tracking-wide mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Curated Category Columns ─── */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-bold block mb-2">curated edits</span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-wide">Popular Categories</h2>
          <div className="h-[1px] w-12 bg-[var(--kloset-gold)] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collectionsList.map((col, idx) => (
            <Link
              key={idx}
              href={`/discover?category=${col.tag}`}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 mb-4 rounded-sm">
                <Image
                  src={col.img}
                  alt={col.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-[var(--kloset-gold)] transition-colors mb-1">
                {col.title}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">
                {col.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── NEW SECTION: Shop By Occasion ─── */}
      <section className="bg-[#fbfaf8] border-y border-[var(--kloset-border)] py-20">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-bold block mb-2">occasions edit</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-wide">Shop By Occasion</h2>
            <div className="h-[1px] w-12 bg-[var(--kloset-gold)] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {occasions.map((occ, index) => (
              <Link
                key={index}
                href={`/discover?occasion=${occ.name.toLowerCase()}`}
                className="group relative aspect-[3/4] overflow-hidden rounded bg-gray-100 cursor-pointer shadow-sm"
              >
                <img
                  src={occ.image}
                  alt={occ.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <h3 className="absolute bottom-4 left-3 right-3 text-center text-sm font-semibold text-white tracking-wide font-display z-20">
                  {occ.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: Discovery Rails with Tabs ─── */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-4 border-b border-[var(--kloset-border)]">
          <div className="space-y-3">
            <span className="text-[9px] tracking-[0.25em] uppercase text-gray-400 font-bold block mb-1">selected couture</span>
            <div className="flex flex-wrap gap-4 text-xs font-mono tracking-wider font-semibold text-gray-400">
              {[
                { id: 'trending' as const, label: 'Trending Outfits' },
                { id: 'new' as const, label: 'New Arrivals' },
                { id: 'most_rented' as const, label: 'Most Rented' },
                { id: 'recent' as const, label: 'Recently Added' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDiscoveryTab(tab.id)}
                  className={`pb-1 cursor-pointer uppercase transition-colors hover:text-gray-900 ${
                    discoveryTab === tab.id ? 'text-gray-900 border-b-2 border-[var(--kloset-gold)] font-bold' : ''
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end">
            <button 
              onClick={() => scroll('left')} 
              className="p-2 border border-gray-250 hover:bg-gray-50 rounded-full cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-700" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-2 border border-gray-250 hover:bg-gray-50 rounded-full cursor-pointer transition-colors"
            >
              <ChevronRight size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[260px] sm:w-[300px] animate-pulse space-y-3" id={`skeleton-${i}`}>
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-sm" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))
          ) : outfits.length === 0 ? (
            <div className="text-center w-full py-12 text-gray-400 font-light text-sm">
              No outfits found in this collection.
            </div>
          ) : (
            outfits.map((outfit) => (
              <div key={outfit.id} className="flex-shrink-0 w-[260px] sm:w-[300px]" id={`outfit-card-wrapper-${outfit.id}`}>
                <OutfitCard outfit={outfit} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─── NEW SECTION: Earn From Your Closet (Seller Acquisition) ─── */}
      <section className="bg-gradient-to-br from-[#FFF8F5] to-[#f5e6e8]/40 border-y border-[var(--kloset-border)] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--bloom)]/20 rounded-full blur-3xl -z-10" />
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text description */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--kloset-gold)] font-bold block">monetize wardrobe</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-gray-900 leading-tight">
                Earn From Your Closet. <br />Join as a Verified Host.
              </h2>
              <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xl">
                Have luxury garments sitting in your wardrobe? Share the joy of premium couture and build passive income. We manage logistics, sanitization, payments, and client care.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                {[
                  { title: '1. List Outfits', desc: 'Create listings & set pricing parameters' },
                  { title: '2. Confirm Bookings', desc: 'Approve requests from verified users' },
                  { title: '3. Keep 95% Income', desc: 'We ship & clean. You get paid directly' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <h4 className="font-bold text-xs text-gray-900">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-light">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link
                  href="/register?role=seller"
                  className="btn-gold !px-8 !py-4 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-md hover:opacity-90"
                >
                  List Your Wardrobe <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Premium editorial image */}
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--petal)] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                alt="Luxury closet collection"
                fill
                className="object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 6: Expanded Trust Indicators ─── */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-bold block mb-2">platform shield</span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-wide">Why Choose Kloset</h2>
          <div className="h-[1px] w-12 bg-[var(--kloset-gold)] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 text-center">
          {[
            { icon: UserCheck, title: 'Verified Sellers', desc: '100% Host identity audits' },
            { icon: CheckCircle2, title: 'Quality Checked', desc: '10-point inspection check' },
            { icon: Lock, title: 'Secure Payments', desc: 'Razorpay locked escrow' },
            { icon: RotateCcw, title: 'Easy Returns', desc: 'Free doorstep return pickup' },
            { icon: Headphones, title: 'Client Support', desc: '24/7 client care tickets' },
            { icon: Sparkles, title: 'Damage Protect', desc: 'Stain & zipper coverage' },
            { icon: Shield, title: 'Rental Insurance', desc: 'Premium shipping care plan' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center bg-white p-4 rounded-xl border border-[var(--kloset-border)] shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="w-10 h-10 rounded-full bg-[var(--bloom)]/30 text-[var(--rose)] flex items-center justify-center mb-3">
                <item.icon size={16} />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-900 block mb-1">{item.title}</span>
              <p className="text-[9px] text-gray-400 font-light leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 6.5: Premium Customer Testimonials ─── */}
      <section className="bg-white border-y border-[var(--kloset-border)] py-20 select-none">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[9px] tracking-[0.25em] uppercase text-gray-400 font-bold block mb-2">community reviews</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-wide">Loved by Renters</h2>
            <div className="h-[1px] w-12 bg-[var(--kloset-gold)] mx-auto mt-4" />
          </div>

            {reviews.map((rev, i) => {
              const reviewerName = rev.reviewer?.name || rev.name || 'Verified Client';
              const reviewerAvatar = rev.reviewer?.avatar_url || rev.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop';
              const rating = rev.rating || 5;
              const comment = rev.comment || '';
              const photo = rev.photo || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=150&h=200&fit=crop';
              const outfitName = rev.outfit?.title || rev.outfit || 'Couture Rental';
              return (
                <div key={i} className="flex gap-4 p-5 bg-[#fbfaf8] border border-[var(--kloset-border)] rounded-2xl shadow-sm transition-all hover:shadow-md">
                  
                  {/* Worn outfit photo column */}
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-150 border">
                    <img src={photo} alt={reviewerName} className="object-cover w-full h-full" />
                    <span className="absolute bottom-1 right-1 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-[var(--rose-dark)] font-bold scale-90">WEAR</span>
                  </div>

                  {/* Testimonial details */}
                  <div className="flex flex-col justify-between flex-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-0.5 text-[var(--kloset-gold)]">
                        {[...Array(rating)].map((_, starIdx) => (
                          <Star key={starIdx} size={11} fill="currentColor" />
                        ))}
                        <span className="badge badge-sage uppercase tracking-wider text-[7px] font-bold py-0.2 px-1 ml-1.5 flex items-center gap-0.5">
                          ✓ verified
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 italic leading-relaxed line-clamp-4">"{comment}"</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--kloset-border)]/50">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={reviewerAvatar} alt={reviewerName} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-900">{reviewerName}</h4>
                        <p className="text-[8px] text-gray-400 font-mono tracking-wider uppercase">Order: {outfitName}</p>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
        </div>
      </section>

      {/* ─── SECTION 7: FAQ Accordion ─── */}
      <section className="max-w-[900px] mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-[9px] tracking-[0.25em] uppercase text-gray-400 font-bold block mb-2">faq desk</span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-wide">Common Questions</h2>
        </div>
        
        <div className="divide-y divide-[var(--kloset-border)] border-t border-b border-[var(--kloset-border)]">
          {faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="py-4.5">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full text-left py-4 flex justify-between items-center gap-4 cursor-pointer font-display text-[15px] font-semibold text-gray-900 hover:text-[var(--kloset-gold)] transition-colors"
                >
                  <span>{faq.q}</span>
                  <AccordionIcon
                    size={16}
                    className={`text-gray-400 transform transition-transform duration-300 ${open ? 'rotate-90 text-[var(--kloset-gold)]' : ''}`}
                  />
                </button>
                {open && (
                  <p className="pb-5 text-[13px] text-gray-500 leading-relaxed font-light pl-1 animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
