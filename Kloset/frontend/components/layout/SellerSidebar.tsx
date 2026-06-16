'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, ShoppingBag, BarChart3, Wallet, ArrowLeft, LogOut, Package, Settings, MessageSquare, Star, LifeBuoy, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function SellerSidebar() {
  const pathname = usePathname() || '';
  const { logout } = useAuthStore();

  const menuItems = [
    { label: 'Overview', path: '/seller', icon: LayoutDashboard },
    { label: 'My Listings', path: '/seller/listings', icon: PlusCircle },
    { label: 'Inventory', path: '/seller/inventory', icon: Package },
    { label: 'Rental Orders', path: '/seller/orders', icon: ShoppingBag },
    { label: 'Analytics', path: '/seller/analytics', icon: BarChart3 },
    { label: 'Earnings & Payouts', path: '/seller/earnings', icon: Wallet },
    { label: 'Reviews', path: '/seller/reviews', icon: Star },
    { label: 'Inbox', path: '/seller/inbox', icon: MessageSquare },
    { label: 'Support', path: '/seller/support', icon: LifeBuoy },
    { label: 'Profile', path: '/seller/profile', icon: User },
    { label: 'Payout Settings', path: '/seller/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-charcoal text-ivory border-r border-charcoal-mid flex flex-col justify-between p-6 z-[100] select-none font-sans">
      <div className="space-y-8">
        
        {/* Editorial Brand Header */}
        <div className="border-b border-charcoal-mid/40 pb-6 text-left">
          <Link href="/seller" className="flex items-center gap-1">
            <span className="font-display text-xl font-bold tracking-widest text-ivory">
              KLOSET
            </span>
            <span className="text-[8px] font-mono tracking-widest text-champagne uppercase font-extrabold mt-1">
              Studio
            </span>
          </Link>
          <span className="text-[9px] font-mono text-charcoal-light uppercase block mt-1 tracking-wider">
            Seller Dashboard
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3.5 px-4 h-[52px] rounded text-xs font-mono uppercase tracking-wider transition-all duration-300 font-semibold
                  ${isActive 
                    ? 'bg-champagne text-charcoal shadow-sm' 
                    : 'text-charcoal-light hover:bg-charcoal-mid hover:text-ivory'
                  }
                `}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="space-y-4 border-t border-charcoal-mid/40 pt-6">
        <Link
          href="/"
          className="flex items-center gap-3.5 px-4 h-[52px] rounded text-xs font-mono uppercase tracking-wider text-charcoal-light hover:bg-charcoal-mid hover:text-ivory transition-colors font-bold"
        >
          <ArrowLeft size={16} />
          <span>Exit Studio</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 h-[52px] rounded text-xs font-mono uppercase tracking-wider text-charcoal-light hover:bg-error/10 hover:text-error transition-colors font-bold cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
