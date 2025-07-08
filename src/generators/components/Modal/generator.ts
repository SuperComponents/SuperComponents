import { W3CDesignTokens } from '../../tokens.js';
import { ComponentGeneratorOptions } from '../factory.js';

export interface GeneratedFiles {
  [filename: string]: string;
}

export async function generateModal(
  tokens: W3CDesignTokens,
  options: ComponentGeneratorOptions
): Promise<GeneratedFiles> {
  const files: GeneratedFiles = {};

  // Generate the main Modal component
  files['Modal.tsx'] = generateModalComponent(tokens, options);

  // Generate tests if requested
  if (options.generateTests) {
    files['Modal.test.tsx'] = generateModalTest(tokens, options);
  }

  // Generate stories if requested
  if (options.generateStories) {
    files['Modal.stories.tsx'] = generateModalStories(tokens, options);
  }

  return files;
}

function generateModalComponent(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React, { useEffect, useRef } from 'react';
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
`;
}

function generateModalTest(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalHeader, ModalContent, ModalFooter } from './Modal.js';

// Mock createPortal for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when escape key is pressed and closeOnEscape is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} closeOnOverlayClick={false}>
        <div>Modal content</div>
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows close button by default', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} size="sm">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="md">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="lg">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} variant="centered">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog').parentElement).toHaveClass('items-center');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} variant="top">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog').parentElement).toHaveClass('items-start', 'pt-20');
  });

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} className="custom-modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
  });
});

describe('ModalHeader', () => {
  it('renders with default styles', () => {
    render(<ModalHeader>Header content</ModalHeader>);
    const header = screen.getByText('Header content');
    expect(header.parentElement).toHaveClass('flex', 'items-center', 'justify-between', 'p-6', 'border-b');
  });

  it('renders close button when onClose is provided', () => {
    const mockOnClose = jest.fn();
    render(<ModalHeader onClose={mockOnClose}>Header content</ModalHeader>);
    
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    render(<ModalHeader>Header content</ModalHeader>);
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });
});

describe('ModalContent', () => {
  it('renders with default styles', () => {
    render(<ModalContent>Content text</ModalContent>);
    const content = screen.getByText('Content text');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('p-6', 'overflow-y-auto');
  });

  it('accepts custom className', () => {
    render(<ModalContent className="custom-content">Content</ModalContent>);
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-content');
  });
});

describe('ModalFooter', () => {
  it('renders with default styles', () => {
    render(<ModalFooter>Footer content</ModalFooter>);
    const footer = screen.getByText('Footer content');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex', 'items-center', 'justify-end', 'space-x-2', 'p-6', 'border-t');
  });

  it('accepts custom className', () => {
    render(<ModalFooter className="custom-footer">Footer</ModalFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-footer');
  });
});
`;
}

function generateModalStories(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { Modal, ModalHeader, ModalContent, ModalFooter } from './Modal.js';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible modal component with header, content, and footer sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    variant: {
      control: 'select',
      options: ['default', 'centered', 'top'],
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to manage modal state
const ModalWithState = ({ children, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
      >
        Open Modal
      </button>
      <Modal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children}
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <ModalWithState {...args}>
      <ModalHeader>
        <h2 className="text-xl font-semibold">Default Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is the default modal content. It can contain any React elements.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Confirm
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  args: {
    size: 'md',
    variant: 'default',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    showCloseButton: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Modal should be open
    await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  },
};

export const Small: Story = {
  render: () => (
    <ModalWithState size="sm">
      <ModalHeader>
        <h2 className="text-lg font-semibold">Small Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is a small modal with limited content.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          OK
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = document.querySelector('[role="dialog"]');
    await expect(modal).toHaveClass('max-w-sm');
  },
};

export const Large: Story = {
  render: () => (
    <ModalWithState size="lg">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Large Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is a large modal with more content space.</p>
        <p>It can contain multiple paragraphs and more complex layouts.</p>
        <div className="mt-4 p-4 bg-neutral-50 rounded-md">
          <h3 className="font-medium mb-2">Additional Content</h3>
          <p>More content can be added here as needed.</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Save
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = document.querySelector('[role="dialog"]');
    await expect(modal).toHaveClass('max-w-lg');
  },
};

export const TopAligned: Story = {
  render: () => (
    <ModalWithState variant="top">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Top Aligned Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This modal appears at the top of the screen instead of being centered.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          OK
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modalOverlay = document.querySelector('[role="dialog"]')?.parentElement;
    await expect(modalOverlay).toHaveClass('items-start', 'pt-20');
  },
};

export const WithoutCloseButton: Story = {
  render: () => (
    <ModalWithState showCloseButton={false}>
      <ModalHeader>
        <h2 className="text-xl font-semibold">No Close Button</h2>
      </ModalHeader>
      <ModalContent>
        <p>This modal doesn't have a close button in the top-right corner.</p>
        <p>You can only close it by clicking the cancel button or pressing Escape.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Should not have close button
    await expect(document.querySelector('[aria-label="Close modal"]')).not.toBeInTheDocument();
  },
};

export const ConfirmationDialog: Story = {
  render: () => (
    <ModalWithState size="sm" closeOnOverlayClick={false}>
      <ModalHeader>
        <h2 className="text-lg font-semibold text-semantic-error">Delete Item</h2>
      </ModalHeader>
      <ModalContent>
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-semantic-error text-white rounded-md hover:bg-red-600">
          Delete
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    await expect(document.querySelector('.text-semantic-error')).toBeInTheDocument();
  },
};

export const FormModal: Story = {
  render: () => (
    <ModalWithState size="md">
      <ModalHeader>
        <h2 className="text-xl font-semibold">User Profile</h2>
      </ModalHeader>
      <ModalContent>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bio
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Tell us about yourself"
            />
          </div>
        </form>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Save Profile
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Check if form elements are present
    const nameInput = document.querySelector('input[placeholder="Enter your name"]');
    const emailInput = document.querySelector('input[placeholder="Enter your email"]');
    const bioTextarea = document.querySelector('textarea[placeholder="Tell us about yourself"]');
    
    await expect(nameInput).toBeInTheDocument();
    await expect(emailInput).toBeInTheDocument();
    await expect(bioTextarea).toBeInTheDocument();
  },
};

export const LongContent: Story = {
  render: () => (
    <ModalWithState size="lg">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Terms of Service</h2>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.</p>
          <p>Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
          <p>Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
          <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Decline
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Accept
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Check if content is scrollable
    const modalContent = document.querySelector('.overflow-y-auto');
    await expect(modalContent).toBeInTheDocument();
  },
};
`;
}
