'use client';

import { useState, useEffect } from 'react';
import { outfitsAPI } from '@/lib/api';
import type { Outfit } from '@/types';

import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import HowItWorks from '@/components/home/HowItWorks';
import Trending from '@/components/home/Trending';
import Reviews from '@/components/home/Reviews';
import Trust from '@/components/home/Trust';
import SellerCTA from '@/components/home/SellerCTA';
import { TrendingSkeleton } from '@/components/home/loading';

export default function Homepage() {
  const [trending, setTrending] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const trendResp = await outfitsAPI.getTrending(4);
        setTrending(trendResp || []);
      } catch (err) {
        console.warn('Could not load trending outfits.', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-ivory text-charcoal min-h-screen pt-[64px]">
      <div className="grain-overlay" />

      <Hero />

      <Categories />

      <HowItWorks />

      {loading ? <TrendingSkeleton /> : <Trending outfits={trending} />}

      <Reviews reviews={[]} />

      <Trust />

      <SellerCTA />
    </div>
  );
}
