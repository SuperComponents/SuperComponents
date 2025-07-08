import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Card, { CardHeader, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('renders correctly', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Card variant="default">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('border-neutral-200');

    rerender(<Card variant="outlined">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('border-2');

    rerender(<Card variant="elevated">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('shadow-md');

    rerender(<Card variant="interactive">Content</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('applies correct size styles', () => {
    const { rerender } = render(<Card size="sm">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('max-w-sm');

    rerender(<Card size="md">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('max-w-md');

    rerender(<Card size="lg">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('max-w-lg');
  });

  it('applies correct padding styles', () => {
    const { rerender } = render(<Card padding="sm">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('p-3');

    rerender(<Card padding="md">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('p-4');

    rerender(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('p-6');

    rerender(<Card padding="none">Content</Card>);
    expect(screen.getByText('Content').parentElement).not.toHaveClass('p-4');
  });

  it('renders with image', () => {
    render(
      <Card image="test-image.jpg" imageAlt="Test image">
        Content
      </Card>
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
    expect(image).toHaveClass('w-full', 'h-48', 'object-cover');
  });

  it('renders image at bottom when specified', () => {
    render(
      <Card image="test-image.jpg" imagePosition="bottom">
        Content
      </Card>
    );
    
    const card = screen.getByText('Content').parentElement;
    const image = screen.getByRole('img');
    
    expect(card?.lastElementChild).toContain(image);
  });

  it('renders header and footer', () => {
    render(
      <Card 
        header={<h2>Header</h2>}
        footer={<button>Footer</button>}
      >
        Content
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('handles click events on interactive cards', () => {
    const handleClick = vi.fn();
    render(
      <Card variant="interactive" onClick={handleClick}>
        Content
      </Card>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events on interactive cards', () => {
    const handleKeyDown = vi.fn();
    render(
      <Card variant="interactive" onKeyDown={handleKeyDown}>
        Content
      </Card>
    );
    
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<Card data-testid="custom-card">Content</Card>);
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('renders with title and subtitle', () => {
    render(<CardHeader title="Test Title" subtitle="Test Subtitle" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders with action', () => {
    render(<CardHeader title="Title" action={<button>Action</button>} />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders children when no title provided', () => {
    render(<CardHeader><h3>Custom Header</h3></CardHeader>);
    
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Content</CardHeader>);
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-header');
  });
});

describe('CardContent', () => {
  it('renders correctly', () => {
    render(<CardContent>Content text</CardContent>);
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('text-neutral-600');
  });

  it('applies custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('custom-content');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('CardFooter', () => {
  it('renders correctly', () => {
    render(
      <CardFooter>
        <button>Action 1</button>
        <button>Action 2</button>
      </CardFooter>
    );
    
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toHaveClass('flex', 'items-center', 'justify-end');
  });

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>);
    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('Card Snapshots', () => {
  it('creates snapshot for default card', () => {
    const { container } = render(<Card>Test content</Card>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for interactive card', () => {
    const { container } = render(<Card variant="interactive">Interactive content</Card>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for card with image', () => {
    const { container } = render(
      <Card image="test.jpg" imageAlt="Test">
        Content with image
      </Card>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for complete card', () => {
    const { container } = render(
      <Card>
        <CardHeader title="Title" subtitle="Subtitle" />
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
