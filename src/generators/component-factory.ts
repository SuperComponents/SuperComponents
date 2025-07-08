import { promises as fs } from 'fs';
import path from 'path';

export interface ComponentFactoryOptions {
  projectPath: string;
  componentsPath?: string;
  storiesPath?: string;
  testsPath?: string;
}

export class ComponentFactory {
  private options: ComponentFactoryOptions;

  constructor(options: ComponentFactoryOptions) {
    this.options = {
      componentsPath: 'src/components',
      storiesPath: 'src/stories',
      testsPath: 'src/tests',
      ...options
    };
  }

  /**
   * Scaffold basic component files for Button, Input, Card, Modal
   */
  async scaffoldComponents(): Promise<void> {
    const components = ['Button', 'Input', 'Card', 'Modal'];
    
    // Create directories
    await fs.mkdir(path.join(this.options.projectPath, this.options.componentsPath!), { recursive: true });
    await fs.mkdir(path.join(this.options.projectPath, this.options.storiesPath!), { recursive: true });
    await fs.mkdir(path.join(this.options.projectPath, this.options.testsPath!), { recursive: true });

    // Generate each component
    for (const componentName of components) {
      await this.generateComponent(componentName);
    }
  }

  private async generateComponent(componentName: string): Promise<void> {
    const componentPath = path.join(this.options.projectPath, this.options.componentsPath!, `${componentName}.tsx`);
    const storyPath = path.join(this.options.projectPath, this.options.storiesPath!, `${componentName}.stories.tsx`);
    const testPath = path.join(this.options.projectPath, this.options.testsPath!, `${componentName}.test.tsx`);

    // Generate component file
    await fs.writeFile(componentPath, this.generateComponentFile(componentName));
    
    // Generate stories file
    await fs.writeFile(storyPath, this.generateStoriesFile(componentName));
    
    // Generate test file
    await fs.writeFile(testPath, this.generateTestFile(componentName));
  }

  private generateComponentFile(componentName: string): string {
    const props = this.getComponentProps(componentName);
    const template = this.getComponentTemplate(componentName);
    
    return `import React from 'react';
import { cn } from '../utils/cn';

export interface ${componentName}Props ${props} {
  className?: string;
}

export const ${componentName} = ({ className, ...props }: ${componentName}Props) => {
  return (
    ${template}
  );
};

${componentName}.displayName = '${componentName}';
`;
  }

  private generateStoriesFile(componentName: string): string {
    const stories = this.getComponentStories(componentName);
    
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from '../components/${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

${stories}
`;
  }

  private generateTestFile(componentName: string): string {
    const tests = this.getComponentTests(componentName);
    
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from '../components/${componentName}';

describe('${componentName}', () => {
${tests}
});
`;
  }

  private getComponentProps(componentName: string): string {
    switch (componentName) {
      case 'Button':
        return `extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}`;
      case 'Input':
        return `extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}`;
      case 'Card':
        return `extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}`;
      case 'Modal':
        return `extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}`;
      default:
        return `extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}`;
    }
  }

  private getComponentTemplate(componentName: string): string {
    switch (componentName) {
      case 'Button':
        return `<button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary-600 text-white hover:bg-primary-700': props.variant === 'primary',
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200': props.variant === 'secondary',
          'border border-gray-300 bg-white hover:bg-gray-50': props.variant === 'outline',
          'h-9 px-4 py-2': props.size === 'sm',
          'h-10 px-4 py-2': props.size === 'md',
          'h-11 px-6 py-3': props.size === 'lg',
        },
        className
      )}
      {...props}
    >
      {props.children}
    </button>`;
      case 'Input':
        return `<div className="space-y-2">
      {props.label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {props.label}
        </label>
      )}
      <input
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          props.error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {props.error && (
        <p className="text-sm text-red-600">{props.error}</p>
      )}
      {props.helperText && !props.error && (
        <p className="text-sm text-gray-500">{props.helperText}</p>
      )}
    </div>`;
      case 'Card':
        return `<div
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        className
      )}
      {...props}
    >
      {props.title && (
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold">{props.title}</h3>
        </div>
      )}
      <div className="p-6 pt-0">
        {props.children}
      </div>
    </div>`;
      case 'Modal':
        return `<>
      {props.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={props.onClose}
          />
          <div
            className={cn(
              'relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg',
              className
            )}
            {...props}
          >
            {props.title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{props.title}</h2>
                <button
                  onClick={props.onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {props.children}
          </div>
        </div>
      )}
    </>`;
      default:
        return `<div className={cn('', className)} {...props}>
      {props.children}
    </div>`;
    }
  }

  private getComponentStories(componentName: string): string {
    switch (componentName) {
      case 'Button':
        return `export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};`;
      case 'Input':
        return `export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters',
  },
};`;
      case 'Card':
        return `export const Default: Story = {
  args: {
    children: 'This is a card with some content.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'This is a card with a title and some content.',
  },
};`;
      case 'Modal':
        return `export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    children: 'This is a modal with some content.',
  },
};

export const WithTitle: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Modal Title',
    children: 'This is a modal with a title and some content.',
  },
};`;
      default:
        return `export const Default: Story = {
  args: {
    children: 'Component content',
  },
};`;
    }
  }

  private getComponentTests(componentName: string): string {
    switch (componentName) {
      case 'Button':
        return `  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });`;
      case 'Input':
        return `  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });`;
      case 'Card':
        return `  it('renders card with content', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });`;
      case 'Modal':
        return `  it('renders modal when open', () => {
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
  });`;
      default:
        return `  it('renders component with children', () => {
    render(<${componentName}>Test content</${componentName}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });`;
    }
  }
}
