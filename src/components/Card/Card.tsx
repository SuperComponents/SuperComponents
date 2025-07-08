import React from 'react';
import { cn } from '../../utils/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'bottom';
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      padding = 'md',
      header,
      footer,
      image,
      imageAlt,
      imagePosition = 'top',
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'rounded-lg transition-all duration-200 overflow-hidden',
      'bg-white'
    ];

    const variants = {
      default: 'border border-neutral-200',
      outlined: 'border-2 border-neutral-200',
      elevated: 'border border-neutral-200 shadow-md hover:shadow-lg',
      interactive: [
        'border border-neutral-200 shadow-sm hover:shadow-md',
        'hover:border-neutral-300 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      ]
    };

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg'
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    const contentPadding = image ? 'none' : padding;

    const Component = asChild ? 'div' : 'div';

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          !image && paddings[padding],
          className
        )}
        {...(variant === 'interactive' && { tabIndex: 0, role: 'button' })}
        {...props}
      >
        {image && imagePosition === 'top' && (
          <div className="relative">
            <img
              src={image}
              alt={imageAlt || ''}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {header && (
          <div className={cn(
            'border-b border-neutral-200',
            paddings[padding],
            'pb-3'
          )}>
            {header}
          </div>
        )}
        
        <div className={cn(
          image && paddings[padding],
          !header && !image && 'pt-0'
        )}>
          {children}
        </div>
        
        {footer && (
          <div className={cn(
            'border-t border-neutral-200 mt-4',
            paddings[padding],
            'pt-3'
          )}>
            {footer}
          </div>
        )}
        
        {image && imagePosition === 'bottom' && (
          <div className="relative">
            <img
              src={image}
              alt={imageAlt || ''}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Sub-components
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex justify-between items-start', className)}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-neutral-600', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
