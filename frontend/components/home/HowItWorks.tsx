'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import { fadeUp, staggerContainer, easeConfig } from './animations';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Browse & Select',
    description: 'Explore our curated collection of designer couture. Filter by occasion, size, or aesthetic to find your perfect look.',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Rent with Ease',
    description: 'Choose your rental duration — 1, 3, or 7 days. Secure checkout with escrow-protected deposits for peace of mind.',
  },
  {
    number: '03',
    icon: RefreshCw,
    title: 'Wear & Return',
    description: 'Enjoy your outfit, then return it in the prepaid packaging. We handle dry-cleaning and sanitization.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-pad bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />
      <div className="max-w-[1440px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div variants={fadeUp} transition={easeConfig} className="text-center mb-16">
            <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase font-semibold">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-2 leading-tight">
              How It Works
            </h2>
            <p className="text-sm text-charcoal-light font-light mt-3 max-w-md mx-auto leading-relaxed">
              Three simple steps to wear luxury. From browse to return, we handle everything.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 max-w-5xl mx-auto relative">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                transition={{ ...easeConfig, delay: idx * 0.12 }}
                className="text-center group relative"
              >
                <div className="w-20 h-20 rounded-2xl bg-champagne/10 ring-1 ring-champagne/20 flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:translate-y-[-6px] group-hover:shadow-lg group-hover:shadow-champagne/10">
                  <step.icon size={28} className="text-champagne" />
                </div>
                <div className="w-10 h-10 rounded-full bg-champagne/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[11px] font-mono tracking-widest text-champagne font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-charcoal mb-3">
                  {step.title}
                </h3>
                <p className="text-xs text-charcoal-light leading-relaxed font-light max-w-xs mx-auto">
                  {step.description}
                </p>
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[calc(80%)] h-px bg-gradient-to-r from-champagne/30 via-champagne/10 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
