import React from 'react';
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
