import React from 'react';
import { cn } from '../utils/cn';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
} {
  className?: string;
}

export const Modal = ({ className, ...props }: ModalProps) => {
  return (
    <>
      {props.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={props.onClose}
          />
          <div
            className={cn(
              'relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg',
              className
            )}
            {...props}
          >
            {props.title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{props.title}</h2>
                <button
                  onClick={props.onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {props.children}
          </div>
        </div>
      )}
    </>
  );
};

Modal.displayName = 'Modal';
