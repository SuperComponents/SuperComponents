import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  padding = 'md',
  shadow = 'md',
}) => {
  const baseStyles = 'bg-white rounded-lg border border-neutral-200';
  
  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const cardClasses = `${baseStyles} ${shadowStyles[shadow]} ${className}`;

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className={`${paddingStyles[padding]} border-b border-neutral-200`}>
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className={paddingStyles[padding]}>
        {children}
      </div>
      {footer && (
        <div className={`${paddingStyles[padding]} border-t border-neutral-200`}>
          {footer}
        </div>
      )}
    </div>
  );
};
