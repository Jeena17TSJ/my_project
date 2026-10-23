interface BadgeProps {
  label: string;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

const variantMap = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  gray:   'bg-gray-100 text-gray-700',
};

export default function Badge({ label, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-block font-medium rounded-full ${variantMap[variant]} ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
      {label}
    </span>
  );
}
