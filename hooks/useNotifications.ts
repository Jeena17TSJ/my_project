import { useState, useEffect, useCallback, useRef } from 'react';

export function useNotifications(userId?: string, pollInterval = 30000) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [unread,   setUnread]   = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const url  = userId
        ? `/api/notifications?userId=${userId}`
        : '/api/notifications';
      const res  = await fetch(url);
      const data = await res.json();
      const list: any[] = data.notifications || [];
      setNotifications(list);
      setUnread(list.filter(n => !n.isRead).length);
    } catch (e) {
      // silent – notification failures must never break the UI
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch_();
    intervalRef.current = setInterval(fetch_, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch_, pollInterval]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnread(prev => Math.max(0, prev - 1));
  }, []);

  return { notifications, loading, unread, markAllRead, markRead, refetch: fetch_ };
}
