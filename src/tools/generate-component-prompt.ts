interface GenerateComponentPromptArgs {
  componentName: string
  principles?: string
  tokens?: string
}

export async function generateComponentPromptTool(
  args?: GenerateComponentPromptArgs
) {
  try {
    if (!args?.componentName) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Please specify a component name to generate an implementation prompt for.',
          },
        ],
        isError: true,
      }
    }

    const { componentName, principles, tokens } = args

    // Component-specific configurations
    const componentConfigs: Record<string, any> = {
      Button: {
        props: [
          'variant',
          'size',
          'disabled',
          'loading',
          'fullWidth',
          'icon',
          'onClick',
        ],
        variants: ['primary', 'secondary', 'danger', 'ghost', 'link'],
        sizes: ['sm', 'md', 'lg'],
        a11y: [
          'aria-label',
          'aria-pressed',
          'aria-disabled',
          'keyboard navigation',
        ],
      },
      Input: {
        props: [
          'type',
          'value',
          'placeholder',
          'disabled',
          'error',
          'icon',
          'onChange',
        ],
        types: ['text', 'email', 'password', 'number', 'search'],
        states: ['default', 'focus', 'error', 'disabled'],
        a11y: ['aria-label', 'aria-describedby', 'aria-invalid', 'role'],
      },
      Card: {
        props: [
          'title',
          'description',
          'image',
          'actions',
          'variant',
          'padding',
        ],
        variants: ['default', 'bordered', 'elevated', 'interactive'],
        layout: ['vertical', 'horizontal'],
        a11y: ['semantic HTML', 'proper heading hierarchy'],
      },
    }

    const config = componentConfigs[componentName] || {
      props: ['children', 'className'],
      variants: ['default'],
      a11y: ['proper ARIA attributes'],
    }

    const designContext = principles
      ? `
Design Principles to Follow:
${principles}
`
      : ''

    const tokensContext = tokens
      ? `
Use these design tokens from your Tailwind v4 theme:
${tokens}
`
      : ''

    const promptText = `## Implementation Prompt for ${componentName} Component

Please implement a ${componentName} component with the following specifications:
${designContext}${tokensContext}

### Component Requirements:

**Props Interface:**
\`\`\`typescript
interface ${componentName}Props {
  ${config.props?.map((prop: string) => `${prop}?: ${getPropType(prop)};`).join('\n  ')}
  className?: string;
  children?: React.ReactNode;
}
\`\`\`

**Variants:**
${config.variants?.map((v: string) => `- ${v}`).join('\n')}

**Accessibility Requirements:**
${config.a11y?.map((a: string) => `- ${a}`).join('\n')}

**Implementation Guidelines:**

1. Create the component in \`src/components/${componentName}/${componentName}.tsx\`
2. Use Tailwind v4 classes with CSS variables from the theme
3. Implement all variants using a variant prop
4. Ensure full keyboard navigation support
5. Add proper TypeScript types
6. Include JSDoc comments for props

**Example Usage:**
\`\`\`tsx
<${componentName} variant="primary" size="md">
  Click me
</${componentName}>
\`\`\`

**Storybook Story:**
Create a story file at \`src/components/${componentName}/${componentName}.stories.tsx\` that:
- Shows all variants
- Demonstrates all props
- Includes interactive controls
- Has accessibility checks

**Testing:**
- Test all variants render correctly
- Test keyboard navigation
- Test ARIA attributes
- Test event handlers

Please implement this component following React best practices and ensure it's production-ready.`

    return {
      content: [
        {
          type: 'text',
          text: promptText,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Failed to generate component prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

function getPropType(prop: string): string {
  const propTypes: Record<string, string> = {
    variant: 'string',
    size: 'string',
    disabled: 'boolean',
    loading: 'boolean',
    fullWidth: 'boolean',
    icon: 'React.ReactNode',
    onClick: '() => void',
    onChange: '(value: string) => void',
    value: 'string',
    placeholder: 'string',
    error: 'string | boolean',
    type: 'string',
    title: 'string',
    description: 'string',
    image: 'string',
    actions: 'React.ReactNode',
    padding: 'string',
  }
  return propTypes[prop] || 'any'
}
