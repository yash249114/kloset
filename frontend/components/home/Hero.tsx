'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { fadeUp, staggerContainer, slideUp, easeConfig } from './animations';

export default function Hero() {
  const setAIStylistOpen = useUIStore((s) => s.setAIStylistOpen);

  return (
    <section className="relative min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-charcoal">
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1610030470216-5cf4b63ff8cd?auto=format&fit=crop&w=1800&q=85')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent lg:hidden" />

      <div className="flex flex-col justify-center px-6 lg:px-16 py-24 lg:py-0 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <motion.span
            variants={slideUp}
            transition={easeConfig}
            className="inline-block text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-semibold mb-6"
          >
            Luxury Fashion Rental
          </motion.span>

          <motion.h1
            variants={fadeUp}
            transition={{ ...easeConfig, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-warm-white leading-[1.02] tracking-tight"
          >
            Wear Legacy,
            <br />
            <span className="italic text-champagne">Return the Rest.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ ...easeConfig, delay: 0.2 }}
            className="mt-6 text-sm md:text-base text-ivory/60 leading-relaxed font-light max-w-md"
          >
            Access luxury designer wedding sets, sarees, and sherwanis for a
            fraction of the cost, with dry-cleaned precision.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ ...easeConfig, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/discover"
              className="btn btn-gold px-10 h-[56px] text-sm cursor-pointer"
            >
              Browse Couture <ArrowRight size={15} className="ml-1" />
            </Link>
            <button
              onClick={() => setAIStylistOpen(true)}
              className="btn px-8 h-[56px] text-sm gap-2 border border-warm-white/20 text-warm-white hover:bg-warm-white/10 cursor-pointer"
            >
              <Sparkles size={16} />
              AI Stylist
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
