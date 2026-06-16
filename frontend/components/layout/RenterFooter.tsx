'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { KlosetMonogram, KlosetWordmark } from '@/components/brand/KlosetLogo';

export default function RenterFooter() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to KLOSET newsletters.');
    setEmail('');
  };

  return (
    <footer className="bg-charcoal text-ivory border-t border-charcoal-mid/50 pt-16 pb-10 font-sans select-none">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <KlosetMonogram size={28} className="text-champagne flex-shrink-0" />
              <KlosetWordmark className="h-4 w-auto text-warm-white" />
            </Link>
            <p className="text-xs text-charcoal-light leading-relaxed font-light max-w-xs">
              India&apos;s premier luxury fashion rental marketplace.
              Wear legacy, return the rest.
            </p>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-champagne">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Wedding Lehengas', href: '/discover?category=lehenga' },
                { label: 'Designer Sarees', href: '/discover?category=saree' },
                { label: 'Sherwanis', href: '/discover?category=sherwani' },
                { label: 'Evening Gowns', href: '/discover?category=gown' },
                { label: 'Anarkali Sets', href: '/discover?category=anarkali' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-charcoal-light hover:text-ivory transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-champagne">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'How It Works', href: '/' },
                { label: 'AI Stylist', href: '/renter/ai-stylist' },
                { label: 'Browse All', href: '/discover' },
                { label: 'Sell on Kloset', href: '/seller/register' },
                { label: 'Support', href: '/support' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-charcoal-light hover:text-ivory transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-champagne">
              Policies
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', href: '/support' },
                { label: 'Terms of Service', href: '/support' },
                { label: 'Return Policy', href: '/support' },
                { label: 'Shipping Info', href: '/support' },
                { label: 'Escrow Guidelines', href: '/support' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-charcoal-light hover:text-ivory transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-champagne">
              Newsletter
            </h4>
            <p className="text-xs text-charcoal-light leading-relaxed font-light">
              Receive exclusive updates, designer drops, and style guides directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[48px] px-4 text-xs font-sans bg-charcoal-mid/50 border border-charcoal-light/30 rounded-lg text-white placeholder-charcoal-light/50 outline-none focus:border-champagne transition-colors"
              />
              <button
                type="submit"
                className="w-full h-[48px] rounded-lg bg-champagne/10 border border-champagne/20 text-champagne text-[10px] font-mono tracking-widest uppercase font-semibold hover:bg-champagne/20 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-charcoal-mid/30 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono text-charcoal-light">
            &copy; {new Date().getFullYear()} Kloset Inc. All rights reserved.
          </span>
          <div className="flex gap-6 text-[9px] font-mono uppercase tracking-wider text-charcoal-light">
            <Link href="/support" className="hover:text-ivory transition-colors">
              Privacy
            </Link>
            <Link href="/support" className="hover:text-ivory transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-ivory transition-colors">
              Cookies
            </Link>
            <Link href="/support" className="hover:text-ivory transition-colors">
              Escrow
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
