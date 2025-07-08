import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { Modal, ModalHeader, ModalContent, ModalFooter } from './Modal.js';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible modal component with header, content, and footer sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    variant: {
      control: 'select',
      options: ['default', 'centered', 'top'],
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to manage modal state
const ModalWithState = ({ children, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
      >
        Open Modal
      </button>
      <Modal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children}
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <ModalWithState {...args}>
      <ModalHeader>
        <h2 className="text-xl font-semibold">Default Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is the default modal content. It can contain any React elements.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Confirm
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  args: {
    size: 'md',
    variant: 'default',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    showCloseButton: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Modal should be open
    await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  },
};

export const Small: Story = {
  render: () => (
    <ModalWithState size="sm">
      <ModalHeader>
        <h2 className="text-lg font-semibold">Small Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is a small modal with limited content.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          OK
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = document.querySelector('[role="dialog"]');
    await expect(modal).toHaveClass('max-w-sm');
  },
};

export const Large: Story = {
  render: () => (
    <ModalWithState size="lg">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Large Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is a large modal with more content space.</p>
        <p>It can contain multiple paragraphs and more complex layouts.</p>
        <div className="mt-4 p-4 bg-neutral-50 rounded-md">
          <h3 className="font-medium mb-2">Additional Content</h3>
          <p>More content can be added here as needed.</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Save
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = document.querySelector('[role="dialog"]');
    await expect(modal).toHaveClass('max-w-lg');
  },
};

export const TopAligned: Story = {
  render: () => (
    <ModalWithState variant="top">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Top Aligned Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This modal appears at the top of the screen instead of being centered.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          OK
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modalOverlay = document.querySelector('[role="dialog"]')?.parentElement;
    await expect(modalOverlay).toHaveClass('items-start', 'pt-20');
  },
};

export const WithoutCloseButton: Story = {
  render: () => (
    <ModalWithState showCloseButton={false}>
      <ModalHeader>
        <h2 className="text-xl font-semibold">No Close Button</h2>
      </ModalHeader>
      <ModalContent>
        <p>This modal doesn't have a close button in the top-right corner.</p>
        <p>You can only close it by clicking the cancel button or pressing Escape.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Should not have close button
    await expect(document.querySelector('[aria-label="Close modal"]')).not.toBeInTheDocument();
  },
};

export const ConfirmationDialog: Story = {
  render: () => (
    <ModalWithState size="sm" closeOnOverlayClick={false}>
      <ModalHeader>
        <h2 className="text-lg font-semibold text-semantic-error">Delete Item</h2>
      </ModalHeader>
      <ModalContent>
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-semantic-error text-white rounded-md hover:bg-red-600">
          Delete
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    await expect(document.querySelector('.text-semantic-error')).toBeInTheDocument();
  },
};

export const FormModal: Story = {
  render: () => (
    <ModalWithState size="md">
      <ModalHeader>
        <h2 className="text-xl font-semibold">User Profile</h2>
      </ModalHeader>
      <ModalContent>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bio
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Tell us about yourself"
            />
          </div>
        </form>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Save Profile
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Check if form elements are present
    const nameInput = document.querySelector('input[placeholder="Enter your name"]');
    const emailInput = document.querySelector('input[placeholder="Enter your email"]');
    const bioTextarea = document.querySelector('textarea[placeholder="Tell us about yourself"]');
    
    await expect(nameInput).toBeInTheDocument();
    await expect(emailInput).toBeInTheDocument();
    await expect(bioTextarea).toBeInTheDocument();
  },
};

export const LongContent: Story = {
  render: () => (
    <ModalWithState size="lg">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Terms of Service</h2>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.</p>
          <p>Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
          <p>Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
          <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Decline
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Accept
        </button>
      </ModalFooter>
    </ModalWithState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    // Check if content is scrollable
    const modalContent = document.querySelector('.overflow-y-auto');
    await expect(modalContent).toBeInTheDocument();
  },
};
