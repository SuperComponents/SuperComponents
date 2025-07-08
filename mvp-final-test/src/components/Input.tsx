import React from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
} {
  className?: string;
}

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <div className="space-y-2">
      {props.label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {props.label}
        </label>
      )}
      <input
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          props.error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {props.error && (
        <p className="text-sm text-red-600">{props.error}</p>
      )}
      {props.helperText && !props.error && (
        <p className="text-sm text-gray-500">{props.helperText}</p>
      )}
    </div>
  );
};

Input.displayName = 'Input';
