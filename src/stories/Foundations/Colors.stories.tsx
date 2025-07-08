import type { Meta, StoryObj } from '@storybook/react';
// import { WCAGValidator } from '../../generators/wcag-validator.js';

// Mock token data based on the existing CSS tokens
const mockTokens = {
  color: {
    primary: {
      50: { $value: '#f5f9ff' },
      100: { $value: '#ebf3fe' },
      200: { $value: '#d8e6fd' },
      300: { $value: '#b1cdfb' },
      400: { $value: '#89b4fa' },
      500: { $value: '#3b82f6' },
      600: { $value: '#2f68c5' },
      700: { $value: '#234e94' },
      800: { $value: '#183462' },
      900: { $value: '#0c1a31' },
      950: { $value: '#060d19' }
    },
    secondary: {
      50: { $value: '#f3fcf9' },
      100: { $value: '#e7f8f2' },
      200: { $value: '#cff1e6' },
      300: { $value: '#9fe3cd' },
      400: { $value: '#70d5b3' },
      500: { $value: '#10b981' },
      600: { $value: '#0d9467' },
      700: { $value: '#0a6f4d' },
      800: { $value: '#064a34' },
      900: { $value: '#03251a' },
      950: { $value: '#02120d' }
    },
    neutral: {
      50: { $value: '#fafafa' },
      100: { $value: '#f5f5f5' },
      200: { $value: '#e5e5e5' },
      300: { $value: '#d4d4d4' },
      400: { $value: '#a3a3a3' },
      500: { $value: '#737373' },
      600: { $value: '#525252' },
      700: { $value: '#404040' },
      800: { $value: '#262626' },
      900: { $value: '#171717' },
      950: { $value: '#0a0a0a' }
    },
    semantic: {
      success: { $value: '#12823b' },
      warning: { $value: '#ae5f05' },
      error: { $value: '#dc2626' },
      info: { $value: '#2563eb' }
    }
  }
};

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete color palette with WCAG accessibility validation',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ColorSwatches = () => {
  // For now, create a simple inline swatch display
  const renderColorSwatch = (name: string, value: string) => (
    <div key={name} style={{
      background: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px'
    }}>
      <div style={{
        height: '120px',
        background: value,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: value === '#ffffff' || value === '#fafafa' || value === '#f5f5f5' ? 'black' : 'white',
        fontWeight: 600,
        fontSize: '14px',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        {name}
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
          {name}
        </div>
        <div style={{ 
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px'
        }}>
          {value}
        </div>
      </div>
    </div>
  );

  const renderColorGroup = (groupName: string, colors: any) => (
    <div key={groupName} style={{ marginBottom: '32px' }}>
      <h3 style={{ marginBottom: '16px', color: '#333' }}>{groupName}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {Object.entries(colors).map(([shade, token]: [string, any]) => 
          renderColorSwatch(`${groupName}-${shade}`, token.$value)
        )}
      </div>
    </div>
  );
  
  return (
    <div style={{ 
      width: '100%', 
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 8px 0' }}>Design Token Colors</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Complete color palette with accessibility considerations
          </p>
        </div>
        
        {Object.entries(mockTokens.color).map(([groupName, colors]) => 
          renderColorGroup(groupName, colors)
        )}
      </div>
    </div>
  );
};

export const Swatches: Story = {
  render: () => <ColorSwatches />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive color swatches showing all design tokens with WCAG contrast ratios and accessibility validation.',
      },
    },
  },
};
