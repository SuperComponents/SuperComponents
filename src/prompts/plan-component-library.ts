import { DesignPrinciples, DesignTokens } from '../types/index.js'

interface PlanComponentLibraryArgs {
  principles?: DesignPrinciples
  tokens?: DesignTokens
}

export function planComponentLibraryPrompt(args?: PlanComponentLibraryArgs) {
  const principlesContext = args?.principles
    ? `
Based on your design principles:
- Brand: ${args.principles.brandIdentity}
- Audience: ${args.principles.targetAudience}
- Values: ${args.principles.coreValues.join(', ')}
- Goals: ${args.principles.designGoals.join(', ')}
`
    : ''

  const tokensContext = args?.tokens
    ? `
Your design tokens include:
- Colors: ${Object.keys(args.tokens.colors).join(', ')}
- Typography: ${args.tokens.typography.fonts.join(', ')}
- Spacing scale: ${Object.keys(args.tokens.spacing).join(', ')}
`
    : ''

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Let's plan your component library structure. ${principlesContext}${tokensContext}

I'll help you create a comprehensive component library plan following atomic design principles:

## Component Categories:

**Atoms** (Basic building blocks):
- Button
- Input
- Label
- Icon
- Badge
- Link
- Spinner

**Molecules** (Simple combinations):
- FormField (Label + Input + Error)
- Card
- Alert
- Toast
- Dropdown
- SearchBar

**Organisms** (Complex components):
- Navigation
- Header
- Form
- DataTable
- Modal
- Sidebar

## Development Priority:

**Phase 1 - Foundation** (Week 1-2):
1. Button (primary, secondary, danger variants)
2. Input (text, number, email types)
3. Typography components
4. Icon system

**Phase 2 - Forms** (Week 3-4):
5. FormField
6. Select/Dropdown
7. Checkbox/Radio
8. Form layout component

**Phase 3 - Feedback** (Week 5):
9. Alert
10. Toast
11. Modal
12. Spinner/Loading states

**Phase 4 - Layout** (Week 6-7):
13. Card
14. Navigation
15. Header
16. Sidebar

**Phase 5 - Data** (Week 8):
17. DataTable
18. Pagination
19. Search/Filter components

Each component should include:
- Full TypeScript types
- Accessibility features (ARIA labels, keyboard navigation)
- Responsive design
- Theme/variant support
- Storybook documentation
- Unit tests

Would you like me to adjust this plan based on your specific needs, or shall we proceed with detailed implementation prompts for specific components?`,
        },
      },
    ],
  }
}
