import { forwardRef } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?:     'xs' | 'sm' | 'md' | 'lg';
  loading?:  boolean;
  leftIcon?: React.ReactNode;
  rightIcon?:React.ReactNode;
  fullWidth?:boolean;
}

const variantMap = {
  primary:   'bg-brand-900 text-white hover:bg-brand-800 focus:ring-mint-300 shadow-sm',
  secondary: 'bg-mint-50 text-brand-700 hover:bg-mint-100 focus:ring-mint-200',
  danger:    'bg-red-600    text-white hover:bg-red-700   focus:ring-red-500',
  ghost:     'bg-transparent text-slate-600 hover:bg-mint-50 hover:text-brand-900 focus:ring-mint-300',
  outline:   'bg-white border border-brand-200 text-brand-900 hover:bg-mint-50 focus:ring-mint-300',
};

const sizeMap = {
  xs: 'px-2.5 py-1   text-xs  rounded-lg gap-1',
  sm: 'px-3   py-1.5 text-sm  rounded-lg gap-1.5',
  md: 'px-5   py-2.5 text-sm  rounded-lg gap-2',
  lg: 'px-8   py-3.5 text-base rounded-lg gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary', size = 'md', loading = false,
    leftIcon, rightIcon, fullWidth = false,
    children, disabled, className = '', ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-semibold transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantMap[variant]}
          ${sizeMap[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <>
            {leftIcon  && <span>{leftIcon}</span>}
            {children}
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
