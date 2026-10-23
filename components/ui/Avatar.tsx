interface AvatarProps {
  name:   string;
  src?:   string;
  size?:  'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const sizeMap = {
  xs: 'w-6  h-6  text-xs',
  sm: 'w-8  h-8  text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const colorMap = [
  'bg-blue-500',   'bg-green-500',  'bg-purple-500',
  'bg-yellow-500', 'bg-red-500',    'bg-indigo-500',
  'bg-pink-500',   'bg-teal-500',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorMap[Math.abs(hash) % colorMap.length];
}

export default function Avatar({ name, src, size = 'md', color }: AvatarProps) {
  const initials  = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = color || getColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} ${bgColor} text-white rounded-full
                  flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
