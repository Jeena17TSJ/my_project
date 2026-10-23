interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   'none' | 'sm' | 'md' | 'lg';
  hover?:     boolean;
  onClick?:   () => void;
}

const padMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function Card({
  children,
  className = '',
  padding   = 'md',
  hover     = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-blue-100/80 shadow-[0_10px_30px_rgba(37,99,235,0.08)]
        ${padMap[padding]}
        ${hover ? 'hover:shadow-[0_16px_40px_rgba(37,99,235,0.14)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Compound components
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-slate-900 text-lg">{children}</h3>;
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
