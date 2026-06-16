'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { outfitsAPI } from '@/lib/api';
import type { Outfit } from '@/types';

import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import HowItWorks from '@/components/home/HowItWorks';
import Trending from '@/components/home/Trending';
import Reviews from '@/components/home/Reviews';
import Trust from '@/components/home/Trust';
import SellerCTA from '@/components/home/SellerCTA';

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

const MOCK_REVIEWS = [
  { id: 'rev-1', author: 'Priya M.', text: 'Rented the Crimson Saree for my cousin\u2019s wedding. The fabric was pristine, dry-cleaned beautifully, and fit perfectly.', stars: 5, date: 'Yesterday' },
  { id: 'rev-2', author: 'Rahul V.', text: 'First time trying rental sherwanis and the experience was top notch. Fit assistance via customer support was exact, delivery was right on time.', stars: 5, date: '3 days ago' },
  { id: 'rev-3', author: 'Sneha G.', text: 'The velvet lehenga was gorgeous. It looked completely new. Escrow deposit returned within 48 hours.', stars: 5, date: '1 week ago' },
];

export default function Homepage() {
  const { isAuthenticated } = useAuthStore();

  const [trending, setTrending] = useState<Partial<Outfit>[]>(MOCK_TRENDING);

  useEffect(() => {
    async function loadData() {
      try {
        const trendResp = await outfitsAPI.getTrending(4);
        if (trendResp && trendResp.length > 0) setTrending(trendResp);
      } catch (err) {
        console.warn('Could not load trending outfits, using fallbacks.', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-ivory text-charcoal min-h-screen pt-[72px]">
      <div className="grain-overlay" />

      <Hero />

      <Categories />

      <HowItWorks />

      <Trending outfits={trending} />

      <Reviews reviews={MOCK_REVIEWS} />

      <Trust />

      <SellerCTA />
    </div>
  );
}
