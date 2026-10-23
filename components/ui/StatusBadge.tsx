import { STATUS_COLORS, ROLE_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  type?:  'appointment' | 'role' | 'user';
  size?:  'sm' | 'md';
}

export default function StatusBadge({ status, type = 'appointment', size = 'sm' }: StatusBadgeProps) {
  const colorClass =
    type === 'role'
      ? ROLE_COLORS[status] || 'bg-gray-100 text-gray-700'
      : STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';

  const padClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-block font-medium rounded-full border capitalize
                      ${colorClass} ${padClass}`}>
      {status}
    </span>
  );
}
