import React from 'react';

const Card = ({ 
  title, 
  description, 
  image, 
  footer, 
  className = '',
  children,
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm';
  
  const variantClasses = {
    default: 'hover:shadow-md transition-shadow',
    elevated: 'shadow-lg',
    flat: 'shadow-none border-gray-100',
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0'
  };
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  const contentClasses = paddingClasses[padding];
  
  return (
    <div className={cardClasses}>
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title || 'Card image'} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className={contentClasses}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-gray-600 mb-4">
            {description}
          </p>
        )}
        
        {children && (
          <div className="text-gray-700">
            {children}
          </div>
        )}
      </div>
      
      {footer && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 