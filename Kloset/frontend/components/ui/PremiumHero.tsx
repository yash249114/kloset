'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export interface PremiumHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; onClick: () => void };
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function PremiumHero({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  overlay = true,
  className = '',
}: PremiumHeroProps) {
  return (
    <section className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden ${className}`}>
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      )}
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/50 to-transparent z-0" />
      )}

      <div className="relative max-w-7xl mx-auto px-6 text-center z-10 space-y-8">
        {subtitle && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...springTransition }}
            className="inline-block text-[11px] font-mono tracking-[0.3em] uppercase text-champagne font-extrabold"
          >
            {subtitle}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springTransition }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold text-warm-white leading-none max-w-5xl mx-auto"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
        >
          {title.split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...springTransition }}
            className="text-sm md:text-lg text-ivory/80 font-light max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}

        {(primaryCTA || secondaryCTA) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...springTransition }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {primaryCTA && (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springTransition} className="w-full sm:w-auto">
                <Link href={primaryCTA.href} className="btn btn-gold w-full sm:w-auto px-10 h-[56px]">
                  {primaryCTA.label}
                </Link>
              </motion.div>
            )}
            {secondaryCTA && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springTransition}
                onClick={secondaryCTA.onClick}
                className="btn btn-outline border-warm-white text-warm-white hover:bg-warm-white hover:text-charcoal w-full sm:w-auto px-10 h-[56px]"
              >
                {secondaryCTA.label}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}