# Full Workflow Example: Modern Tech Startup Design System

This example demonstrates the complete end-to-end workflow from inspiration to component implementation.

## Step 1: Generate Design System from Inspiration

```bash
# Generate from Stripe's design (excellent example of modern fintech design)
npx inspiration-to-system \
  --url "https://stripe.com" \
  --brand "trustworthy, professional, modern" \
  --industry "fintech" \
  --audience "developers and business owners" \
  --style "modern,professional" \
  --colors "#635bff,#00d924,#fa755a" \
  --accessibility "enterprise" \
  --output "./stripe-inspired-system"

# This generates:
# - Design tokens extracted from Stripe's visual style
# - Design principles aligned with fintech best practices
# - Component plan prioritizing trust and usability
# - Complete project structure ready for development
```

## Step 2: Review Generated Assets

```bash
cd stripe-inspired-system

# Check the generated tokens
cat src/tokens/tokens.json

# Review design principles
cat PRINCIPLES.md

# Check component implementation plan
cat COMPONENT_PLAN.md
```

## Step 3: Use MCP Server for Component Implementation

```bash
# Start the MCP server
npm run mcp-server

# Generate a Button component prompt
mcp-client generate-component-prompt \
  --component "Button" \
  --tokens "./src/tokens/tokens.json" \
  --principles "./PRINCIPLES.md"

# Generate a Card component prompt
mcp-client generate-component-prompt \
  --component "Card" \
  --tokens "./src/tokens/tokens.json" \
  --principles "./PRINCIPLES.md"

# Generate an Input component prompt
mcp-client generate-component-prompt \
  --component "Input" \
  --tokens "./src/tokens/tokens.json" \
  --principles "./PRINCIPLES.md"
```

## Step 4: Implement Components

Based on the MCP-generated prompts, implement your components:

```typescript
// src/components/Button.tsx
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## Step 5: Create Storybook Stories

```typescript
// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Button',
  },
};
```

## Step 6: Launch Design System

```bash
# Install dependencies
npm install

# Start Storybook
npm run storybook

# Build for production
npm run build
```

## Generated Metadata

The workflow generates comprehensive metadata:

```json
{
  "version": "1.0.0",
  "generatedAt": "2024-01-20T10:30:00.000Z",
  "inspiration": {
    "websiteUrl": "https://stripe.com",
    "brandKeywords": ["trustworthy", "professional", "modern"],
    "industryType": "fintech",
    "targetUsers": "developers and business owners",
    "stylePreferences": ["modern", "professional"],
    "colorPreferences": ["#635bff", "#00d924", "#fa755a"],
    "accessibility": "enterprise"
  },
  "tokens": {
    "colors": { "primary": "#635bff", "success": "#00d924", "warning": "#fa755a" },
    "typography": { "fonts": ["Inter", "SF Pro Display"] },
    "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px" }
  },
  "principles": {
    "brandIdentity": "trustworthy, professional, modern",
    "targetAudience": "developers and business owners",
    "coreValues": ["Trust", "Reliability", "Simplicity"]
  },
  "componentPlan": {
    "totalComponents": 24,
    "estimatedDuration": "3-4 weeks",
    "phases": [
      {
        "name": "Foundation",
        "duration": "1 week",
        "components": ["Button", "Input", "Card"],
        "priority": "high"
      }
    ]
  },
  "workflow": "inspiration-to-system"
}
```

## Benefits of This Workflow

1. **Rapid Prototyping** - Go from inspiration to working design system in minutes
2. **Consistency** - AI ensures cohesive design decisions across all components
3. **Best Practices** - Generated code follows accessibility and usability standards
4. **Documentation** - Complete documentation generated automatically
5. **Scalability** - Structure supports long-term maintenance and growth

## Next Steps

1. **Customize** - Refine the generated tokens and principles to match your specific needs
2. **Extend** - Use MCP tools to generate additional components
3. **Integrate** - Deploy to your applications using your preferred bundler
4. **Evolve** - Use the metadata to track changes and maintain consistency over time

This workflow transforms hours of design system setup into a single command, letting you focus on building great products rather than configuring tooling.
