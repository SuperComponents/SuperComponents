import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Modal, { ModalHeader, ModalContent, ModalFooter } from './Modal';

// Mock createPortal for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children
  };
});

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up body styles
    document.body.style.overflow = '';
  });

  it('renders when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <Modal 
        {...defaultProps} 
        title="Test Title"
        description="Test Description"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Modal 
        {...defaultProps} 
        footer={<button>Footer Button</button>}
      />
    );
    
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByRole('document')).toHaveClass('max-w-sm');

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('document')).toHaveClass('max-w-lg');

    rerender(<Modal {...defaultProps} size="full" />);
    expect(screen.getByRole('document')).toHaveClass('max-w-full');
  });

  it('handles close button click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} title="Test Modal" />);
    
    const closeButton = screen.getByLabelText('Close modal');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles overlay click when enabled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlay={true} />);
    
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on overlay click when disabled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlay={false} />);
    
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles escape key when enabled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={true} />);
    
    await user.keyboard('{Escape}');
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on escape when disabled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
    
    await user.keyboard('{Escape}');
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} title="Test Modal" showCloseButton={false} />);
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('locks body scroll when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const originalOverflow = 'auto';
    document.body.style.overflow = originalOverflow;
    
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    expect(screen.getByRole('document')).toHaveClass('custom-modal');
  });

  it('applies custom overlay className', () => {
    render(<Modal {...defaultProps} overlayClassName="custom-overlay" />);
    expect(screen.getByRole('dialog')).toHaveClass('custom-overlay');
  });

  it('has correct ARIA attributes', () => {
    render(
      <Modal 
        {...defaultProps} 
        title="Test Title"
        description="Test Description"
      />
    );
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby');
    expect(modal).toHaveAttribute('aria-describedby');
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();
    
    render(
      <Modal {...defaultProps} title="Test Modal">
        <input placeholder="First input" />
        <input placeholder="Second input" />
      </Modal>
    );
    
    const firstInput = screen.getByPlaceholderText('First input');
    const secondInput = screen.getByPlaceholderText('Second input');
    const closeButton = screen.getByLabelText('Close modal');
    
    // Focus should start at close button
    await user.tab();
    expect(closeButton).toHaveFocus();
    
    // Tab to first input
    await user.tab();
    expect(firstInput).toHaveFocus();
    
    // Tab to second input
    await user.tab();
    expect(secondInput).toHaveFocus();
    
    // Tab should cycle back to close button
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  it('handles content overflow with scroll', () => {
    render(
      <Modal {...defaultProps} title="Test Modal">
        <div style={{ height: '2000px' }}>Very tall content</div>
      </Modal>
    );
    
    const scrollableArea = screen.getByRole('document').querySelector('.overflow-y-auto');
    expect(scrollableArea).toBeInTheDocument();
    expect(scrollableArea).toHaveClass('max-h-[calc(90vh-8rem)]');
  });

  it('prevents event propagation on modal content click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlay={true} />);
    
    const modalContent = screen.getByRole('document');
    await user.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ModalHeader', () => {
  it('renders with title', () => {
    render(<ModalHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(<ModalHeader title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders close button when onClose provided', () => {
    const onClose = vi.fn();
    render(<ModalHeader title="Test Title" onClose={onClose} />);
    
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('handles close button click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<ModalHeader title="Test Title" onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides close button when showCloseButton is false', () => {
    const onClose = vi.fn();
    render(<ModalHeader title="Test Title" onClose={onClose} showCloseButton={false} />);
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });
});

describe('ModalContent', () => {
  it('renders children', () => {
    render(
      <ModalContent>
        <p>Content text</p>
      </ModalContent>
    );
    
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ModalContent className="custom-content">
        <p>Content</p>
      </ModalContent>
    );
    
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-content');
  });
});

describe('ModalFooter', () => {
  it('renders children', () => {
    render(
      <ModalFooter>
        <button>Action</button>
      </ModalFooter>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(
      <ModalFooter>
        <button>Action</button>
      </ModalFooter>
    );
    
    expect(screen.getByText('Action').parentElement).toHaveClass('flex', 'justify-end');
  });

  it('applies custom className', () => {
    render(
      <ModalFooter className="custom-footer">
        <button>Action</button>
      </ModalFooter>
    );
    
    expect(screen.getByText('Action').parentElement).toHaveClass('custom-footer');
  });
});

describe('Modal Snapshots', () => {
  it('creates snapshot for basic modal', () => {
    const { container } = render(<Modal {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for modal with title and footer', () => {
    const { container } = render(
      <Modal 
        {...defaultProps} 
        title="Test Modal"
        footer={<button>Action</button>}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    sizes.forEach(size => {
      const { container } = render(<Modal {...defaultProps} size={size} />);
      expect(container.firstChild).toMatchSnapshot(`modal-${size}`);
    });
  });
});
