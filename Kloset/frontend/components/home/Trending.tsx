'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { Outfit } from '@/types';
import { fadeUp, staggerContainer, easeConfig } from './animations';

interface TrendingProps {
  outfits: Partial<Outfit>[];
}

export default function Trending({ outfits }: TrendingProps) {
  if (!outfits || outfits.length === 0) return null;

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="section-pad max-w-[1440px] mx-auto px-6"
    >
      <motion.div
        variants={fadeUp}
        transition={easeConfig}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase font-semibold">
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
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {outfits.map((item, idx) => {
          const imgUrl = item.images?.[0]?.url || '/placeholder-outfit.jpg';
          return (
            <motion.div
              key={item.id}
              variants={fadeUp}
              transition={{ ...easeConfig, delay: idx * 0.05 }}
            >
              <Link href={`/outfit/${item.id}`} className="block group">
                <div className="relative h-[380px] overflow-hidden rounded-2xl bg-ivory-dark">
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {idx === 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-champagne/90 text-warm-white text-[8px] font-mono font-bold uppercase tracking-widest rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1.5">
                  <span className="text-[9px] font-mono text-champagne uppercase tracking-wider font-semibold">
                    {item.category}
                  </span>
                  <h3 className="font-display text-base font-semibold text-charcoal truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-charcoal">
                      ₹{item.price_1day?.toLocaleString('en-IN')}
                      <span className="text-[10px] font-normal text-charcoal-light"> /day</span>
                    </span>
                    {item.rating_avg && (
                      <span className="text-[10px] font-mono text-champagne font-semibold">
                        ★ {item.rating_avg}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
