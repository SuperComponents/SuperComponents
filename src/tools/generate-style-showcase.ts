import path from 'path';
import { writeFile, ensureDir } from '../utils/file-system.js';
import { DesignTokens } from '../types/index.js';

interface GenerateStyleShowcaseArgs {
  outputPath: string;
  format?: 'html' | 'react';
}

// Mock tokens for POC - in real implementation, these would come from stored state
const mockTokens: DesignTokens = {
  colors: {
    'primary-500': '#3b82f6',
    'gray-900': '#111827',
    'gray-50': '#f9fafb'
  },
  typography: {
    fonts: ['Inter', 'system-ui', 'sans-serif'],
    sizes: {
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem'
    },
    weights: {
      'normal': 400,
      'semibold': 600,
      'bold': 700
    },
    lineHeights: {
      'normal': '1.5'
    }
  },
  spacing: {
    '4': '1rem',
    '8': '2rem'
  },
  borderRadius: {
    'md': '0.375rem',
    'lg': '0.5rem'
  }
};

export async function generateStyleShowcaseTool(args: GenerateStyleShowcaseArgs) {
  const { outputPath, format = 'html' } = args;

  try {
    await ensureDir(outputPath);

    if (format === 'html') {
      const htmlContent = generateHTMLShowcase(mockTokens);
      const filePath = path.join(outputPath, 'design-tokens-showcase.html');
      await writeFile(filePath, htmlContent);

      return {
        content: [{
          type: "text",
          text: `✅ Style showcase generated successfully!

Created: ${filePath}

The showcase includes:
- Color palette with all design tokens
- Typography samples showing fonts, sizes, and weights
- Spacing scale visualization
- Border radius examples
- Interactive hover states

Open the file in a browser to view your design tokens in action.`
        }]
      };
    } else {
      const reactContent = generateReactShowcase(mockTokens);
      const filePath = path.join(outputPath, 'DesignTokensShowcase.tsx');
      await writeFile(filePath, reactContent);

      return {
        content: [{
          type: "text",
          text: `✅ React component showcase generated successfully!

Created: ${filePath}

The component includes:
- Styled sections for each token category
- Responsive grid layouts
- Copy-to-clipboard functionality for token values
- TypeScript support

Import and use in your Storybook or application to view your design tokens.`
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to generate style showcase: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

function generateHTMLShowcase(tokens: DesignTokens): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Tokens Showcase</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${tokens.typography.fonts.join(', ')};
      line-height: 1.6;
      color: #333;
      background: #f9fafb;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1, h2 {
      margin-bottom: 1.5rem;
    }
    
    section {
      background: white;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .color-swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      transition: transform 0.2s;
    }
    
    .color-swatch:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .color-box {
      width: 100%;
      height: 80px;
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;
    }
    
    .typography-sample {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-left: 4px solid #3b82f6;
      background: #f3f4f6;
    }
    
    .spacing-demo {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .spacing-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3b82f6;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .radius-demo {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .radius-box {
      height: 100px;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Design Tokens Showcase</h1>
    
    <section>
      <h2>Colors</h2>
      <div class="color-grid">
        ${Object.entries(tokens.colors).map(([name, value]) => `
        <div class="color-swatch">
          <div class="color-box" style="background-color: ${value}"></div>
          <div><strong>${name}</strong></div>
          <div style="font-size: 0.875rem; color: #6b7280">${value}</div>
        </div>
        `).join('')}
      </div>
    </section>
    
    <section>
      <h2>Typography</h2>
      ${Object.entries(tokens.typography.sizes).map(([size, value]) => `
      <div class="typography-sample">
        <div style="font-size: ${value}; font-weight: ${tokens.typography.weights.normal}">
          ${size} - ${value} - The quick brown fox jumps over the lazy dog
        </div>
      </div>
      `).join('')}
    </section>
    
    <section>
      <h2>Spacing</h2>
      <div class="spacing-demo">
        ${Object.entries(tokens.spacing).map(([name, value]) => `
        <div class="spacing-box" style="width: ${value}; height: ${value}">
          ${name}
        </div>
        `).join('')}
      </div>
    </section>
    
    <section>
      <h2>Border Radius</h2>
      <div class="radius-demo">
        ${Object.entries(tokens.borderRadius).map(([name, value]) => `
        <div class="radius-box" style="border-radius: ${value}">
          ${name}
        </div>
        `).join('')}
      </div>
    </section>
  </div>
</body>
</html>`;
}

function generateReactShowcase(tokens: DesignTokens): string {
  return `import React from 'react';

interface TokenSectionProps {
  title: string;
  children: React.ReactNode;
}

const TokenSection: React.FC<TokenSectionProps> = ({ title, children }) => (
  <section className="bg-white p-8 mb-8 rounded-lg shadow-sm">
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    {children}
  </section>
);

const DesignTokensShowcase: React.FC = () => {
  const colors = ${JSON.stringify(tokens.colors, null, 2)};
  
  const typography = ${JSON.stringify(tokens.typography, null, 2)};
  
  const spacing = ${JSON.stringify(tokens.spacing, null, 2)};
  
  const borderRadius = ${JSON.stringify(tokens.borderRadius, null, 2)};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Design Tokens Showcase</h1>
        
        <TokenSection title="Colors">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(colors).map(([name, value]) => (
              <div
                key={name}
                className="flex flex-col items-center p-4 border rounded-md hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => copyToClipboard(value)}
              >
                <div
                  className="w-full h-20 rounded mb-2"
                  style={{ backgroundColor: value }}
                />
                <div className="font-semibold">{name}</div>
                <div className="text-sm text-gray-600">{value}</div>
              </div>
            ))}
          </div>
        </TokenSection>
        
        <TokenSection title="Typography">
          {Object.entries(typography.sizes).map(([size, value]) => (
            <div key={size} className="mb-4 p-4 border-l-4 border-primary-500 bg-gray-50">
              <div style={{ fontSize: value }}>
                {size} - {value} - The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </TokenSection>
        
        <TokenSection title="Spacing">
          <div className="flex flex-wrap gap-4">
            {Object.entries(spacing).map(([name, value]) => (
              <div
                key={name}
                className="bg-primary-500 text-white font-semibold flex items-center justify-center"
                style={{ width: value, height: value }}
              >
                {name}
              </div>
            ))}
          </div>
        </TokenSection>
        
        <TokenSection title="Border Radius">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(borderRadius).map(([name, value]) => (
              <div
                key={name}
                className="h-24 bg-primary-500 text-white font-semibold flex items-center justify-center"
                style={{ borderRadius: value }}
              >
                {name}
              </div>
            ))}
          </div>
        </TokenSection>
      </div>
    </div>
  );
};

export default DesignTokensShowcase;`;
}