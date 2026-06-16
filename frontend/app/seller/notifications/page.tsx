'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Loader2 } from 'lucide-react';
import { notificationsAPI } from '@/lib/api';
import type { Notification } from '@/types';
import Card from '@/components/ui/Card';

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  const fetchNotifications = async (p: number, append = false) => {
    setLoading(true);
    try {
      const resp = await notificationsAPI.list(p, perPage);
      if (append) {
        setNotifications((prev) => [...prev, ...resp.notifications]);
      } else {
        setNotifications(resp.notifications);
      }
      setUnreadCount(resp.meta.unread);
      setTotal(resp.meta.total);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="space-y-8 text-left font-sans select-none text-charcoal"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-champagne uppercase font-bold block">
            Seller Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-charcoal mt-1">
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors cursor-pointer"
          >
            <Check size={13} /> Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-20 rounded bg-ivory-dark" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card padding="lg" className="bg-white border-border text-center py-12">
          <Bell size={28} className="mx-auto text-champagne mb-3" />
          <p className="text-xs font-mono text-charcoal-light">You&apos;re all caught up. No notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white border border-border rounded-xl p-5 transition-colors ${
                !n.is_read ? 'border-champagne/30 bg-champagne/[0.02]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-display ${!n.is_read ? 'font-bold text-charcoal' : 'text-charcoal'}`}>
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-champagne flex-shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-charcoal-light mt-1 leading-relaxed">{n.body}</p>
                  )}
                  <p className="text-[9px] font-mono text-charcoal-light/60 mt-2">
                    {new Date(n.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="flex-shrink-0 p-2 text-champagne hover:text-charcoal hover:bg-ivory-dark rounded transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {page < totalPages && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-xs font-mono uppercase tracking-wider text-champagne hover:text-charcoal transition-colors flex items-center gap-1 mx-auto cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                Load More ({total - notifications.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
