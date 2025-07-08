import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from './Card.js';

describe('Card', () => {
  it('renders with default variant', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'border-neutral-200');
  });

  it('renders with outlined variant', () => {
    render(<Card variant="outlined">Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toHaveClass('border-2', 'border-neutral-200');
  });

  it('renders with elevated variant', () => {
    render(<Card variant="elevated">Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toHaveClass('shadow-md');
  });

  it('renders with ghost variant', () => {
    render(<Card variant="ghost">Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toHaveClass('bg-neutral-50');
  });

  it('renders with different padding sizes', () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>);
    expect(screen.getByText('Small padding')).toHaveClass('p-3');

    rerender(<Card padding="md">Medium padding</Card>);
    expect(screen.getByText('Medium padding')).toHaveClass('p-4');

    rerender(<Card padding="lg">Large padding</Card>);
    expect(screen.getByText('Large padding')).toHaveClass('p-6');

    rerender(<Card padding="none">No padding</Card>);
    expect(screen.getByText('No padding')).not.toHaveClass('p-3', 'p-4', 'p-6');
  });

  it('handles interactive prop', () => {
    render(<Card interactive>Interactive card</Card>);
    const card = screen.getByText('Interactive card');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('does not add interactive styles when interactive is false', () => {
    render(<Card interactive={false}>Non-interactive card</Card>);
    const card = screen.getByText('Non-interactive card');
    expect(card).not.toHaveClass('cursor-pointer');
    expect(card).not.toHaveAttribute('tabIndex');
    expect(card).not.toHaveAttribute('role');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional props to div element', () => {
    render(<Card data-testid="custom-card">Test</Card>);
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });

  it('handles onClick events when interactive', () => {
    const handleClick = jest.fn();
    render(<Card interactive onClick={handleClick}>Click me</Card>);
    
    const card = screen.getByText('Click me');
    card.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('CardHeader', () => {
  it('renders with default styles', () => {
    render(<CardHeader>Header content</CardHeader>);
    const header = screen.getByText('Header content');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'pb-4');
  });

  it('accepts custom className', () => {
    render(<CardHeader className="custom-class">Header</CardHeader>);
    const header = screen.getByText('Header');
    expect(header).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardHeader ref={ref}>Test</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardContent', () => {
  it('renders with default styles', () => {
    render(<CardContent>Content text</CardContent>);
    const content = screen.getByText('Content text');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('text-neutral-700');
  });

  it('accepts custom className', () => {
    render(<CardContent className="custom-class">Content</CardContent>);
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardContent ref={ref}>Test</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('renders with default styles', () => {
    render(<CardFooter>Footer content</CardFooter>);
    const footer = screen.getByText('Footer content');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex', 'items-center', 'pt-4');
  });

  it('accepts custom className', () => {
    render(<CardFooter className="custom-class">Footer</CardFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardFooter ref={ref}>Test</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
