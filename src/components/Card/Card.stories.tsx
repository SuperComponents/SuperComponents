import type { Meta, StoryObj } from '@storybook/react';
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
