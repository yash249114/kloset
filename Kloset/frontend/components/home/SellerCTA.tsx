'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';
import { fadeUp, easeConfig } from './animations';

export default function SellerCTA() {
  return (
    <section className="section-pad bg-charcoal relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, #C9A96E 0%, transparent 45%), radial-gradient(circle at 80% 70%, #C9A96E 0%, transparent 40%)`,
        }}
      />
      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 },
            },
          }}
        >
          <motion.div
            variants={fadeUp}
            transition={easeConfig}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <div className="space-y-6">
              <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase font-semibold">
                Seller Program
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-medium text-warm-white leading-tight">
                Turn Your Closet Into a{' '}
                <span className="italic text-champagne">Couture Boutique</span>
              </h2>
              <p className="text-sm md:text-base text-ivory/60 leading-relaxed font-light max-w-md">
                List your designer pieces on Kloset and earn passive income from
                your wardrobe. We handle logistics, dry-cleaning, customer
                verification, and escrow payments.
              </p>

              <div className="flex flex-col gap-4 pt-4">
                {[
                  { icon: DollarSign, text: 'Set your own rental pricing' },
                  { icon: ShieldCheck, text: 'Escrow-protected payments' },
                  { icon: TrendingUp, text: 'Access to 10,000+ fashion-conscious renters' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-champagne/10 flex items-center justify-center text-champagne flex-shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm text-ivory/70 font-light">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/seller/register"
                  className="btn btn-gold px-10 h-[52px] text-xs inline-flex items-center gap-3 cursor-pointer"
                >
                  Start Selling <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=85"
                  alt="Seller"
                  fill
                  sizes="(max-width: 1024px) 0vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
