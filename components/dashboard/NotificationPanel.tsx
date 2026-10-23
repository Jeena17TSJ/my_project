'use client';
import { useNotifications } from '@/hooks/useNotifications';
import { FaBell, FaCheck }  from 'react-icons/fa';
import { PageLoader }        from '@/components/ui/Spinner';

const TYPE_CONFIG: Record<string, { icon: string; bg: string }> = {
  appointment: { icon: '📅', bg: 'bg-blue-50   border-blue-200'   },
  reminder:    { icon: '⏰', bg: 'bg-orange-50 border-orange-200' },
  general:     { icon: '📢', bg: 'bg-gray-50   border-gray-200'   },
};

interface NotificationPanelProps {
  userId?: string;
}

export default function NotificationPanel({ userId }: NotificationPanelProps) {
  const { notifications, loading, unread, markAllRead, markRead } =
    useNotifications(userId);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <FaBell className="text-blue-600" size={16} />
          <h2 className="font-bold text-gray-800">Notifications</h2>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800
                       font-medium transition"
          >
            <FaCheck size={10} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? <PageLoader /> : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <FaBell className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n: any) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex gap-3 px-5 py-4 hover:bg-gray-50 transition cursor-pointer
                    ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                   text-sm flex-shrink-0 border ${cfg.bg}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
