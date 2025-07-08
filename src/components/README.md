# SuperComponents - Generated Component Library

This directory contains the generated atomic components for the SuperComponents library. All components are built with React, TypeScript, and Tailwind CSS, following accessibility best practices.

## Available Components

### Button
Interactive button component with multiple variants and sizes.

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `children`: React.ReactNode

**Example:**
```tsx
import { Button } from '@/components';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me!
</Button>
```

### Input
Form input component with validation states and different types.

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
- `variant`: 'default' | 'error' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `placeholder`: string
- `value`: string
- `onChange`: (event: React.ChangeEvent<HTMLInputElement>) => void

**Example:**
```tsx
import { Input } from '@/components';

<Input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Card
Container component for content grouping with different visual styles.

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated'
- `padding`: 'sm' | 'md' | 'lg'
- `children`: React.ReactNode

**Example:**
```tsx
import { Card } from '@/components';

<Card variant="outlined" padding="lg">
  <h2>Card Title</h2>
  <p>Card content goes here...</p>
</Card>
```

### Modal
Modal dialog component with overlay, focus management, and accessibility features.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `variant`: 'default' | 'centered' | 'top'
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `showCloseButton`: boolean (default: true)
- `children`: React.ReactNode

**Example:**
```tsx
import { Modal, Button } from '@/components';

<Modal isOpen={isOpen} onClose={handleClose} size="md">
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Modal Title</h3>
    <p>Modal content...</p>
    <div className="flex gap-2 justify-end">
      <Button onClick={handleClose}>Close</Button>
    </div>
  </div>
</Modal>
```

## Design Tokens

All components use design tokens via CSS variables and Tailwind classes:

- **Colors**: Primary, secondary, neutral, and semantic colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corners
- **Shadows**: Elevation effects
- **Transitions**: Smooth animations

## Accessibility Features

All components include:

- **ARIA attributes** for screen readers
- **Keyboard navigation** support
- **Focus management** with visible focus indicators
- **Semantic HTML** structure
- **Color contrast** compliance (WCAG 2.1 AA)

## Testing

Each component includes:

- **Unit tests** with Jest and React Testing Library
- **Snapshot tests** for visual regression testing
- **Accessibility tests** to ensure compliance
- **Interaction tests** for user behaviors

Run tests with:
```bash
npm test
```

## Storybook

Each component has comprehensive Storybook stories with:

- **Interactive examples** for all variants
- **Play functions** for automated testing
- **Documentation** with prop controls
- **Accessibility addon** integration

## Development

Components are generated using the ComponentFactory class, which:

1. Reads design tokens from the token generator
2. Creates component implementations with proper TypeScript types
3. Generates comprehensive test suites
4. Creates interactive Storybook stories
5. Follows accessibility best practices

To regenerate components:
```bash
cd src/generators/components
npx tsx generate.ts
```

## Integration

Components are designed to work together seamlessly:

- Consistent design language across all components
- Shared design tokens and utilities
- Compatible sizing and spacing
- Unified accessibility patterns

Import all components from the main index:
```tsx
import { Button, Input, Card, Modal } from '@/components';
```

## Next Steps

This atomic component library provides the foundation for:

1. **Molecule components** (combining atoms)
2. **Organism components** (complex UI sections)
3. **Template components** (page layouts)
4. **Page components** (complete pages)

Each level builds upon the previous, creating a comprehensive design system.
