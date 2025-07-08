import { W3CDesignTokens } from '../../tokens.js';
import { ComponentGeneratorOptions } from '../factory.js';

export interface GeneratedFiles {
  [filename: string]: string;
}

export async function generateButton(
  tokens: W3CDesignTokens,
  options: ComponentGeneratorOptions
): Promise<GeneratedFiles> {
  const files: GeneratedFiles = {};

  // Generate the main Button component
  files['Button.tsx'] = generateButtonComponent(tokens, options);

  // Generate tests if requested
  if (options.generateTests) {
    files['Button.test.tsx'] = generateButtonTest(tokens, options);
  }

  // Generate stories if requested
  if (options.generateStories) {
    files['Button.stories.tsx'] = generateButtonStories(tokens, options);
  }

  return files;
}

function generateButtonComponent(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  const colorTokens = tokens.color as any;
  const spacingTokens = tokens.spacing as any;
  const borderRadiusTokens = tokens.borderRadius as any;
  const typographyTokens = tokens.typography as any;
  const shadowTokens = tokens.shadow as any;

  return `import React from 'react';
import { cn } from '../../utils/cn.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    disabled = false, 
    loading = false,
    children,
    ...props 
  }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden'
    ];

    const variantStyles = {
      default: [
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        'border border-neutral-200 hover:border-neutral-300'
      ],
      primary: [
        'bg-primary-500 text-white hover:bg-primary-600',
        'shadow-sm hover:shadow-md'
      ],
      secondary: [
        'bg-secondary-500 text-white hover:bg-secondary-600',
        'shadow-sm hover:shadow-md'
      ],
      destructive: [
        'bg-semantic-error text-white hover:bg-red-600',
        'shadow-sm hover:shadow-md'
      ],
      outline: [
        'border border-neutral-200 bg-transparent hover:bg-neutral-50',
        'text-neutral-900 hover:text-neutral-950'
      ],
      ghost: [
        'hover:bg-neutral-100 hover:text-neutral-900',
        'text-neutral-600'
      ]
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg'
    };

    const styles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    return (
      <button
        className={styles}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
`;
}

function generateButtonTest(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-neutral-100');
  });

  it('renders with primary variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: 'Primary' });
    expect(button).toHaveClass('bg-primary-500');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('bg-secondary-500');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });

  it('handles loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('passes additional props to button element', () => {
    render(<Button data-testid="custom-button">Test</Button>);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
`;
}

function generateButtonStories(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button.js';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-neutral-100');
    
    // Test hover interaction
    await userEvent.hover(button);
    await expect(button).toHaveClass('hover:bg-neutral-200');
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-primary-500');
    
    // Test click interaction
    await userEvent.click(button);
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-secondary-500');
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-semantic-error');
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('border-neutral-200');
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('text-neutral-600');
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    
    await expect(buttons[0]).toHaveClass('h-8');
    await expect(buttons[1]).toHaveClass('h-10');
    await expect(buttons[2]).toHaveClass('h-12');
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeDisabled();
    await expect(button.querySelector('svg')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeDisabled();
    await expect(button).toHaveClass('opacity-50');
  },
};
`;
}
