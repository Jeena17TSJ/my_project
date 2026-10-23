interface ActivityItem {
  id:      string;
  type:    'appointment' | 'patient' | 'system';
  message: string;
  time:    string;
  icon?:   string;
}

const TYPE_CONFIG = {
  appointment: { icon: '📅', color: 'bg-blue-100   text-blue-600'   },
  patient:     { icon: '👤', color: 'bg-green-100  text-green-600'  },
  system:      { icon: '⚙️', color: 'bg-gray-100   text-gray-600'   },
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="font-bold text-gray-800">Recent Activity</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          No recent activity.
        </div>
      ) : (
        <div className="divide-y max-h-80 overflow-y-auto">
          {items.map(item => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
            return (
              <div key={item.id} className="flex gap-3 px-6 py-4 hover:bg-gray-50 transition">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                 text-sm flex-shrink-0 ${cfg.color}`}>
                  {item.icon || cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
