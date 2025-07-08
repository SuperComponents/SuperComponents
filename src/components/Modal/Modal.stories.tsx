import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import { useState } from 'react';
import Modal, { ModalHeader, ModalContent, ModalFooter } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A modal dialog component with accessibility features and customizable content.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full']
    },
    closeOnOverlay: {
      control: { type: 'boolean' }
    },
    closeOnEscape: {
      control: { type: 'boolean' }
    },
    showCloseButton: {
      control: { type: 'boolean' }
    }
  }
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle modal state
const ModalWrapper = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Open Modal
      </button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...props}
      >
        {children}
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ModalWrapper title="Default Modal">
      <p>This is a basic modal with default settings.</p>
    </ModalWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = canvas.getByRole('dialog');
    await expect(modal).toBeInTheDocument();
    
    const title = canvas.getByText('Default Modal');
    await expect(title).toBeInTheDocument();
  }
};

export const WithDescription: Story = {
  render: () => (
    <ModalWrapper 
      title="Modal with Description" 
      description="This modal includes a description under the title"
    >
      <p>Modal content goes here. The description provides additional context about what this modal is for.</p>
    </ModalWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const description = canvas.getByText('This modal includes a description under the title');
    await expect(description).toBeInTheDocument();
  }
};

export const WithFooter: Story = {
  render: () => (
    <ModalWrapper 
      title="Modal with Footer"
      footer={
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Save
          </button>
        </div>
      }
    >
      <p>This modal has action buttons in the footer area.</p>
    </ModalWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const cancelButton = canvas.getByText('Cancel');
    const saveButton = canvas.getByText('Save');
    
    await expect(cancelButton).toBeInTheDocument();
    await expect(saveButton).toBeInTheDocument();
  }
};

export const Sizes: Story = {
  render: () => (
    <div className="space-x-4">
      <ModalWrapper size="sm" title="Small Modal">
        <p>This is a small modal.</p>
      </ModalWrapper>
      
      <ModalWrapper size="md" title="Medium Modal">
        <p>This is a medium modal (default size).</p>
      </ModalWrapper>
      
      <ModalWrapper size="lg" title="Large Modal">
        <p>This is a large modal with more space for content.</p>
      </ModalWrapper>
      
      <ModalWrapper size="xl" title="Extra Large Modal">
        <p>This is an extra large modal for detailed content.</p>
      </ModalWrapper>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByText(/Open Modal/i);
    
    await expect(buttons).toHaveLength(4);
    
    // Test small modal
    await userEvent.click(buttons[0]);
    const smallModal = canvas.getByRole('dialog');
    await expect(smallModal).toHaveClass('max-w-sm');
    
    // Close and test large modal
    await userEvent.keyboard('{Escape}');
    await userEvent.click(buttons[2]);
    const largeModal = canvas.getByRole('dialog');
    await expect(largeModal).toHaveClass('max-w-lg');
  }
};

export const CloseOptions: Story = {
  render: () => (
    <div className="space-x-4">
      <ModalWrapper 
        title="No Overlay Close"
        closeOnOverlay={false}
      >
        <p>This modal cannot be closed by clicking the overlay.</p>
      </ModalWrapper>
      
      <ModalWrapper 
        title="No Escape Close"
        closeOnEscape={false}
      >
        <p>This modal cannot be closed with the Escape key.</p>
      </ModalWrapper>
      
      <ModalWrapper 
        title="No Close Button"
        showCloseButton={false}
      >
        <p>This modal has no close button in the header.</p>
      </ModalWrapper>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByText(/Open Modal/i);
    
    // Test no close button
    await userEvent.click(buttons[2]);
    const closeButton = canvas.queryByLabelText('Close modal');
    await expect(closeButton).not.toBeInTheDocument();
  }
};

export const ComplexContent: Story = {
  render: () => (
    <ModalWrapper 
      title="User Profile" 
      description="Edit your profile information"
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <button className="px-4 py-2 text-red-600 hover:text-red-700">
            Delete Account
          </button>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
              Cancel
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            defaultValue="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            defaultValue="john@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Bio
          </label>
          <textarea
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            defaultValue="Software developer passionate about creating great user experiences."
          />
        </div>
      </div>
    </ModalWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const nameInput = canvas.getByDisplayValue('John Doe');
    const emailInput = canvas.getByDisplayValue('john@example.com');
    const bioTextarea = canvas.getByDisplayValue(/Software developer/);
    
    await expect(nameInput).toBeInTheDocument();
    await expect(emailInput).toBeInTheDocument();
    await expect(bioTextarea).toBeInTheDocument();
    
    // Test form interaction
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');
    await expect(nameInput).toHaveValue('Jane Doe');
  }
};

export const ScrollableContent: Story = {
  render: () => (
    <ModalWrapper title="Terms of Service" size="lg">
      <div className="space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>
            <h3 className="font-semibold text-neutral-900 mb-2">
              Section {i + 1}
            </h3>
            <p className="text-neutral-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        ))}
      </div>
    </ModalWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = canvas.getByRole('dialog');
    const scrollableContent = modal.querySelector('.overflow-y-auto');
    
    await expect(scrollableContent).toBeInTheDocument();
    await expect(scrollableContent).toHaveClass('max-h-[calc(90vh-8rem)]');
  }
};

export const Accessibility: Story = {
  render: () => (
    <ModalWrapper 
      title="Accessible Modal"
      description="This modal demonstrates accessibility features"
    >
      <div className="space-y-4">
        <p>This modal includes proper ARIA attributes and keyboard navigation.</p>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            First Input
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Tab to navigate"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Second Input
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Focus is trapped in modal"
          />
        </div>
      </div>
    </ModalWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    
    await userEvent.click(openButton);
    
    const modal = canvas.getByRole('dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby');
    await expect(modal).toHaveAttribute('aria-describedby');
    
    // Test keyboard navigation
    await userEvent.tab();
    const closeButton = canvas.getByLabelText('Close modal');
    await expect(closeButton).toHaveFocus();
    
    // Test escape key
    await userEvent.keyboard('{Escape}');
    await expect(modal).not.toBeInTheDocument();
  }
};
