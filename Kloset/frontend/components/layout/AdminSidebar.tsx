'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Receipt,
  AlertOctagon,
  Sparkles,
  Settings,
  ArrowLeft,
  LogOut,
  FolderOpen,
  ShoppingCart,
  CreditCard,
  BarChart3,
  MessageSquare,
  Shield,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminSidebar() {
  const pathname = usePathname() || '';
  const { logout } = useAuthStore();

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Sellers', path: '/admin/sellers', icon: ShieldCheck },
    { label: 'KYC Approval', path: '/admin/kyc', icon: FolderOpen },
    { label: 'Listings', path: '/admin/listings', icon: FileText },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Transactions', path: '/admin/transactions', icon: Receipt },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Disputes', path: '/admin/disputes', icon: AlertOctagon },
    { label: 'Support', path: '/admin/support', icon: MessageSquare },
    { label: 'Security', path: '/admin/security', icon: Shield },
    { label: 'AIOps Monitor', path: '/admin/aiops', icon: Sparkles },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside 
      className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#161616] text-[#E8E8E8] border-r border-[#2A2A2A] flex flex-col justify-between p-6 select-none font-sans z-[100]"
    >
      <div className="space-y-8">
        
        {/* Brand Header */}
        <div className="border-b border-[#2A2A2A] pb-6 text-left">
          <Link href="/admin" className="flex items-center gap-1">
            <span className="font-display text-xl font-bold tracking-widest text-[#E8E8E8] hover:text-[#C9A96E] transition-colors">
              KLOSET
            </span>
            <span className="text-[8px] font-mono tracking-widest text-[#C9A96E] uppercase font-extrabold mt-1">
              Admin
            </span>
          </Link>
          <span className="text-[9px] font-mono text-charcoal-light uppercase block mt-1 tracking-wider">
            Operational Hub
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-3.5 h-[52px] rounded text-[11px] font-mono uppercase tracking-wider transition-all duration-300 font-semibold
                  ${isActive 
                    ? 'bg-[#2A2A2A] text-[#C9A96E] border-l-2 border-[#C9A96E]' 
                    : 'text-[#8C8C8C] hover:bg-[#1C1C1C] hover:text-[#E8E8E8]'
                  }
                `}
              >
                <item.icon size={14} className={isActive ? 'text-[#C9A96E]' : 'text-inherit'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer operations */}
      <div className="space-y-4 border-t border-[#2A2A2A] pt-6">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 h-[52px] rounded text-[11px] font-mono uppercase tracking-wider text-[#8C8C8C] hover:bg-[#1C1C1C] hover:text-[#E8E8E8] transition-colors font-bold"
        >
          <ArrowLeft size={14} />
          <span>Exit Hub</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 h-[52px] rounded text-[11px] font-mono uppercase tracking-wider text-[#8C8C8C] hover:bg-error/10 hover:text-error transition-colors font-bold cursor-pointer text-left"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
