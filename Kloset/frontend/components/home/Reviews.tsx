'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { fadeUp, staggerContainer, easeConfig } from './animations';

interface Review {
  id: string;
  author: string;
  text: string;
  stars: number;
  date: string;
}

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="section-pad bg-ivory relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />
      <div className="max-w-[1440px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div variants={fadeUp} transition={easeConfig} className="text-center mb-14">
            <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase font-semibold">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-2 leading-tight">
              What Our Renters Say
            </h2>
            <p className="text-sm text-charcoal-light font-light mt-3 max-w-md mx-auto leading-relaxed">
              Real experiences from our community of fashion enthusiasts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.map((rev, idx) => (
              <motion.div
                key={rev.id}
                variants={fadeUp}
                transition={{ ...easeConfig, delay: idx * 0.12 }}
                className="bg-white rounded-2xl p-6 border border-border/40 transition-all duration-500 hover:translate-y-[-4px] hover:shadow-xl hover:border-champagne/20"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-champagne text-champagne"
                    />
                  ))}
                </div>
                <p className="text-sm text-charcoal-light leading-relaxed font-light italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
                  <span className="text-xs font-semibold text-charcoal font-mono">
                    {rev.author}
                  </span>
                  <span className="text-[10px] font-mono text-charcoal-light">
                    {rev.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
