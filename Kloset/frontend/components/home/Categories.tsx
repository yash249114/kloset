'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeUp, staggerContainer, easeConfig } from './animations';

const CATEGORIES = [
  {
    id: 'wedding',
    title: 'Bridal Couture',
    subtitle: 'Wedding Lehengas',
    description: 'Hand-crafted lehengas and heavy designer sets for your special day.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    href: '/discover?occasion=wedding',
    span: 'lg:col-span-2 lg:row-span-2',
    height: 'h-[320px] lg:h-full',
  },
  {
    id: 'sherwani',
    title: 'Grooms & Guests',
    subtitle: 'Modern Sherwanis',
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=85',
    href: '/discover?category=sherwani',
    span: 'lg:col-span-1 lg:row-span-1',
    height: 'h-[240px] lg:h-full',
  },
  {
    id: 'saree',
    title: 'Reception Elegance',
    subtitle: 'Cocktail Sarees',
    image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800&q=85',
    href: '/discover?category=saree',
    span: 'lg:col-span-1 lg:row-span-1',
    height: 'h-[240px] lg:h-full',
  },
  {
    id: 'festive',
    title: 'Festive Wear',
    subtitle: 'Anarkali & Sharara Sets',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
    href: '/discover?category=anarkali',
    span: 'lg:col-span-1 lg:row-span-1',
    height: 'h-[220px] lg:h-full',
  },
  {
    id: 'gown',
    title: 'Indo-Western',
    subtitle: 'Evening Gowns',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85',
    href: '/discover?category=gown',
    span: 'lg:col-span-1 lg:row-span-1',
    height: 'h-[220px] lg:h-full',
  },
];

export default function Categories() {
  return (
    <section className="section-pad bg-ivory relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />
      <div className="max-w-[1440px] mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={fadeUp} transition={easeConfig} className="mb-10">
            <span className="text-[10px] font-mono tracking-[0.22em] text-champagne uppercase font-semibold">
              Curated Collections
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-2 leading-tight">
              Discover by Category
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[300px_210px] gap-4">
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                transition={easeConfig}
                className={`group relative overflow-hidden rounded-2xl ${cat.span} ${cat.height}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
                <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <span className="text-[9px] font-mono tracking-widest text-champagne uppercase font-semibold">
                    {cat.subtitle}
                  </span>
                  <h3 className="text-xl lg:text-2xl font-display text-warm-white font-medium mt-1">
                    {cat.title}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-ivory/60 font-light mt-1 max-w-xs hidden lg:block leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-champagne tracking-widest mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                  >
                    Explore Collection <ArrowRight size={11} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
