import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta = {
  title: 'Design System/Principles',
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => (
        <div className="p-6 max-w-4xl mx-auto">
          <PrinciplesDisplay />
        </div>
      )
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

const PrinciplesDisplay = () => {
  const principles = {
    brandIdentity: "A balanced and intuitive brand experience that embodies modern, clean, accessible design values",
    targetAudience: "General users seeking intuitive and reliable experiences who appreciate engaging interactions",
    coreValues: [
      "Usability - Prioritize user experience and ease of use",
      "Reliability - Ensure consistent and dependable interactions", 
      "Simplicity - Maintain clean and uncluttered interfaces",
      "Quality - Deliver polished and professional experiences",
      "Accessibility - Support diverse user needs and abilities"
    ],
    designGoals: [
      "Balance functionality with aesthetics",
      "Ensure intuitive navigation",
      "Maintain visual consistency", 
      "Provide clear feedback",
      "Support keyboard navigation",
      "Ensure cross-browser compatibility"
    ],
    constraints: [
      "Primary color palette limited to extracted brand colors",
      "Typography limited to selected font families",
      "Spacing must follow systematic scale",
      "Maintain minimum 44px touch targets for accessibility",
      "Follow WCAG 2.1 AA standards"
    ]
  };

  const designTokens = {
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717'
      }
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '40px',
      '3xl': '48px'
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Design Principles</h1>
        <p className="text-lg text-neutral-600">
          Guiding principles for our component library and design system
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Brand Identity */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">Brand Identity</h2>
          <p className="text-neutral-600">{principles.brandIdentity}</p>
        </div>

        {/* Target Audience */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">Target Audience</h2>
          <p className="text-neutral-600">{principles.targetAudience}</p>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Core Values</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {principles.coreValues.map((value, index) => {
            const [title, description] = value.split(' - ');
            return (
              <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                <h3 className="font-medium text-neutral-900 mb-1">{title}</h3>
                <p className="text-sm text-neutral-600">{description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Design Goals */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Design Goals</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {principles.designGoals.map((goal, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-neutral-600">{goal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Design Constraints */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Design Constraints</h2>
        <div className="space-y-2">
          {principles.constraints.map((constraint, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <span className="text-neutral-600">{constraint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Design Tokens Preview */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Design Tokens</h2>
        
        <div className="space-y-6">
          {/* Colors */}
          <div>
            <h3 className="font-medium text-neutral-900 mb-3">Colors</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Primary</h4>
                <div className="flex space-x-1">
                  {Object.entries(designTokens.colors.primary).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-8 h-8 rounded border border-neutral-200 mb-1"
                        style={{ backgroundColor: value }}
                      ></div>
                      <div className="text-xs text-neutral-500">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Neutral</h4>
                <div className="flex space-x-1">
                  {Object.entries(designTokens.colors.neutral).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-8 h-8 rounded border border-neutral-200 mb-1"
                        style={{ backgroundColor: value }}
                      ></div>
                      <div className="text-xs text-neutral-500">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div>
            <h3 className="font-medium text-neutral-900 mb-3">Spacing</h3>
            <div className="grid gap-2 md:grid-cols-4">
              {Object.entries(designTokens.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div 
                    className="bg-primary-500 rounded"
                    style={{ width: value, height: '16px' }}
                  ></div>
                  <span className="text-sm text-neutral-600">{key}: {value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Examples */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Principle Application</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium text-neutral-900">✓ Good Example</h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-900">Clear Navigation</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-sm text-green-700">
                Navigation items are clearly labeled, properly spaced, and provide visual feedback on hover and focus states.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-neutral-900">✗ Poor Example</h3>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-red-900">Unclear Actions</h4>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-sm text-red-700">
                Buttons with ambiguous labels, inconsistent styling, and no clear indication of their purpose or state.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Overview: Story = {
  render: () => <PrinciplesDisplay />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Check that main sections are present
    await expect(canvas.getByText('Design Principles')).toBeInTheDocument();
    await expect(canvas.getByText('Brand Identity')).toBeInTheDocument();
    await expect(canvas.getByText('Target Audience')).toBeInTheDocument();
    await expect(canvas.getByText('Core Values')).toBeInTheDocument();
    await expect(canvas.getByText('Design Goals')).toBeInTheDocument();
    await expect(canvas.getByText('Design Constraints')).toBeInTheDocument();
    await expect(canvas.getByText('Design Tokens')).toBeInTheDocument();
  }
};
