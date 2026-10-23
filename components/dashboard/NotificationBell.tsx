'use client';
import { useEffect, useState, useRef } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';

export default function NotificationBell({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
    const res = await fetch(url);
    const data = await res.json();
    const notifs = data.notifications || [];
    setNotifications(notifs);
    setUnread(notifs.filter((n: any) => !n.isRead).length);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const TYPE_ICONS: Record<string, string> = {
    appointment: '📅',
    reminder: '⏰',
    general: '📢',
  };

  const TYPE_COLORS: Record<string, string> = {
    appointment: 'bg-blue-50 border-blue-200',
    reminder: 'bg-orange-50 border-orange-200',
    general: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition">
        <FaBell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="font-bold text-gray-800 text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800">Mark all read</button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={12} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <FaBell className="text-gray-300 text-3xl mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div key={n._id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border ${TYPE_COLORS[n.type] || 'bg-gray-50 border-gray-200'}`}>
                    {TYPE_ICONS[n.type] || '📢'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t bg-gray-50 text-center">
            <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
          </div>
        </div>
      )}
    </div>
  );
}
