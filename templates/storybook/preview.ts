import type { Preview } from '@storybook/react';
import '{{designTokensCssPath}}';
import '{{tailwindConfigPath}}';

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
      theme: {
        colorPrimary: 'var(--color-primary-500)',
        colorSecondary: 'var(--color-secondary-500)',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: 'var(--color-neutral-50)',
        },
        {
          name: 'dark',
          value: 'var(--color-neutral-900)',
        },
        {
          name: 'primary',
          value: 'var(--color-primary-500)',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
      },
    },
  },
  
  tags: ['autodocs'],
  
  decorators: [
    (Story) => (
      <div className="font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
