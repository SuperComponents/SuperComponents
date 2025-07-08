import React from 'react';
import { cn } from '../../utils/cn.js';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    fullWidth = false,
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    const baseStyles = [
      'flex rounded-md border bg-white px-3 py-2 text-sm',
      'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors duration-200'
    ];

    const variantStyles = {
      default: [
        'border-neutral-200 focus-visible:ring-primary-500',
        'hover:border-neutral-300 focus:border-primary-500'
      ],
      error: [
        'border-semantic-error focus-visible:ring-semantic-error',
        'hover:border-red-400 focus:border-semantic-error'
      ],
      success: [
        'border-semantic-success focus-visible:ring-semantic-success',
        'hover:border-green-400 focus:border-semantic-success'
      ]
    };

    const sizeStyles = {
      sm: 'h-8 px-2 text-sm',
      md: 'h-10 px-3 text-base',
      lg: 'h-12 px-4 text-lg'
    };

    const containerStyles = cn(
      'relative',
      fullWidth && 'w-full'
    );

    const inputStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      startIcon && 'pl-10',
      endIcon && 'pr-10',
      fullWidth && 'w-full',
      className
    );

    const iconStyles = cn(
      'absolute top-1/2 transform -translate-y-1/2 text-neutral-400',
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-5 h-5',
      size === 'lg' && 'w-6 h-6'
    );

    return (
      <div className={containerStyles}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              variant === 'error' ? 'text-semantic-error' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className={cn(iconStyles, 'left-3')}>
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            aria-describedby={cn(
              errorId,
              helperTextId
            )}
            aria-invalid={variant === 'error' ? 'true' : 'false'}
            {...props}
          />
          {endIcon && (
            <div className={cn(iconStyles, 'right-3')}>
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-semantic-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperTextId} className="mt-1 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
