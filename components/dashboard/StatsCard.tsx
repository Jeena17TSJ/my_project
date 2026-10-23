import { ReactNode } from 'react';

interface StatsCardProps {
  icon:    ReactNode;
  label:   string;
  value:   string | number;
  change?: string;
  up?:     boolean;
  color?:  'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   text: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600', text: 'text-green-700'  },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-600',text: 'text-yellow-700' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',     text: 'text-red-700'    },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600',text: 'text-purple-700' },
};

export default function StatsCard({
  icon, label, value, change, up, color = 'blue',
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className={`${c.bg} rounded-2xl p-6 flex items-center gap-4 border border-white shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${c.icon} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.text} mt-0.5`}>{value}</p>
        {change && (
          <p className={`text-xs mt-1 font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
            {up ? '↑' : '↓'} {change} vs last month
          </p>
        )}
      </div>
    </div>
  );
}
