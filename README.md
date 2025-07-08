# SuperComponents

[![CI](https://github.com/SuperComponents/SuperComponents/workflows/CI/badge.svg)](https://github.com/SuperComponents/SuperComponents/actions)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/supercomponents-server)](https://www.npmjs.com/package/supercomponents-server)
[![Tests](https://img.shields.io/badge/tests-195%20passing-brightgreen)](https://github.com/SuperComponents/SuperComponents)
[![WCAG](https://img.shields.io/badge/WCAG-AA%20Compliant-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![React](https://img.shields.io/badge/react-%3E%3D19.0.0-blue)](https://reactjs.org)
[![Storybook](https://img.shields.io/badge/storybook-v8.6.14-ff69b4)](https://storybook.js.org)

AI-powered design system generator that transforms inspiration into complete, production-ready component libraries.

## ✨ Features

- **AI-Powered Analysis**: Extracts design principles from images, websites, or text descriptions
- **Complete React Ecosystem**: Generates React + TypeScript + Tailwind + Storybook projects
- **WCAG Compliance**: All components meet accessibility standards (AA level)
- **Design Token System**: W3C-compliant design tokens with automatic Tailwind integration
- **Production Ready**: Includes testing, documentation, and CI/CD setup
- **End-to-End Workflow**: From inspiration to deployable design system in minutes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- OpenAI API key (required for AI-powered analysis)

### Installation

```bash
# Install globally
npm install -g supercomponents-server

# Or use directly with npx
npx supercomponents-server --description "Modern SaaS application with clean design" --output ./my-design-system
```

## Environment Variables

Create a `.env` file in the root directory with **either** OpenAI or Anthropic API key:

```env
# Option 1: Use OpenAI (GPT models)
OPENAI_API_KEY=your_openai_api_key_here

# Option 2: Use Anthropic (Claude models) - Preferred
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Option 3: Use both (Anthropic will be preferred)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Provider Selection:**
- If both keys are provided, **Anthropic (Claude) will be used** by default
- If only one key is provided, that provider will be used
- If no keys are provided, the system will throw an error

### Development Setup

```bash
# Clone the repository
git clone https://github.com/SuperComponents/SuperComponents.git
cd SuperComponents

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Launch Storybook
npm run storybook
```

### LLM Integration Examples

```typescript
import { complete, streamComplete, getCurrentProvider } from './src/llm/index';

// Check current provider
const provider = getCurrentProvider();
console.log(`Using: ${provider.name}`);

// Basic completion
const response = await complete('Explain design systems');

// Streaming completion
for await (const chunk of streamComplete('Generate component code')) {
  console.log(chunk);
}
```

## 📖 Usage

### Basic Usage

```bash
# Generate from text description
npx supercomponents-server --description "Professional healthcare app" --output ./healthcare-ds

# Generate from website URL
npx supercomponents-server --url https://example.com --output ./example-ds

# Generate from image
npx supercomponents-server --image https://example.com/design.png --output ./image-ds
```

### Advanced Options

```bash
npx supercomponents-server \
  --description "Modern fintech application" \
  --output ./fintech-ds \
  --brand-keywords "secure,professional,trustworthy" \
  --industry-type "finance" \
  --target-users "Financial professionals and consumers" \
  --color-preferences "blue,green,neutral" \
  --style-preferences "modern,professional,minimalist" \
  --accessibility enhanced \
  --verbose
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--description` | Text description of desired design | - |
| `--url` | Website URL for inspiration | - |
| `--image` | Image URL for visual inspiration | - |
| `--output` | Output directory | `./generated-design-system` |
| `--brand-keywords` | Comma-separated brand keywords | - |
| `--industry-type` | Industry context | - |
| `--target-users` | Target user description | - |
| `--color-preferences` | Preferred colors | - |
| `--style-preferences` | Style preferences | - |
| `--accessibility` | Accessibility level (basic/enhanced/enterprise) | `basic` |
| `--verbose` | Enable verbose logging | `false` |

## 📁 Generated Structure

```
my-design-system/
├── design/
│   └── PRINCIPLES.md              # Design principles and guidelines
├── tokens/
│   └── design-tokens.json         # W3C design tokens
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Modal/
│   └── stories/
│       └── Principles.stories.mdx
├── .storybook/
├── tailwind.config.ts
├── package.json
└── .supercomponents/
    └── metadata.json
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reloading |
| `npm run build` | Build production version |
| `npm start` | Run compiled production server |
| `npm test` | Run Jest test suite |
| `npm run test:cli` | Test CLI functionality end-to-end |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run clean` | Clean build directory |
| `npm run lint` | Run ESLint on TypeScript files |
| `npm run typecheck` | Type check without compilation |
| `npm run storybook` | Launch Storybook development server |
| `npm run build-storybook` | Build static Storybook |
| `npm run inspiration-to-system` | Run CLI tool directly |

## 🎯 Generated Components

### Button
Interactive button component with multiple variants:
- **Variants**: primary, secondary, outline, ghost
- **Sizes**: small, medium, large
- **States**: default, hover, focus, disabled, loading
- **Accessibility**: Full ARIA support, keyboard navigation

### Input
Form input component with validation:
- **Types**: text, email, password, number, search
- **States**: default, focus, error, disabled
- **Features**: Helper text, error messages, full width option
- **Accessibility**: ARIA labels, error announcements

### Card
Flexible container component:
- **Variants**: default, elevated, outlined
- **Sections**: header, body, footer
- **Features**: Clickable cards, custom padding
- **Accessibility**: Proper heading structure, focus management

### Modal
Accessible dialog component:
- **Sizes**: small, medium, large, full screen
- **Variants**: center, top, bottom
- **Features**: Focus trap, escape key handling, overlay click
- **Accessibility**: ARIA dialog, focus management, screen reader support

## 🔧 Troubleshooting

### Common Issues

#### API Key Missing
```bash
# Error: "The OPENAI_API_KEY environment variable is missing..."
export OPENAI_API_KEY="your-api-key-here"

# Or create a .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

#### CLI Command Not Found
```bash
# If using global installation
npm install -g supercomponents-server

# Or use the local script
npm run inspiration-to-system -- --description "your design"
```

#### Permission Errors
```bash
# If you get permission errors, try:
sudo npm install -g supercomponents-server

# Or use npx without global installation
npx supercomponents-server --description "your design"
```

#### Storybook Build Fails
```bash
# Ensure all dependencies are installed
npm install

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build-storybook
```

### Performance Tips

- Generation typically takes 30-60 seconds
- Use `--skip-storybook` flag for faster generation if you don't need Storybook
- Use `--verbose` flag for detailed logging

## 🔧 API Reference

### Design Tokens

Generated design tokens follow W3C Design Tokens specification:

```json
{
  "color": {
    "primary": {
      "50": { "$type": "color", "$value": "#f0f9ff" },
      "500": { "$type": "color", "$value": "#3b82f6" },
      "900": { "$type": "color", "$value": "#1e3a8a" }
    }
  },
  "typography": {
    "fontFamily": {
      "sans": { "$type": "fontFamily", "$value": ["Inter", "system-ui", "sans-serif"] }
    },
    "fontSize": {
      "base": { "$type": "dimension", "$value": "16px" }
    }
  }
}
```

### Component Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}
```

## 🧪 Testing

The generated components include comprehensive testing:

- **Unit Tests**: React Testing Library + Jest
- **Snapshot Tests**: Visual regression testing
- **Accessibility Tests**: ARIA compliance and keyboard navigation
- **Integration Tests**: Storybook play functions

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Test CLI functionality
npm run test:cli

# Run linting
npm run lint

# Type check
npm run typecheck
```

## 📚 Examples

### Basic Component Usage

```tsx
import { Button, Input, Card, Modal } from './src/components';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Card>
        <Input placeholder="Enter your email" type="email" />
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Open Modal
        </Button>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Welcome!</h2>
        <p>This is a generated modal component.</p>
      </Modal>
    </div>
  );
}
```

### Custom Theme Integration

```tsx
// tailwind.config.ts (automatically generated)
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          900: 'var(--color-primary-900)',
        }
      }
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

```bash
# Clone and install
git clone https://github.com/SuperComponents/SuperComponents.git
cd SuperComponents
npm install

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes and add tests
npm test

# Run linting
npm run lint

# Type check
npm run typecheck

# Test CLI functionality
npm run test:cli

# Test Storybook build
npm run build-storybook
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Build successfully: `npm run build`
7. Submit a pull request with a clear description

### Coding Standards

- TypeScript strict mode enabled
- ESLint configuration must pass
- Jest tests required for new features
- Storybook stories for all components
- WCAG AA compliance for accessibility
- Conventional commit messages

## 📈 Development Status

This project is currently in **MVP (Minimum Viable Product)** phase. All core functionality is complete and working:

- ✅ CLI tool with full argument parsing
- ✅ Design system generation workflow
- ✅ React component generation (Button, Input, Card, Modal)
- ✅ Storybook integration with stories
- ✅ Design token generation (W3C compliant)
- ✅ WCAG accessibility compliance
- ✅ Comprehensive testing suite
- ✅ CI/CD pipeline with GitHub Actions

**Note**: Some integration tests may fail in CI environments without API keys, but this is expected behavior.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Powered by [Tailwind CSS](https://tailwindcss.com/) and [Storybook](https://storybook.js.org/)
- Design token standard by [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- AI analysis powered by [OpenAI](https://openai.com/)

## 🔗 Links

- [Documentation](https://supercomponents.github.io/SuperComponents/)
- [Storybook Examples](https://supercomponents.github.io/SuperComponents/storybook/)
- [GitHub Repository](https://github.com/SuperComponents/SuperComponents)
- [Issues](https://github.com/SuperComponents/SuperComponents/issues)
- [Discussions](https://github.com/SuperComponents/SuperComponents/discussions)

---

**SuperComponents** - From inspiration to production-ready design systems in minutes. ✨
