import React from 'react';
import { cn } from '../../utils/cn.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    disabled = false, 
    loading = false,
    children,
    ...props 
  }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden'
    ];

    const variantStyles = {
      default: [
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        'border border-neutral-200 hover:border-neutral-300'
      ],
      primary: [
        'bg-primary-500 text-white hover:bg-primary-600',
        'shadow-sm hover:shadow-md'
      ],
      secondary: [
        'bg-secondary-500 text-white hover:bg-secondary-600',
        'shadow-sm hover:shadow-md'
      ],
      destructive: [
        'bg-semantic-error text-white hover:bg-red-600',
        'shadow-sm hover:shadow-md'
      ],
      outline: [
        'border border-neutral-200 bg-transparent hover:bg-neutral-50',
        'text-neutral-900 hover:text-neutral-950'
      ],
      ghost: [
        'hover:bg-neutral-100 hover:text-neutral-900',
        'text-neutral-600'
      ]
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg'
    };

    const styles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    return (
      <button
        className={styles}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
