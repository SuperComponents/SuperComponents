import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
} {
  className?: string;
}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        className
      )}
      {...props}
    >
      {props.title && (
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold">{props.title}</h3>
        </div>
      )}
      <div className="p-6 pt-0">
        {props.children}
      </div>
    </div>
  );
};

Card.displayName = 'Card';
