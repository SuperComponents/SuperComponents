import path from 'path';
import { writeFile, ensureDir } from '../utils/file-system.js';

interface InitProjectArgs {
  projectName: string;
  projectPath: string;
}

export async function initProjectTool(args: InitProjectArgs) {
  const { projectName, projectPath } = args;
  const fullPath = path.join(projectPath, projectName);

  try {
    // Create project directory
    await ensureDir(fullPath);

    // Create package.json
    const packageJson = {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
        storybook: "storybook dev -p 6006",
        "build-storybook": "storybook build",
        lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        format: "prettier --write .",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1"
      },
      devDependencies: {
        "@storybook/addon-essentials": "^8.5.0",
        "@storybook/addon-interactions": "^8.5.0",
        "@storybook/addon-links": "^8.5.0",
        "@storybook/blocks": "^8.5.0",
        "@storybook/react": "^8.5.0",
        "@storybook/react-vite": "^8.5.0",
        "@types/react": "^18.3.14",
        "@types/react-dom": "^18.3.5",
        "@typescript-eslint/eslint-plugin": "^8.20.0",
        "@typescript-eslint/parser": "^8.20.0",
        "@vitejs/plugin-react": "^4.3.4",
        autoprefixer: "^10.4.21",
        eslint: "^9.17.0",
        "eslint-plugin-react-hooks": "^5.1.0",
        "eslint-plugin-react-refresh": "^0.4.16",
        "eslint-plugin-storybook": "^0.11.2",
        postcss: "^8.4.49",
        prettier: "^3.4.2",
        storybook: "^8.5.0",
        tailwindcss: "^4.0.0-beta.10",
        typescript: "^5.7.3",
        vite: "^6.0.7"
      }
    };

    await writeFile(
      path.join(fullPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create tsconfig.json
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
      include: ["src"],
      references: [{ path: "./tsconfig.node.json" }]
    };

    await writeFile(
      path.join(fullPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // Create vite.config.ts
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
})
`;

    await writeFile(path.join(fullPath, 'vite.config.ts'), viteConfig);

    // Create postcss.config.js
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

    await writeFile(path.join(fullPath, 'postcss.config.js'), postcssConfig);

    // Create Tailwind v4 config (CSS file)
    const tailwindCSS = `@import "tailwindcss";

@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
  
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
  
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}
`;

    await writeFile(path.join(fullPath, 'src/index.css'), tailwindCSS);

    // Create .storybook/main.ts
    const storybookMain = `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
`;

    await ensureDir(path.join(fullPath, '.storybook'));
    await writeFile(path.join(fullPath, '.storybook/main.ts'), storybookMain);

    // Create .storybook/preview.ts
    const storybookPreview = `import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
`;

    await writeFile(path.join(fullPath, '.storybook/preview.ts'), storybookPreview);

    // Create src/App.tsx
    const appComponent = `function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to ${projectName}
        </h1>
        <p className="text-lg text-gray-600">
          Your design system is ready to build!
        </p>
      </div>
    </div>
  )
}

export default App
`;

    await writeFile(path.join(fullPath, 'src/App.tsx'), appComponent);

    // Create src/main.tsx
    const mainEntry = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

    await writeFile(path.join(fullPath, 'src/main.tsx'), mainEntry);

    // Create index.html
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

    await writeFile(path.join(fullPath, 'index.html'), indexHtml);

    // Create .gitignore
    const gitignore = `node_modules
dist
dist-ssr
*.local
.DS_Store
*.log
.env
.env.local
.env.*.local
storybook-static
`;

    await writeFile(path.join(fullPath, '.gitignore'), gitignore);

    // Create README.md
    const readme = `# ${projectName}

A design system built with React, TypeScript, Storybook, and Tailwind CSS v4.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Storybook

\`\`\`bash
npm run storybook
\`\`\`

## Building

\`\`\`bash
npm run build
\`\`\`
`;

    await writeFile(path.join(fullPath, 'README.md'), readme);

    return {
      content: [{
        type: "text",
        text: `✅ Project "${projectName}" initialized successfully at ${fullPath}

Next steps:
1. Navigate to the project: cd ${fullPath}
2. Install dependencies: npm install
3. Start development: npm run dev
4. Start Storybook: npm run storybook

The project includes:
- React + TypeScript + Vite setup
- Tailwind CSS v4 with design tokens
- Storybook for component development
- ESLint and Prettier configuration
- Basic project structure`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to initialize project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}