# Supercomponents Template

This template provides a complete design system workspace with React, TypeScript, Vite, Storybook, and shadcn/ui components.

## Features

- **React 19** with **TypeScript** - Latest React with full type safety
- **Vite 7.0** - Fast build tool and dev server with HMR
- **Tailwind CSS 4.1** - Utility-first CSS framework with Vite integration
- **Storybook 9.0** - Component development and documentation
- **shadcn/ui** - Pre-configured beautiful components
- **Accessibility Testing** - Built-in a11y testing with Storybook addon
- **Vitest** - Testing framework with browser testing support

## Directory Structure

```
.supercomponents/          # Design System Workspace
├── tokens/                # Auto-generated design tokens
├── components/  
│   ├── library/          # 📚 Complete shadcn component library
│   ├── generated/        # 🤖 AI-generated components (pending review)
│   ├── approved/         # ✅ User-approved components
│   └── rejected/         # ❌ Rejected components with reasons
└── .storybook/stories/
    ├── 01-tokens/        # Design token stories
    ├── 02-library/       # Library component stories
    ├── 03-review/        # Review pending components
    ├── 04-approved/      # Approved component stories
    └── 05-production/    # Production component stories
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Start Storybook**:
   ```bash
   npm run storybook
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production
- `npm run lint` - Run ESLint
- `npm run supercomponents-setup` - Run setup script (used by MCP server)

## Tailwind CSS v4 Configuration

This template uses **Tailwind CSS v4** with CSS-first configuration:

- **No `tailwind.config.js`** - Configuration is done directly in CSS
- **`@theme` directive** - Theme customization using CSS variables
- **`@import "tailwindcss"`** - Single import replaces multiple `@tailwind` directives
- **shadcn/ui compatibility** - Pre-configured for shadcn/ui components

### Key Changes from v3:
- CSS variables wrapped in `hsl()` function
- `@theme` directive for theme configuration
- `--color-` prefix for color variables in theme
- Built-in dark mode support

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
