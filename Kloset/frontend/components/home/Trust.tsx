'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, RefreshCw, UserCheck, Truck, Award } from 'lucide-react';
import { fadeUp, staggerContainer, easeConfig } from './animations';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Authenticity Guarantee',
    desc: 'Every designer piece is rigorously inspected by our authentication team before listing. Buy with confidence.',
  },
  {
    icon: Sparkles,
    title: 'Professional Sanitization',
    desc: 'Each rental undergoes advanced steam dry-cleaning and sanitization prior to dispatch. Immaculate condition guaranteed.',
  },
  {
    icon: RefreshCw,
    title: 'Circular Sustainability',
    desc: 'Extending the life cycle of premium apparel while reducing environmental footprint. Fashion with purpose.',
  },
  {
    icon: UserCheck,
    title: 'Verified Seller Community',
    desc: 'Trusted network of verified sellers with transparent ratings, reviews, and secure escrow payment protection.',
  },
  {
    icon: Truck,
    title: 'Free Pickup & Delivery',
    desc: 'Complimentary doorstep delivery and return pickup across all major cities. Premium packaging included.',
  },
  {
    icon: Award,
    title: 'Quality Assurance Pledge',
    desc: 'If any piece does not meet our quality standards, we offer immediate replacement or full refund.',
  },
];

export default function Trust() {
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
              Why Kloset
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-2 leading-tight">
              Designed for Trust
            </h2>
            <p className="text-sm text-charcoal-light font-light mt-3 max-w-md mx-auto leading-relaxed">
              Every aspect of the Kloset experience is built around safety,
              quality, and peace of mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ ...easeConfig, delay: idx * 0.05 }}
                className="group relative p-6 rounded-2xl bg-warm-white border border-border/40 transition-all duration-500 hover:translate-y-[-4px] hover:shadow-xl hover:border-champagne/30"
              >
                <div className="w-11 h-11 rounded-xl bg-champagne/10 ring-1 ring-champagne/20 flex items-center justify-center text-champagne mb-4 transition-transform duration-500 group-hover:scale-110">
                  <feature.icon size={20} />
                </div>
                <h3 className="font-display text-sm font-semibold text-charcoal mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-charcoal-light leading-relaxed font-light">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
