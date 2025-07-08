import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import Input from './Input'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible input component with validation states, icons, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    await expect(input).toBeInTheDocument()
    await expect(input).toHaveClass('border-neutral-200')

    await userEvent.click(input)
    await expect(input).toHaveFocus()
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText('Email Address')
    const input = canvas.getByRole('textbox')

    await expect(label).toBeInTheDocument()
    await expect(input).toHaveAttribute('type', 'email')

    await userEvent.click(label)
    await expect(input).toHaveFocus()
  },
}

export const WithError: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    error: 'Username is required',
    value: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    const error = canvas.getByRole('alert')

    await expect(input).toHaveClass('border-red-500')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(error).toHaveTextContent('Username is required')
  },
}

export const WithHelper: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helper: 'Must be at least 8 characters long',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Password')
    const helper = canvas.getByText('Must be at least 8 characters long')

    await expect(input).toHaveAttribute('type', 'password')
    await expect(helper).toBeInTheDocument()
    await expect(helper).toHaveClass('text-neutral-500')
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Valid Email',
    value: 'user@example.com',
    helper: 'Email format is valid',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    await expect(input).toHaveClass('border-green-500')
    await expect(input).toHaveValue('user@example.com')
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole('textbox')

    await expect(inputs[0]).toHaveClass('h-8')
    await expect(inputs[1]).toHaveClass('h-10')
    await expect(inputs[2]).toHaveClass('h-12')
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Search"
        placeholder="Search..."
        leftIcon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        }
      />
      <Input
        label="Amount"
        placeholder="0.00"
        type="number"
        rightIcon={<span className="text-neutral-400 text-sm">USD</span>}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole('textbox')
    const searchIcon = canvas
      .getByLabelText('Search')
      .parentElement?.querySelector('svg')
    const currencyIcon = canvas.getByText('USD')

    await expect(searchIcon).toBeInTheDocument()
    await expect(currencyIcon).toBeInTheDocument()
    await expect(inputs[0]).toHaveClass('pl-12')
    await expect(inputs[1]).toHaveClass('pr-12')
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
    value: 'Read only value',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    const label = canvas.getByText('Disabled Input')

    await expect(input).toBeDisabled()
    await expect(input).toHaveClass('opacity-50')
    await expect(label).toHaveClass('text-neutral-400')
  },
}

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Spans full container width',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const container = canvas.getByRole('textbox').closest('div')

    await expect(container).toHaveClass('w-full')
  },
}

export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="email@example.com" />
      <Input label="Password" type="password" placeholder="Password" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="Search" type="search" placeholder="Search..." />
      <Input label="URL" type="url" placeholder="https://example.com" />
      <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByLabelText('Email')
    const passwordInput = canvas.getByLabelText('Password')
    const numberInput = canvas.getByLabelText('Number')

    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(numberInput).toHaveAttribute('type', 'number')
  },
}

export const Accessibility: Story = {
  args: {
    label: 'Accessible Input',
    placeholder: 'Required field',
    required: true,
    'aria-describedby': 'input-description',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    await expect(input).toHaveAttribute('required')
    await expect(input).toHaveAttribute('aria-describedby')

    // Test keyboard navigation
    await userEvent.tab()
    await expect(input).toHaveFocus()

    // Test typing
    await userEvent.type(input, 'Test value')
    await expect(input).toHaveValue('Test value')
  },
}
