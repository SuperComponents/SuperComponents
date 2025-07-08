import type { Meta, StoryObj } from '@storybook/react';
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
