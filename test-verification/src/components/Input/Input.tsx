import React from 'react';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  className = '',
}) => {
  const baseStyles = 'w-full px-3 py-2 border rounded-md transition-colors';
  const normalStyles = 'border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';
  const errorStyles = 'border-semantic-error focus:border-semantic-error focus:outline-none focus:ring-1 focus:ring-semantic-error';
  const disabledStyles = 'bg-neutral-100 cursor-not-allowed';

  const inputClasses = `${baseStyles} ${error ? errorStyles : normalStyles} ${disabled ? disabledStyles : ''} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
      />
      {error && (
        <p className="text-sm text-semantic-error">{error}</p>
      )}
    </div>
  );
};
