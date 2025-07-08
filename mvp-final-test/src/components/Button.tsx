import React from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
} {
  className?: string;
}

export const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary-600 text-white hover:bg-primary-700': props.variant === 'primary',
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200': props.variant === 'secondary',
          'border border-gray-300 bg-white hover:bg-gray-50': props.variant === 'outline',
          'h-9 px-4 py-2': props.size === 'sm',
          'h-10 px-4 py-2': props.size === 'md',
          'h-11 px-6 py-3': props.size === 'lg',
        },
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  );
};

Button.displayName = 'Button';
