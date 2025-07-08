import { W3CDesignTokens } from '../../tokens.js';
import { ComponentGeneratorOptions } from '../factory.js';

export interface GeneratedFiles {
  [filename: string]: string;
}

export async function generateCard(
  tokens: W3CDesignTokens,
  options: ComponentGeneratorOptions
): Promise<GeneratedFiles> {
  const files: GeneratedFiles = {};

  // Generate the main Card component
  files['Card.tsx'] = generateCardComponent(tokens, options);

  // Generate tests if requested
  if (options.generateTests) {
    files['Card.test.tsx'] = generateCardTest(tokens, options);
  }

  // Generate stories if requested
  if (options.generateStories) {
    files['Card.stories.tsx'] = generateCardStories(tokens, options);
  }

  return files;
}

function generateCardComponent(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React from 'react';
import { cn } from '../../utils/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    interactive = false,
    children,
    ...props 
  }, ref) => {
    const baseStyles = [
      'rounded-lg transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-primary-500'
    ];

    const variantStyles = {
      default: [
        'bg-white border border-neutral-200',
        'hover:border-neutral-300'
      ],
      outlined: [
        'bg-white border-2 border-neutral-200',
        'hover:border-neutral-300'
      ],
      elevated: [
        'bg-white shadow-md border border-neutral-100',
        'hover:shadow-lg'
      ],
      ghost: [
        'bg-neutral-50 border border-transparent',
        'hover:bg-neutral-100'
      ]
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    const interactiveStyles = interactive ? [
      'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
      'focus:scale-[1.02]'
    ] : [];

    const styles = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      interactiveStyles,
      className
    );

    return (
      <div
        ref={ref}
        className={styles}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 pb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-neutral-700', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
`;
}

function generateCardTest(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React from 'react';
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
`;
}

function generateCardStories(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Card, CardHeader, CardContent, CardFooter } from './Card.js';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated', 'ghost'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    interactive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default card with some content.',
    variant: 'default',
    padding: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is a default card with some content.');
    
    await expect(card).toBeInTheDocument();
    await expect(card).toHaveClass('bg-white', 'border-neutral-200');
  },
};

export const WithStructure: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-sm text-neutral-500">Card subtitle</p>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card. It can contain any React elements.</p>
      </CardContent>
      <CardFooter>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Action
        </button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await expect(canvas.getByText('Card Title')).toBeInTheDocument();
    await expect(canvas.getByText('Card subtitle')).toBeInTheDocument();
    await expect(canvas.getByText('This is the main content of the card. It can contain any React elements.')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'This is an outlined card.',
    className: 'w-64',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is an outlined card.');
    
    await expect(card).toHaveClass('border-2', 'border-neutral-200');
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'This is an elevated card with shadow.',
    className: 'w-64',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is an elevated card with shadow.');
    
    await expect(card).toHaveClass('shadow-md');
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'This is a ghost card with subtle background.',
    className: 'w-64',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is a ghost card with subtle background.');
    
    await expect(card).toHaveClass('bg-neutral-50');
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: 'This is an interactive card. Click me!',
    className: 'w-64',
    onClick: () => console.log('Card clicked!'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is an interactive card. Click me!');
    
    await expect(card).toHaveClass('cursor-pointer');
    await expect(card).toHaveAttribute('tabIndex', '0');
    await expect(card).toHaveAttribute('role', 'button');
    
    // Test click interaction
    await userEvent.click(card);
  },
};

export const PaddingVariants: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <Card padding="none" variant="outlined">
        <div className="p-2 bg-neutral-100 text-sm">No padding</div>
      </Card>
      <Card padding="sm" variant="outlined">
        <div className="bg-neutral-100 text-sm">Small padding</div>
      </Card>
      <Card padding="md" variant="outlined">
        <div className="bg-neutral-100 text-sm">Medium padding</div>
      </Card>
      <Card padding="lg" variant="outlined">
        <div className="bg-neutral-100 text-sm">Large padding</div>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByText(/padding/);
    
    await expect(cards[0].closest('[class*="p-"]')).not.toHaveClass('p-3', 'p-4', 'p-6');
    await expect(cards[1].closest('[class*="p-"]')).toHaveClass('p-3');
    await expect(cards[2].closest('[class*="p-"]')).toHaveClass('p-4');
    await expect(cards[3].closest('[class*="p-"]')).toHaveClass('p-6');
  },
};

export const ProductCard: Story = {
  render: () => (
    <Card variant="elevated" className="w-80">
      <CardHeader>
        <img 
          src="https://via.placeholder.com/320x180" 
          alt="Product"
          className="w-full h-32 object-cover rounded-t-lg -m-4 mb-0"
        />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Product Title</h3>
        <p className="text-neutral-600 mb-2">
          This is a detailed description of the product with its key features and benefits.
        </p>
        <div className="text-2xl font-bold text-primary-600">$99.99</div>
      </CardContent>
      <CardFooter className="justify-between">
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Add to Cart
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Buy Now
        </button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await expect(canvas.getByText('Product Title')).toBeInTheDocument();
    await expect(canvas.getByText('$99.99')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Buy Now' })).toBeInTheDocument();
  },
};

export const ProfileCard: Story = {
  render: () => (
    <Card variant="outlined" className="w-80">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <h3 className="text-lg font-semibold">John Doe</h3>
            <p className="text-sm text-neutral-500">Software Engineer</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">
          Passionate about creating great user experiences and building scalable applications.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200">
            Follow
          </button>
          <button className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600">
            Message
          </button>
        </div>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await expect(canvas.getByText('John Doe')).toBeInTheDocument();
    await expect(canvas.getByText('Software Engineer')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Message' })).toBeInTheDocument();
  },
};
`;
}
