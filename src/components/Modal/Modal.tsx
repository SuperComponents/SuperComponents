import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn.js';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'centered' | 'top';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClose?: () => void;
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusableElement = focusableElements[0] as HTMLElement;
      const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const overlayStyles = cn(
    'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
    'transition-opacity duration-200',
    variant === 'top' && 'items-start pt-20'
  );

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  const modalStyles = cn(
    'bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden',
    'transform transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
    sizeStyles[size],
    'w-full mx-4',
    className
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className={overlayStyles}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={modalStyles}
        tabIndex={-1}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 p-1 rounded-md',
              'text-neutral-400 hover:text-neutral-600',
              'hover:bg-neutral-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  className,
  children,
  onClose,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-6 border-b border-neutral-200',
        className
      )}
      {...props}
    >
      <div className="flex-1 pr-4">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'p-1 rounded-md text-neutral-400 hover:text-neutral-600',
            'hover:bg-neutral-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

ModalHeader.displayName = 'ModalHeader';

export const ModalContent: React.FC<ModalContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('p-6 overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};

ModalContent.displayName = 'ModalContent';

export const ModalFooter: React.FC<ModalFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end space-x-2 p-6 border-t border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

ModalFooter.displayName = 'ModalFooter';
