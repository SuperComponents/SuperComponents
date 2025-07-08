import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import designTokens from '../../tokens/design-tokens.json';

// Helper function to calculate contrast ratio
const getContrastRatio = (hex1: string, hex2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const normalize = (c: number) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
  };
  
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

const ColorSwatch = ({ 
  name, 
  value, 
  contrastWith = '#ffffff' 
}: { 
  name: string; 
  value: string; 
  contrastWith?: string; 
}) => {
  const contrastRatio = getContrastRatio(value, contrastWith);
  const isAccessible = contrastRatio >= 4.5;
  
  return (
    <div className="flex items-center gap-3 p-2 border rounded-lg">
      <div 
        className="w-12 h-12 rounded-md border shadow-sm"
        style={{ backgroundColor: value }}
        data-testid={`color-swatch-${name}`}
      />
      <div className="flex-1">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-gray-500 font-mono">{value}</div>
        <div className="text-xs">
          Contrast: {contrastRatio.toFixed(2)} 
          <span className={isAccessible ? 'text-green-600' : 'text-red-600'}>
            {isAccessible ? ' ✓ AA' : ' ✗ Fail'}
          </span>
        </div>
      </div>
    </div>
  );
};

const ColorPalette = ({ 
  title, 
  colors 
}: { 
  title: string; 
  colors: Record<string, string>; 
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} />
      ))}
    </div>
  </div>
);

const TokenDisplay = ({ 
  title, 
  tokens 
}: { 
  title: string; 
  tokens: Record<string, any>; 
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="grid grid-cols-1 gap-2">
      {Object.entries(tokens).map(([name, value]) => (
        <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-medium">{name}</span>
          <span className="font-mono text-sm text-gray-600">
            {typeof value === 'object' ? JSON.stringify(value) : value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const DesignTokensDisplay = () => {
  return (
    <div className="space-y-8 p-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Design Tokens</h1>
        <p className="text-gray-600">
          Visual representation of the design system tokens with accessibility information.
        </p>
      </div>
      
      <ColorPalette title="Primary Colors" colors={designTokens.colors.primary} />
      <ColorPalette title="Neutral Colors" colors={designTokens.colors.neutral} />
      <ColorPalette title="Semantic Colors" colors={designTokens.colors.semantic} />
      
      <TokenDisplay title="Spacing" tokens={designTokens.spacing} />
      <TokenDisplay title="Typography" tokens={designTokens.typography} />
      <TokenDisplay title="Border Radius" tokens={designTokens.borderRadius} />
      <TokenDisplay title="Shadows" tokens={designTokens.shadows} />
    </div>
  );
};

const meta: Meta<typeof DesignTokensDisplay> = {
  title: 'Foundation/Design Tokens',
  component: DesignTokensDisplay,
  parameters: {
    docs: {
      description: {
        component: 'Design tokens visualization with color contrast information and accessibility compliance.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DesignTokensDisplay>;

export const Overview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that color swatches are rendered
    const primarySwatch = canvas.getByTestId('color-swatch-500');
    expect(primarySwatch).toBeInTheDocument();
    
    // Test that contrast information is displayed
    const contrastText = canvas.getByText(/Contrast:/);
    expect(contrastText).toBeInTheDocument();
  },
};

export const ColorsOnly: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      <ColorPalette title="Primary Colors" colors={designTokens.colors.primary} />
      <ColorPalette title="Neutral Colors" colors={designTokens.colors.neutral} />
      <ColorPalette title="Semantic Colors" colors={designTokens.colors.semantic} />
    </div>
  ),
};

export const TypographyOnly: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      <TokenDisplay title="Typography" tokens={designTokens.typography} />
    </div>
  ),
};
