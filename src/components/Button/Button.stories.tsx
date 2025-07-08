import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import Button from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile button component with multiple variants, sizes, and interactive states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive', 'ghost', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    isLoading: {
      control: { type: 'boolean' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /primary button/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveClass('bg-primary-600')

    await userEvent.click(button)
    await expect(button).toHaveClass('active:scale-95')
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /secondary button/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveClass('bg-secondary-600')
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /delete/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveClass('bg-red-600')
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /ghost button/i })

    await expect(button).toBeInTheDocument()
    await userEvent.hover(button)
    await expect(button).toHaveClass('hover:bg-neutral-100')
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /outline button/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveClass('border')
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const smallButton = canvas.getByRole('button', { name: /small/i })
    const mediumButton = canvas.getByRole('button', { name: /medium/i })
    const largeButton = canvas.getByRole('button', { name: /large/i })

    await expect(smallButton).toHaveClass('h-8')
    await expect(mediumButton).toHaveClass('h-10')
    await expect(largeButton).toHaveClass('h-12')
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /loading/i })
    const spinner = canvas.getByRole('button').querySelector('svg')

    await expect(button).toBeInTheDocument()
    await expect(button).toBeDisabled()
    await expect(spinner).toHaveClass('animate-spin')
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button
        leftIcon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 5l-7 7h4v6h6v-6h4l-7-7z" />
          </svg>
        }
      >
        Upload
      </Button>
      <Button
        variant="outline"
        rightIcon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l7-7H13V2H7v6H3l7 7z" />
          </svg>
        }
      >
        Download
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const uploadButton = canvas.getByRole('button', { name: /upload/i })
    const downloadButton = canvas.getByRole('button', { name: /download/i })

    await expect(uploadButton).toBeInTheDocument()
    await expect(downloadButton).toBeInTheDocument()

    const uploadIcon = uploadButton.querySelector('svg')
    const downloadIcon = downloadButton.querySelector('svg')

    await expect(uploadIcon).toBeInTheDocument()
    await expect(downloadIcon).toBeInTheDocument()
  },
}

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /full width button/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveClass('w-full')
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /disabled button/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toBeDisabled()
    await expect(button).toHaveClass('opacity-50')
  },
}

export const Accessibility: Story = {
  args: {
    'aria-label': 'Save document',
    children: 'Save',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /save document/i })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveAttribute('aria-label', 'Save document')

    // Test keyboard navigation
    button.focus()
    await expect(button).toHaveFocus()

    // Test enter key
    await userEvent.keyboard('{Enter}')
    await expect(button).toHaveClass('active:scale-95')
  },
}
