import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  registration?: UseFormRegisterReturn;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, registration, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            {...registration}
            {...props}
            className={`
              w-full border rounded-xl px-4 py-2.5 text-sm transition
              focus:outline-none focus:ring-2
              ${error
                ? 'border-red-300 focus:ring-red-400 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500 bg-white'
              }
              ${leftIcon  ? 'pl-9'  : ''}
              ${rightIcon ? 'pr-9'  : ''}
              ${className}
            `}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
