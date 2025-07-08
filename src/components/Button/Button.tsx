import React from 'react'
import { cn } from '../../utils/cn.js'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2 rounded-md font-medium',
      'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      'active:scale-95 transition-transform',
    ]

    const variants = {
      primary: [
        'bg-primary-600 text-white hover:bg-primary-700',
        'focus-visible:ring-primary-500',
      ],
      secondary: [
        'bg-secondary-600 text-white hover:bg-secondary-700',
        'focus-visible:ring-secondary-500',
      ],
      destructive: [
        'bg-red-600 text-white hover:bg-red-700',
        'focus-visible:ring-red-500',
      ],
      ghost: [
        'hover:bg-neutral-100 hover:text-neutral-900',
        'focus-visible:ring-neutral-500',
      ],
      outline: [
        'border border-neutral-200 bg-white hover:bg-neutral-50',
        'focus-visible:ring-neutral-500',
      ],
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    const isDisabled = disabled || isLoading

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className={cn('animate-spin', iconSizes[size])}
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
        {!isLoading && leftIcon && (
          <span className={iconSizes[size]}>{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className={iconSizes[size]}>{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
