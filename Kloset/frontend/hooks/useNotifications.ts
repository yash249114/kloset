'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI } from '@/lib/api';
import type { Notification } from '@/types';

const POLL_INTERVAL = 30000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const resp = await notificationsAPI.list(1, 10);
      setNotifications(resp.notifications);
      setUnreadCount(resp.meta.unread);
      setTotal(resp.meta.total);
    } catch {
      // silently fail
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(() => fetchNotifications(true), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
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

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    total,
    refresh: () => fetchNotifications(),
    markAsRead,
    markAllAsRead,
  };
}
