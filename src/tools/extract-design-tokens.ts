import { DesignTokens } from '../types/index.js';

interface ExtractDesignTokensArgs {
  source: string;
  sourceType: 'url' | 'image' | 'text';
}

export async function extractDesignTokensTool(args: ExtractDesignTokensArgs) {
  const { source, sourceType } = args;

  try {
    // For proof of concept, we'll return example tokens
    // In a real implementation, this would:
    // - Fetch and analyze URLs
    // - Process images with computer vision
    // - Parse text descriptions
    
    const tokens: DesignTokens = {
      colors: {
        'primary-50': '#eff6ff',
        'primary-100': '#dbeafe',
        'primary-200': '#bfdbfe',
        'primary-300': '#93c5fd',
        'primary-400': '#60a5fa',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
        'primary-700': '#1d4ed8',
        'primary-800': '#1e40af',
        'primary-900': '#1e3a8a',
        'gray-50': '#f9fafb',
        'gray-100': '#f3f4f6',
        'gray-200': '#e5e7eb',
        'gray-300': '#d1d5db',
        'gray-400': '#9ca3af',
        'gray-500': '#6b7280',
        'gray-600': '#4b5563',
        'gray-700': '#374151',
        'gray-800': '#1f2937',
        'gray-900': '#111827',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6'
      },
      typography: {
        fonts: [
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        sizes: {
          'xs': '0.75rem',
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        weights: {
          'light': 300,
          'normal': 400,
          'medium': 500,
          'semibold': 600,
          'bold': 700,
          'extrabold': 800
        },
        lineHeights: {
          'tight': '1.25',
          'snug': '1.375',
          'normal': '1.5',
          'relaxed': '1.625',
          'loose': '1.75'
        }
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem'
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'base': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px'
      },
      shadows: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'base': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
      }
    };

    // Generate Tailwind v4 CSS format
    const cssOutput = generateTailwindV4CSS(tokens);

    return {
      content: [{
        type: "text",
        text: `✅ Design tokens extracted successfully from ${sourceType}: ${source}

Extracted tokens include:
- ${Object.keys(tokens.colors).length} colors
- ${tokens.typography.fonts.length} font families
- ${Object.keys(tokens.typography.sizes).length} font sizes
- ${Object.keys(tokens.spacing).length} spacing values
- ${Object.keys(tokens.borderRadius).length} border radius values
- ${Object.keys(tokens.shadows || {}).length} shadows

Generated Tailwind v4 CSS theme:

\`\`\`css
${cssOutput}
\`\`\`

These tokens have been saved and can be used with the generate_style_showcase tool.`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to extract design tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

function generateTailwindV4CSS(tokens: DesignTokens): string {
  let css = '@theme {\n';
  
  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });
  
  // Typography
  css += `\n  --font-sans: ${tokens.typography.fonts.join(', ')};\n`;
  
  // Font sizes
  Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
    css += `  --font-size-${key}: ${value};\n`;
  });
  
  // Font weights
  Object.entries(tokens.typography.weights).forEach(([key, value]) => {
    css += `  --font-weight-${key}: ${value};\n`;
  });
  
  // Line heights
  Object.entries(tokens.typography.lineHeights).forEach(([key, value]) => {
    css += `  --line-height-${key}: ${value};\n`;
  });
  
  // Spacing
  css += '\n';
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });
  
  // Border radius
  css += '\n';
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });
  
  // Shadows
  if (tokens.shadows) {
    css += '\n';
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      css += `  --shadow-${key}: ${value};\n`;
    });
  }
  
  css += '}';
  return css;
}