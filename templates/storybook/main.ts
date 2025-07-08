import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '{{principlesPath}}',
    '{{storiesPath}}/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport'
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

  viteFinal: async (config) => {
    // Add path alias for generated tokens
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/tokens': '{{tokensPath}}',
      '@/components': '{{componentsPath}}',
    };

    // Ensure CSS is processed
    config.css = config.css || {};
    config.css.postcss = {
      plugins: [
        require('tailwindcss')({ config: '{{tailwindConfigPath}}' }),
        require('autoprefixer'),
      ],
    };

    return config;
  },
};

export default config;
