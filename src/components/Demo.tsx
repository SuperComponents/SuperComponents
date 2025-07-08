import React, { useState } from 'react';
import { Button } from './Button/Button.js';
import { Input } from './Input/Input.js';
import { Card } from './Card/Card.js';
import { Modal } from './Modal/Modal.js';

export const ComponentDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900">SuperComponents Demo</h1>
      
      {/* Button Examples */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-xl font-semibold mb-4">Button Component</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex gap-4 items-center">
            <Button loading>Loading...</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Card>

      {/* Input Examples */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-xl font-semibold mb-4">Input Component</h2>
        <div className="space-y-4 max-w-md">
          <Input
            placeholder="Enter your name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            placeholder="Email address"
            type="email"
            variant="default"
          />
          <Input
            placeholder="Error state"
            variant="error"
          />
          <Input
            placeholder="Success state"
            variant="success"
          />
          <Input
            placeholder="Disabled input"
            disabled
          />
        </div>
      </Card>

      {/* Card Examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default" padding="md">
          <h3 className="font-semibold mb-2">Default Card</h3>
          <p className="text-neutral-600">This is a default card with medium padding.</p>
        </Card>
        <Card variant="outlined" padding="md">
          <h3 className="font-semibold mb-2">Outlined Card</h3>
          <p className="text-neutral-600">This card has a border outline.</p>
        </Card>
        <Card variant="elevated" padding="md">
          <h3 className="font-semibold mb-2">Elevated Card</h3>
          <p className="text-neutral-600">This card has a shadow elevation.</p>
        </Card>
      </div>

      {/* Modal Example */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-xl font-semibold mb-4">Modal Component</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="md"
        >
          <Modal.Header onClose={() => setIsModalOpen(false)}>
            <h3 className="text-lg font-semibold">Modal Title</h3>
          </Modal.Header>
          <Modal.Content>
            <p className="mb-4">
              This is a modal dialog. It demonstrates the modal component with proper
              focus management and accessibility features.
            </p>
            <Input placeholder="Type something..." />
          </Modal.Content>
          <Modal.Footer>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Card>
    </div>
  );
};

export default ComponentDemo;
