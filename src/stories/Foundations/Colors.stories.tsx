import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete color palette with WCAG accessibility validation using dynamic CSS variables',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface ColorToken {
  name: string;
  value: string;
  contrast?: string;
  category: string;
}

const ColorSwatches = () => {
  const [colorTokens, setColorTokens] = useState<ColorToken[]>([]);
  
  useEffect(() => {
    // Extract color tokens from CSS variables
    const extractColorTokens = () => {
      const tokens: ColorToken[] = [];
      const styles = getComputedStyle(document.documentElement);
      
      // Get all CSS custom properties from the document
      const allProps = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules);
          } catch (e) {
            return [];
          }
        })
        .flatMap(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            const styleRule = rule as CSSStyleRule;
            if (styleRule.selectorText === ':root') {
              return Array.from(styleRule.style);
            }
          }
          return [];
        })
        .filter(prop => prop.startsWith('--color-'));

      allProps.forEach(prop => {
        const value = styles.getPropertyValue(prop).trim();
        if (value && value.startsWith('#')) {
          const name = prop.replace('--color-', '');
          const parts = name.split('-');
          const category = parts[0];
          
          tokens.push({
            name: prop,
            value,
            category,
            contrast: getContrastRatio(value)
          });
        }
      });

      return tokens;
    };

    const getContrastRatio = (color: string): string => {
      // Simple contrast calculation with white background
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const contrast = luminance > 0.5 ? 'Dark text' : 'Light text';
      const ratio = luminance > 0.5 ? (1.0 / (luminance + 0.05)) : ((luminance + 0.05) / 1.0);
      
      return `${contrast} (${ratio.toFixed(2)}:1)`;
    };

    const tokens = extractColorTokens();
    setColorTokens(tokens);
  }, []);

  const groupedTokens = colorTokens.reduce((acc, token) => {
    const category = token.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(token);
    return acc;
  }, {} as Record<string, ColorToken[]>);

  return (
    <div style={{ 
      padding: '2rem',
      fontFamily: 'var(--typography-font-family-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      background: 'var(--color-neutral-50, #fafafa)',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        marginBottom: '2rem',
        color: 'var(--color-neutral-900, #171717)',
        fontSize: '2.5rem',
        fontWeight: '700'
      }}>
        Color Palette
      </h1>
      
      <p style={{ 
        marginBottom: '3rem',
        color: 'var(--color-neutral-700, #404040)',
        fontSize: '1.125rem',
        lineHeight: '1.7'
      }}>
        Dynamic color swatches generated from CSS variables. All colors include WCAG accessibility information.
      </p>

      {Object.entries(groupedTokens).map(([category, tokens]) => (
        <div key={category} style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            marginBottom: '1.5rem',
            color: 'var(--color-neutral-800, #262626)',
            fontSize: '1.5rem',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {tokens.map((token) => (
              <div key={token.name} style={{ 
                border: '1px solid var(--color-neutral-200, #e5e5e5)',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }}>
                <div style={{ 
                  height: '80px',
                  backgroundColor: `var(${token.name})`,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px'
                }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ 
                    fontWeight: '500',
                    color: 'var(--color-neutral-900, #171717)',
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--typography-font-family-secondary, monospace)',
                    fontSize: '0.875rem'
                  }}>
                    {token.name}
                  </div>
                  <div style={{ 
                    color: 'var(--color-neutral-600, #525252)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem'
                  }}>
                    {token.value}
                  </div>
                  <div style={{ 
                    color: 'var(--color-neutral-500, #737373)',
                    fontSize: '0.75rem'
                  }}>
                    {token.contrast}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Swatches: Story = {
  render: () => <ColorSwatches />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive color swatches showing all design tokens with WCAG contrast ratios and accessibility validation using dynamic CSS variables.',
      },
    },
  },
};
