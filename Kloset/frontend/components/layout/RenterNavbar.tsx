'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { KlosetMonogram, KlosetWordmark } from '@/components/brand/KlosetLogo';
import MobileNavDrawer from '@/components/layout/MobileNavDrawer';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function RenterNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.cartItems);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [, setAIStylistOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] bg-warm-white/90 backdrop-blur-lg border-b border-border/50 z-[100] select-none">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">

        {/* Brand Logo — Wordmark with gold monogram accent */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springTransition}>
          <Link href="/" className="flex items-center gap-3 group">
            <KlosetMonogram size={28} className="text-champagne flex-shrink-0" />
            <KlosetWordmark className="h-4 w-auto text-charcoal hidden sm:block" />
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest font-medium text-charcoal-light">
          <Link href="/discover" className="hover:text-charcoal transition-colors py-2">
            Categories
          </Link>
          <button
            onClick={() => setAIStylistOpen(true)}
            className="hover:text-charcoal transition-colors py-2 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} className="text-champagne" />
            AI Stylist
          </button>
          <Link href="/support" className="hover:text-charcoal transition-colors py-2">
            Support
          </Link>
          <Link href="/contact" className="hover:text-charcoal transition-colors py-2">
            Contact
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">

          {/* Mobile menu icon */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-charcoal-light hover:text-charcoal cursor-pointer"
          >
            <Menu size={18} />
          </button>

          {/* Cart */}
          <motion.button
            onClick={() => setCartOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
            className="w-10 h-10 flex items-center justify-center relative cursor-pointer text-charcoal-light hover:text-charcoal"
          >
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-champagne text-warm-white text-[7px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </motion.button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="w-10 h-10 flex items-center justify-center text-charcoal-light hover:text-charcoal transition-colors"
              >
                <User size={17} />
              </Link>
              {user?.role === 'seller' && (
                <Link
                  href="/seller"
                  className="w-10 h-10 flex items-center justify-center text-charcoal-light hover:text-charcoal transition-colors"
                >
                  <LayoutDashboard size={17} />
                </Link>
              )}
              <button
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center text-charcoal-light hover:text-error transition-colors cursor-pointer"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="btn btn-primary !h-9 !px-5 text-[9px] font-mono tracking-widest uppercase font-bold cursor-pointer"
            >
              Sign In
            </Link>
          )}

        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  );
}
