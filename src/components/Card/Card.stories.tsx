import type { Meta, StoryObj } from '@storybook/react'
import { expect, within, userEvent } from '@storybook/test'
import Card, { CardHeader, CardContent, CardFooter } from './Card'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible card component for displaying content in a structured container.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'elevated', 'interactive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
    imagePosition: {
      control: { type: 'select' },
      options: ['top', 'bottom'],
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader title="Card Title" subtitle="Card subtitle" />
        <CardContent>
          <p>
            This is the main content of the card. It can contain any React
            elements.
          </p>
        </CardContent>
        <CardFooter>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Action
          </button>
        </CardFooter>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByText('Card Title')
    const subtitle = canvas.getByText('Card subtitle')
    const content = canvas.getByText(/main content/i)

    await expect(title).toBeInTheDocument()
    await expect(subtitle).toBeInTheDocument()
    await expect(content).toBeInTheDocument()
  },
}

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-4xl">
      <Card variant="default">
        <CardHeader title="Default" subtitle="Standard card style" />
        <CardContent>Default variant with basic styling.</CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Outlined" subtitle="Emphasized border" />
        <CardContent>Outlined variant with thicker border.</CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader title="Elevated" subtitle="With shadow" />
        <CardContent>Elevated variant with drop shadow.</CardContent>
      </Card>

      <Card variant="interactive">
        <CardHeader title="Interactive" subtitle="Clickable card" />
        <CardContent>Interactive variant with hover effects.</CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cards = canvas.getAllByRole('button')

    await expect(cards).toHaveLength(1) // Only interactive card has button role
    await expect(cards[0]).toHaveAttribute('tabIndex', '0')
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader title="Small Card" />
        <CardContent>Compact size for minimal content.</CardContent>
      </Card>

      <Card size="md">
        <CardHeader title="Medium Card" />
        <CardContent>Standard size for most use cases.</CardContent>
      </Card>

      <Card size="lg">
        <CardHeader title="Large Card" />
        <CardContent>Larger size for detailed content.</CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cards = canvas.getAllByRole('generic')

    await expect(cards[0]).toHaveClass('max-w-sm')
    await expect(cards[1]).toHaveClass('max-w-md')
    await expect(cards[2]).toHaveClass('max-w-lg')
  },
}

export const WithImage: Story = {
  args: {
    image:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop',
    imageAlt: 'Sample image',
    children: (
      <>
        <CardHeader title="Card with Image" subtitle="Image at top" />
        <CardContent>
          <p>
            This card includes an image at the top. The image is responsive and
            maintains aspect ratio.
          </p>
        </CardContent>
        <CardFooter>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md">
            View Details
          </button>
        </CardFooter>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const image = canvas.getByRole('img')

    await expect(image).toBeInTheDocument()
    await expect(image).toHaveAttribute('alt', 'Sample image')
    await expect(image).toHaveClass('w-full', 'h-48', 'object-cover')
  },
}

export const WithAction: Story = {
  args: {
    children: (
      <>
        <CardHeader
          title="Card with Action"
          subtitle="Action button in header"
          action={
            <button className="text-primary-600 hover:text-primary-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          }
        />
        <CardContent>
          <p>This card has an action button in the header area.</p>
        </CardContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const actionButton = canvas.getByRole('button')

    await expect(actionButton).toBeInTheDocument()
    await userEvent.click(actionButton)
  },
}

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    onClick: () => alert('Card clicked!'),
    children: (
      <>
        <CardHeader title="Interactive Card" subtitle="Click me!" />
        <CardContent>
          <p>
            This card is interactive and can be clicked. It has focus states and
            hover effects.
          </p>
        </CardContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('button')

    await expect(card).toBeInTheDocument()
    await expect(card).toHaveClass('cursor-pointer')

    // Test focus
    await userEvent.tab()
    await expect(card).toHaveFocus()

    // Test hover
    await userEvent.hover(card)
    await expect(card).toHaveClass('hover:shadow-md')
  },
}

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-4">
        <CardHeader title="Custom Padding" subtitle="No default padding" />
        <CardContent>
          <p>
            This card has no default padding, allowing for custom spacing
            control.
          </p>
        </CardContent>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('generic')

    await expect(card).not.toHaveClass('p-4')
  },
}

export const ProductCard: Story = {
  render: () => (
    <Card
      variant="elevated"
      size="sm"
      image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
      imageAlt="Product image"
    >
      <CardHeader title="Premium Sneakers" subtitle="$129.99" />
      <CardContent>
        <p className="text-sm">
          High-quality sneakers with premium materials and comfort.
        </p>
        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">{'★'.repeat(5)}</div>
          <span className="text-sm text-neutral-500 ml-2">(4.8)</span>
        </div>
      </CardContent>
      <CardFooter>
        <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Add to Cart
        </button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByText('Premium Sneakers')
    const price = canvas.getByText('$129.99')
    const rating = canvas.getByText('(4.8)')
    const addToCartBtn = canvas.getByRole('button', { name: /add to cart/i })

    await expect(title).toBeInTheDocument()
    await expect(price).toBeInTheDocument()
    await expect(rating).toBeInTheDocument()
    await expect(addToCartBtn).toBeInTheDocument()
  },
}

export const Accessibility: Story = {
  args: {
    variant: 'interactive',
    role: 'article',
    'aria-label': 'Article card',
    children: (
      <>
        <CardHeader title="Accessibility Features" />
        <CardContent>
          <p>
            This card demonstrates accessibility features including proper ARIA
            labels and keyboard navigation.
          </p>
        </CardContent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('article')

    await expect(card).toHaveAttribute('aria-label', 'Article card')

    // Test keyboard navigation
    await userEvent.tab()
    await expect(card).toHaveFocus()

    // Test enter key
    await userEvent.keyboard('{Enter}')
  },
}
