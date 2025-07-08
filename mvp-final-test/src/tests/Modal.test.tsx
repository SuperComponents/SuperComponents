import React from 'react';
import { render, screen } from '@testing-library/react';
import { Modal } from '../components/Modal';

describe('Modal', () => {
  it('renders modal when open', () => {
    render(<Modal isOpen={true} onClose={jest.fn()}>Modal content</Modal>);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal isOpen={false} onClose={jest.fn()}>Modal content</Modal>);
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = jest.fn();
    render(<Modal isOpen={true} onClose={handleClose}>Modal content</Modal>);
    const backdrop = screen.getByRole('button', { hidden: true });
    backdrop.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
