import React from 'react';
import { cn } from '../../utils/cn.js';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helper ? `${inputId}-helper` : undefined;

    const baseStyles = [
      'block border rounded-md transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50'
    ];

    const variants = {
      default: [
        'border-neutral-200 bg-white',
        'focus:border-primary-500 focus:ring-primary-500',
        'hover:border-neutral-300'
      ],
      error: [
        'border-red-500 bg-white',
        'focus:border-red-500 focus:ring-red-500'
      ],
      success: [
        'border-green-500 bg-white',
        'focus:border-green-500 focus:ring-green-500'
      ]
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const paddingWithIcons = {
      sm: {
        left: leftIcon ? 'pl-10' : '',
        right: rightIcon ? 'pr-10' : ''
      },
      md: {
        left: leftIcon ? 'pl-12' : '',
        right: rightIcon ? 'pr-12' : ''
      },
      lg: {
        left: leftIcon ? 'pl-14' : '',
        right: rightIcon ? 'pr-14' : ''
      }
    };

    const currentVariant = error ? 'error' : variant;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-neutral-700 mb-1',
              disabled && 'text-neutral-400'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400',
              iconSizes[size]
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles,
              variants[currentVariant],
              sizes[size],
              paddingWithIcons[size].left,
              paddingWithIcons[size].right,
              fullWidth && 'w-full',
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={cn(
              errorId && errorId,
              helperId && helperId
            ).trim() || undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400',
              iconSizes[size]
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helper && !error && (
          <p
            id={helperId}
            className="mt-1 text-sm text-neutral-500"
          >
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
