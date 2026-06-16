'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-charcoal-light hover:text-ivory hover:bg-charcoal-mid transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[8px] font-mono font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-xl z-[200] max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-charcoal">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[9px] font-mono tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check size={11} /> Mark All Read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={16} className="animate-spin text-champagne" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={20} className="mx-auto text-border mb-2" />
                <p className="text-[10px] font-mono text-charcoal-light">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.slice(0, 5).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-ivory-dark transition-colors cursor-pointer ${
                      !n.is_read ? 'bg-ivory-dark/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-mono truncate ${!n.is_read ? 'font-bold text-charcoal' : 'text-charcoal-light'}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-[9px] text-charcoal-light/70 mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                        <p className="text-[8px] text-charcoal-light/50 mt-1 font-mono">
                          {new Date(n.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/seller/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-[10px] font-mono tracking-wider uppercase font-bold text-champagne hover:text-charcoal border-t border-border py-3 transition-colors"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}
