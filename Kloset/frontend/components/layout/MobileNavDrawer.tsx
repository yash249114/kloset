'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Heart,
  ShoppingBag,
  Calendar,
  RotateCcw,
  User,
  MessageSquare,
  Phone,
  LogOut,
  LayoutDashboard,
  History,
} from 'lucide-react';
import { KlosetMonogram, KlosetWordmark } from '@/components/brand/KlosetLogo';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { Z_INDEX } from '@/lib/constants';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Categories', href: '/discover', icon: ShoppingBag },
];

const ACCOUNT_ITEMS = [
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'My Bookings', href: '/orders', icon: Calendar },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Returns', href: '/renter/returns', icon: RotateCcw },
  { label: 'AI Stylist History', href: '/renter/ai-stylist', icon: History },
  { label: 'Support', href: '/support', icon: MessageSquare },
];

export default function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const setAIStylistOpen = useUIStore((s) => s.setAIStylistOpen);
  const cartItems = useCartStore((s) => s.cartItems);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAIClick = () => {
    onClose();
    setTimeout(() => setAIStylistOpen(true), 200);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '?');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 md:hidden" style={{ zIndex: Z_INDEX.DRAWER }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[4px]"
          />

          {/* Drawer body - slides from left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={springTransition}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-ivory border-r border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border bg-white flex-shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <KlosetMonogram size={22} className="text-champagne flex-shrink-0" />
                <KlosetWordmark className="h-3.5 w-auto text-charcoal" />
              </Link>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center border border-border hover:bg-ivory-dark rounded cursor-pointer"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scroll-rail">
              {/* AI Stylist CTA */}
              <div className="px-6 py-4">
                <button
                  onClick={handleAIClick}
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-champagne/10 to-rose-gold/10 border border-champagne/20 flex items-center justify-center gap-2 text-champagne text-[11px] font-mono uppercase tracking-widest font-bold cursor-pointer hover:from-champagne/20 hover:to-rose-gold/20 transition-colors"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  AI Stylist
                </button>
              </div>

              {/* Catalog links */}
              <div className="px-6 pb-4">
                <span className="text-[9px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-2 px-1">
                  Catalog
                </span>
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 h-11 px-3 rounded-lg text-xs font-mono font-bold transition-colors ${
                          isActive(item.href)
                            ? 'bg-charcoal text-ivory'
                            : 'text-charcoal-light hover:bg-ivory-dark hover:text-charcoal'
                        }`}
                      >
                        <Icon size={15} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-border/60" />

              {/* Account links */}
              <div className="px-6 py-4">
                <span className="text-[9px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-2 px-1">
                  Account
                </span>
                <div className="space-y-1">
                  {ACCOUNT_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 h-11 px-3 rounded-lg text-xs font-mono font-bold transition-colors ${
                          isActive(item.href)
                            ? 'bg-charcoal text-ivory'
                            : 'text-charcoal-light hover:bg-ivory-dark hover:text-charcoal'
                        }`}
                      >
                        <Icon size={15} />
                        {item.label}
                        {item.label === 'Wishlist' && cartCount > 0 && (
                          <span className="ml-auto bg-champagne text-white text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-border/60" />

              {/* Contact */}
              <div className="px-6 py-4">
                <span className="text-[9px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-2 px-1">
                  Contact
                </span>
                <a
                  href="tel:+9118001234567"
                  className="flex items-center gap-3 h-11 px-3 rounded-lg text-xs font-mono font-bold text-charcoal-light hover:bg-ivory-dark hover:text-charcoal transition-colors"
                >
                  <Phone size={15} />
                  +91 1800 123 4567
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-white flex-shrink-0">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-8 h-8 rounded-full bg-champagne/10 flex items-center justify-center text-xs font-bold text-champagne">
                      {(user?.name || 'U')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-charcoal truncate">{user?.name}</p>
                      <p className="text-[9px] font-mono text-charcoal-light truncate">{user?.email}</p>
                    </div>
                  </div>
                  {user?.role === 'seller' && (
                    <Link
                      href="/seller"
                      onClick={onClose}
                      className="flex items-center gap-3 h-10 px-3 rounded-lg text-xs font-mono font-bold text-charcoal-light hover:bg-ivory-dark hover:text-charcoal transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Seller Studio
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-xs font-mono font-bold text-error hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="btn btn-primary w-full h-11 text-[10px] font-mono tracking-widest uppercase font-bold flex items-center justify-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
