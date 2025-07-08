import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './Input.js';

describe('Input', () => {
  it('renders with default variant', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-neutral-200');
  });

  it('renders with error variant', () => {
    render(<Input variant="error" placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-semantic-error');
  });

  it('renders with success variant', () => {
    render(<Input variant="success" placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-semantic-success');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-8');

    rerender(<Input size="md" placeholder="Medium" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-10');

    rerender(<Input size="lg" placeholder="Large" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-12');
  });

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" placeholder="Enter text" />);
    const errorMessage = screen.getByText('This field is required');
    const input = screen.getByRole('textbox');
    
    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with helper text', () => {
    render(<Input helperText="Enter at least 8 characters" placeholder="Enter text" />);
    const helperText = screen.getByText('Enter at least 8 characters');
    const input = screen.getByRole('textbox');
    
    expect(helperText).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', helperText.id);
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        error="This field is required" 
        helperText="Enter at least 8 characters"
        placeholder="Enter text"
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByText('Enter at least 8 characters')).not.toBeInTheDocument();
  });

  it('handles fullWidth prop', () => {
    render(<Input fullWidth placeholder="Enter text" />);
    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('w-full');
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Enter text" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes additional props to input element', () => {
    render(<Input data-testid="custom-input" placeholder="Enter text" />);
    expect(screen.getByTestId('custom-input')).toBeInTheDocument();
  });
});
