import { W3CDesignTokens } from '../../tokens.js';
import { ComponentGeneratorOptions } from '../factory.js';

export interface GeneratedFiles {
  [filename: string]: string;
}

export async function generateInput(
  tokens: W3CDesignTokens,
  options: ComponentGeneratorOptions
): Promise<GeneratedFiles> {
  const files: GeneratedFiles = {};

  // Generate the main Input component
  files['Input.tsx'] = generateInputComponent(tokens, options);

  // Generate tests if requested
  if (options.generateTests) {
    files['Input.test.tsx'] = generateInputTest(tokens, options);
  }

  // Generate stories if requested
  if (options.generateStories) {
    files['Input.stories.tsx'] = generateInputStories(tokens, options);
  }

  return files;
}

function generateInputComponent(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React from 'react';
import { cn } from '../../utils/cn.js';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    fullWidth = false,
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? \`\${inputId}-error\` : undefined;
    const helperTextId = helperText ? \`\${inputId}-helper\` : undefined;

    const baseStyles = [
      'flex rounded-md border bg-white px-3 py-2 text-sm',
      'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors duration-200'
    ];

    const variantStyles = {
      default: [
        'border-neutral-200 focus-visible:ring-primary-500',
        'hover:border-neutral-300 focus:border-primary-500'
      ],
      error: [
        'border-semantic-error focus-visible:ring-semantic-error',
        'hover:border-red-400 focus:border-semantic-error'
      ],
      success: [
        'border-semantic-success focus-visible:ring-semantic-success',
        'hover:border-green-400 focus:border-semantic-success'
      ]
    };

    const sizeStyles = {
      sm: 'h-8 px-2 text-sm',
      md: 'h-10 px-3 text-base',
      lg: 'h-12 px-4 text-lg'
    };

    const containerStyles = cn(
      'relative',
      fullWidth && 'w-full'
    );

    const inputStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      startIcon && 'pl-10',
      endIcon && 'pr-10',
      fullWidth && 'w-full',
      className
    );

    const iconStyles = cn(
      'absolute top-1/2 transform -translate-y-1/2 text-neutral-400',
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-5 h-5',
      size === 'lg' && 'w-6 h-6'
    );

    return (
      <div className={containerStyles}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              variant === 'error' ? 'text-semantic-error' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className={cn(iconStyles, 'left-3')}>
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            aria-describedby={cn(
              errorId,
              helperTextId
            )}
            aria-invalid={variant === 'error' ? 'true' : 'false'}
            {...props}
          />
          {endIcon && (
            <div className={cn(iconStyles, 'right-3')}>
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-semantic-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperTextId} className="mt-1 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
`;
}

function generateInputTest(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import React from 'react';
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
`;
}

function generateInputStories(tokens: W3CDesignTokens, options: ComponentGeneratorOptions): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Input } from './Input.js';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with validation states and customization options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    variant: 'default',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveClass('border-neutral-200');
    
    // Test typing interaction
    await userEvent.type(input, 'Hello World');
    await expect(input).toHaveValue('Hello World');
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
    type: 'email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email Address');
    const input = canvas.getByRole('textbox');
    
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveAttribute('for', input.id);
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    variant: 'error',
    error: 'Password must be at least 8 characters long',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    const errorMessage = canvas.getByText('Password must be at least 8 characters long');
    
    await expect(input).toHaveClass('border-semantic-error');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    variant: 'success',
    defaultValue: 'john_doe',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    await expect(input).toHaveClass('border-semantic-success');
    await expect(input).toHaveValue('john_doe');
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    helperText: 'Write a brief description (max 160 characters)',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    const helperText = canvas.getByText('Write a brief description (max 160 characters)');
    
    await expect(helperText).toBeInTheDocument();
    await expect(input).toHaveAttribute('aria-describedby', helperText.id);
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    
    await expect(inputs[0]).toHaveClass('h-8');
    await expect(inputs[1]).toHaveClass('h-10');
    await expect(inputs[2]).toHaveClass('h-12');
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <Input
        placeholder="Search..."
        startIcon={
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
      <Input
        placeholder="Password"
        type="password"
        endIcon={
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    
    await expect(inputs[0]).toHaveClass('pl-10');
    await expect(inputs[1]).toHaveClass('pr-10');
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: 'Full width input',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    await expect(input).toHaveClass('w-full');
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    await expect(input).toBeDisabled();
    await expect(input).toHaveClass('opacity-50');
  },
};
`;
}
