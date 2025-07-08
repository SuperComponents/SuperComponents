import type { Preview } from '@storybook/react';
import '../src/styles/design-tokens.css';

// Function to dynamically load generated design tokens
const loadGeneratedTokens = () => {
  // Try to load generated tokens from various possible locations
  const possiblePaths = [
    '/examples/output/design-tokens.css',
    '/examples/examples/output/design-tokens.css',
    '/generated-design-system/design-tokens.css',
    '/design-tokens.css'
  ];

  possiblePaths.forEach(path => {
    fetch(path)
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error(`Failed to load ${path}`);
      })
      .then(css => {
        // Remove existing generated tokens
        const existingStyle = document.getElementById('generated-design-tokens');
        if (existingStyle) {
          existingStyle.remove();
        }

        // Create new style element with generated tokens
        const style = document.createElement('style');
        style.id = 'generated-design-tokens';
        style.textContent = css;
        document.head.appendChild(style);
        
        console.log(`Successfully loaded design tokens from ${path}`);
      })
      .catch(error => {
        // Silently fail - fallback to static tokens
        console.debug(`Could not load design tokens from ${path}:`, error.message);
      });
  });
};

// Load generated tokens when Storybook initializes
if (typeof window !== 'undefined') {
  // Load immediately
  loadGeneratedTokens();
  
  // Also try to reload tokens periodically (useful during development)
  setInterval(loadGeneratedTokens, 30000); // Every 30 seconds
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: ['Foundations', 'Components'],
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: 'var(--color-neutral-50, #fafafa)',
        },
        {
          name: 'dark',
          value: 'var(--color-neutral-900, #171717)',
        },
      ],
    },
  },
};

export default preview;
