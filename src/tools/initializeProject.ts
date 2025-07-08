// src/tools/initializeProject.ts
import { z } from "zod";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import { getLogger } from '../utils/logger.js';

const inputSchema = z.object({
  path: z.string().optional().default("./").describe("Project path where Storybook and Tailwind should be initialized (defaults to current directory)"),
  projectName: z.string().optional().default("SuperComponents Project").describe("Name of the project"),
  skipStorybook: z.boolean().optional().default(false).describe("Skip Storybook initialization"),
  skipTailwind: z.boolean().optional().default(false).describe("Skip Tailwind configuration"),
  skipSuperComponents: z.boolean().optional().default(false).describe("Skip SuperComponents directory creation")
});

// Tailwind config template
const TAILWIND_CONFIG_TEMPLATE = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./supercomponents/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom design tokens will be added here
      colors: {
        // SuperComponents color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        // Custom font families
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular'],
      },
      spacing: {
        // Custom spacing scale
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    // Add Tailwind plugins as needed
  ],
};
`;

// Storybook main configuration template
const STORYBOOK_MAIN_CONFIG = `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)', '../supercomponents/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
`;

// Storybook preview configuration template
const STORYBOOK_PREVIEW_CONFIG = `import type { Preview } from '@storybook/react';
import '../src/index.css'; // Import Tailwind CSS

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
`;

// CSS file for Tailwind
const TAILWIND_CSS_TEMPLATE = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* SuperComponents custom styles */
@layer base {
  :root {
    --color-primary: theme('colors.primary.500');
    --color-secondary: theme('colors.gray.500');
    --spacing-unit: theme('spacing.4');
  }
}

@layer components {
  .sc-button {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }
  
  .sc-button-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }
  
  .sc-button-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}
`;

// Example component template
const EXAMPLE_COMPONENT_TEMPLATE = `import React from 'react';
import './Button.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
}) => {
  const baseClasses = 'sc-button';
  const variantClasses = variant === 'primary' ? 'sc-button-primary' : 'sc-button-secondary';
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={\`\${baseClasses} \${variantClasses} \${sizeClasses[size]}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
`;

// Example story template
const EXAMPLE_STORY_TEMPLATE = `import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'SuperComponents/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};
`;

/**
 * Check if Node.js version meets minimum requirements
 */
function checkNodeVersion(): void {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 20) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Node.js 20 or higher is required for Storybook. Current version: ${nodeVersion}. Please upgrade Node.js and try again.`
    );
  }
}

export const initializeProjectTool: Tool = {
  definition: {
    name: "initializeProject",
    description: "Initialize a new SuperComponents project with Storybook, Tailwind CSS, and directory structure. Run this tool first before using other SuperComponents tools.",
    inputSchema: zodToJsonSchema(inputSchema)
  },
  handler: async (args) => {
    const logger = getLogger();
    
    try {
      logger.info('Starting SuperComponents project initialization...');
      
      // Check Node.js version first
      checkNodeVersion();
    
    // Handle different input formats
    let parsedInput;
    if (!args || (typeof args === 'object' && Object.keys(args).length === 0)) {
      // Use defaults if no input provided
      parsedInput = {};
    } else {
      parsedInput = args;
    }
    
    console.log("Parsed input:", JSON.stringify(parsedInput, null, 2));
    
    const input = inputSchema.parse(parsedInput);
    const { path, projectName, skipStorybook, skipTailwind, skipSuperComponents } = input;
    
    console.log(`🚀 Initializing SuperComponents project at: ${path}`);
    console.log(`📦 Project name: ${projectName}`);

    // Create project directory if it doesn't exist
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(`✅ Created project directory: ${path}`);
    }

    const results = [];
    
    // Initialize package.json and React dependencies for Storybook
    const packageJsonPath = join(path, 'package.json');
    let packageJsonExists = existsSync(packageJsonPath);
    
    if (!packageJsonExists) {
      console.log("📦 Creating package.json with React dependencies...");
      
      const packageJson = {
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
          storybook: "storybook dev -p 6006",
          "build-storybook": "storybook build"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@types/react": "^18.2.43",
          "@types/react-dom": "^18.2.17",
          "@vitejs/plugin-react": "^4.2.1",
          typescript: "^5.2.2",
          vite: "^5.0.8"
        }
      };
      
                  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      results.push("✅ Package.json created with React dependencies");
      
      // Create basic Vite configuration
      const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
});
`;
      writeFileSync(join(path, 'vite.config.ts'), viteConfig);
      results.push("✅ Vite configuration created");
      
      // Create basic TypeScript configuration
      const tsConfig = {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ["src", "supercomponents"],
        references: [{ path: "./tsconfig.node.json" }]
      };
      
      writeFileSync(join(path, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
      results.push("✅ TypeScript configuration created");
      
      // Create tsconfig.node.json
      const tsConfigNode = {
        compilerOptions: {
          composite: true,
          skipLibCheck: true,
          module: "ESNext",
          moduleResolution: "bundler",
          allowSyntheticDefaultImports: true
        },
        include: ["vite.config.ts"]
      };
      
      writeFileSync(join(path, 'tsconfig.node.json'), JSON.stringify(tsConfigNode, null, 2));
      
      // Create basic index.html
      const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
      writeFileSync(join(path, 'index.html'), indexHtml);
      results.push("✅ Basic project files created");
    }

    // Install React dependencies if we created package.json
    if (!packageJsonExists) {
    console.log("📦 Installing React dependencies...");
    
    try {
      execSync(`npm install`, { 
        cwd: path, 
        stdio: 'inherit' 
      });
      
      results.push("✅ React dependencies installed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to install React dependencies: ${errorMessage}`);
    }
  }

  // Initialize Storybook
  if (!skipStorybook) {
    console.log("📚 Initializing Storybook...");
    
    try {
      // Install Storybook (let it auto-detect the React framework)
      execSync(`npx storybook@latest init --yes`, { 
        cwd: path, 
        stdio: 'inherit' 
      });
      
      // Create custom Storybook configuration
      const storybookPath = join(path, '.storybook');
      if (existsSync(storybookPath)) {
        writeFileSync(join(storybookPath, 'main.ts'), STORYBOOK_MAIN_CONFIG);
        writeFileSync(join(storybookPath, 'preview.ts'), STORYBOOK_PREVIEW_CONFIG);
      }
      
      results.push("✅ Storybook initialized successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize Storybook: ${errorMessage}`);
    }
  }

  // Configure Tailwind CSS
  if (!skipTailwind) {
    console.log("🎨 Configuring Tailwind CSS...");
    
    try {
      // Install Tailwind CSS dependencies
      execSync(`npm install -D tailwindcss postcss autoprefixer`, { 
        cwd: path, 
        stdio: 'inherit' 
      });
      
      // Create Tailwind config
      writeFileSync(join(path, 'tailwind.config.cjs'), TAILWIND_CONFIG_TEMPLATE);
      
      // Create PostCSS config
      const postCSSConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
      writeFileSync(join(path, 'postcss.config.cjs'), postCSSConfig);
      
      // Create CSS file structure
      const srcPath = join(path, 'src');
      if (!existsSync(srcPath)) {
        mkdirSync(srcPath, { recursive: true });
      }
      
      writeFileSync(join(srcPath, 'index.css'), TAILWIND_CSS_TEMPLATE);
      
      // Create main.tsx if it doesn't exist (for new projects)
      const mainTsxPath = join(srcPath, 'main.tsx');
      if (!existsSync(mainTsxPath)) {
        const mainTsxContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Button } from '../supercomponents';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          SuperComponents
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered component library
        </p>
        <div className="space-x-4">
          <Button variant="primary" size="medium">
            Primary Button
          </Button>
          <Button variant="secondary" size="medium">
            Secondary Button
          </Button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
        writeFileSync(mainTsxPath, mainTsxContent);
        results.push("✅ Main React app created");
      }
      
      results.push("✅ Tailwind CSS configured successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to configure Tailwind CSS: ${errorMessage}`);
    }
  }

  // Create SuperComponents directory structure
  if (!skipSuperComponents) {
    console.log("🏗️  Creating SuperComponents directory structure...");
    
    try {
      const superComponentsPath = join(path, 'supercomponents');
      
      // Create main directories
      const directories = [
        'components',
        'components/Button',
        'tokens',
        'utils',
        'stories',
        'types'
      ];
      
      directories.forEach(dir => {
        const dirPath = join(superComponentsPath, dir);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
      });
      
      // Create example component
      writeFileSync(
        join(superComponentsPath, 'components', 'Button', 'Button.tsx'),
        EXAMPLE_COMPONENT_TEMPLATE
      );
      
      // Create example story
      writeFileSync(
        join(superComponentsPath, 'components', 'Button', 'Button.stories.ts'),
        EXAMPLE_STORY_TEMPLATE
      );
      
      // Create component CSS
      const buttonCSS = `.sc-button {
  /* Button styles will be handled by Tailwind classes */
}`;
      writeFileSync(
        join(superComponentsPath, 'components', 'Button', 'Button.css'),
        buttonCSS
      );
      
      // Create index file
      const indexContent = `export { Button } from './components/Button/Button';

// Export types
export type { ButtonProps } from './components/Button/Button';
`;
      writeFileSync(join(superComponentsPath, 'index.ts'), indexContent);
      
      // Create README
      const readmeContent = `# SuperComponents

This directory contains your component library generated by SuperComponents.

## Structure

- \`components/\` - React components
- \`stories/\` - Storybook stories
- \`tokens/\` - Design tokens
- \`utils/\` - Utility functions
- \`types/\` - TypeScript type definitions

## Usage

\`\`\`tsx
import { Button } from './supercomponents';

function App() {
  return (
    <Button variant="primary" size="medium">
      Click me
    </Button>
  );
}
\`\`\`

## Development

Run Storybook to see your components:

\`\`\`bash
npm run storybook
\`\`\`
`;
      writeFileSync(join(superComponentsPath, 'README.md'), readmeContent);
      
      results.push("✅ SuperComponents directory structure created successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create SuperComponents directory: ${errorMessage}`);
    }
  }

  // Update package.json scripts if they don't exist (for existing package.json)
  if (packageJsonExists) {
    try {
      const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
      
      // Add Storybook scripts if not present
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      if (!packageJson.scripts.storybook) {
        packageJson.scripts.storybook = 'storybook dev -p 6006';
      }
      
      if (!packageJson.scripts['build-storybook']) {
        packageJson.scripts['build-storybook'] = 'storybook build';
      }
      
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      results.push("✅ Package.json scripts updated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Could not update package.json scripts: ${errorMessage}`);
    }
  }

  return {
    success: true,
    message: `✅ Project "${projectName}" initialized successfully`,
    results: results,
    next_steps: [
      "Run 'npm run storybook' to start Storybook",
      "Check the SuperComponents directory for example components",
      "Customize the Tailwind config as needed",
      "Start building your component library!"
    ]
  };
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return {
    success: false,
    message: `❌ Failed to initialize project: ${errorMessage}`
  };
}
  }
}; 