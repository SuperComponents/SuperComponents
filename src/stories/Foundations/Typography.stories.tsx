import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Typography scale and font families using dynamic CSS variables',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface TypographyToken {
  name: string;
  value: string;
  category: string;
  type: 'font-family' | 'font-size' | 'font-weight' | 'line-height';
}

const TypographyShowcase = () => {
  const [typographyTokens, setTypographyTokens] = useState<TypographyToken[]>([]);
  
  useEffect(() => {
    // Extract typography tokens from CSS variables
    const extractTypographyTokens = () => {
      const tokens: TypographyToken[] = [];
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
        .filter(prop => prop.startsWith('--typography-') || prop.startsWith('--font-'));

      allProps.forEach(prop => {
        const value = styles.getPropertyValue(prop).trim();
        if (value) {
          const name = prop.replace('--typography-', '').replace('--font-', '');
          const parts = name.split('-');
          let type: TypographyToken['type'] = 'font-size';
          
          if (name.includes('font-family') || name.includes('family')) {
            type = 'font-family';
          } else if (name.includes('font-weight') || name.includes('weight')) {
            type = 'font-weight';
          } else if (name.includes('line-height')) {
            type = 'line-height';
          }
          
          tokens.push({
            name: prop,
            value,
            category: parts[0] || 'typography',
            type
          });
        }
      });

      return tokens;
    };

    const tokens = extractTypographyTokens();
    setTypographyTokens(tokens);
  }, []);

  const groupedTokens = typographyTokens.reduce((acc, token) => {
    const type = token.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(token);
    return acc;
  }, {} as Record<string, TypographyToken[]>);

  const renderFontFamilies = (tokens: TypographyToken[]) => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        marginBottom: '1.5rem',
        color: 'var(--color-neutral-800, #262626)',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Font Families
      </h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {tokens.map((token) => (
          <div key={token.name} style={{ 
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200, #e5e5e5)',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ 
              fontFamily: `var(${token.name})`,
              fontSize: '1.5rem',
              marginBottom: '0.5rem',
              color: 'var(--color-neutral-900, #171717)'
            }}>
              The quick brown fox jumps over the lazy dog
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: 'var(--color-neutral-600, #525252)',
              fontFamily: 'var(--typography-font-family-secondary, monospace)'
            }}>
              {token.name}: {token.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFontSizes = (tokens: TypographyToken[]) => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        marginBottom: '1.5rem',
        color: 'var(--color-neutral-800, #262626)',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Font Sizes
      </h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {tokens.map((token) => (
          <div key={token.name} style={{ 
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200, #e5e5e5)',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ 
              fontSize: `var(${token.name})`,
              color: 'var(--color-neutral-900, #171717)',
              fontFamily: 'var(--typography-font-family-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              minWidth: '200px'
            }}>
              Sample Text
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: 'var(--color-neutral-600, #525252)',
              fontFamily: 'var(--typography-font-family-secondary, monospace)'
            }}>
              {token.name}: {token.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFontWeights = (tokens: TypographyToken[]) => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        marginBottom: '1.5rem',
        color: 'var(--color-neutral-800, #262626)',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Font Weights
      </h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {tokens.map((token) => (
          <div key={token.name} style={{ 
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200, #e5e5e5)',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ 
              fontWeight: `var(${token.name})`,
              fontSize: '1.25rem',
              color: 'var(--color-neutral-900, #171717)',
              fontFamily: 'var(--typography-font-family-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              minWidth: '200px'
            }}>
              Sample Text
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: 'var(--color-neutral-600, #525252)',
              fontFamily: 'var(--typography-font-family-secondary, monospace)'
            }}>
              {token.name}: {token.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLineHeights = (tokens: TypographyToken[]) => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        marginBottom: '1.5rem',
        color: 'var(--color-neutral-800, #262626)',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Line Heights
      </h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {tokens.map((token) => (
          <div key={token.name} style={{ 
            padding: '1.5rem',
            border: '1px solid var(--color-neutral-200, #e5e5e5)',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ 
              lineHeight: `var(${token.name})`,
              fontSize: '1rem',
              color: 'var(--color-neutral-900, #171717)',
              fontFamily: 'var(--typography-font-family-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              marginBottom: '0.5rem'
            }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: 'var(--color-neutral-600, #525252)',
              fontFamily: 'var(--typography-font-family-secondary, monospace)'
            }}>
              {token.name}: {token.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
        Typography Scale
      </h1>
      
      <p style={{ 
        marginBottom: '3rem',
        color: 'var(--color-neutral-700, #404040)',
        fontSize: '1.125rem',
        lineHeight: '1.7'
      }}>
        Dynamic typography tokens including font families, sizes, weights, and line heights using CSS variables.
      </p>

      {groupedTokens['font-family'] && renderFontFamilies(groupedTokens['font-family'])}
      {groupedTokens['font-size'] && renderFontSizes(groupedTokens['font-size'])}
      {groupedTokens['font-weight'] && renderFontWeights(groupedTokens['font-weight'])}
      {groupedTokens['line-height'] && renderLineHeights(groupedTokens['line-height'])}
    </div>
  );
};

export const Showcase: Story = {
  render: () => <TypographyShowcase />,
  parameters: {
    docs: {
      description: {
        story: 'Typography scale showing all font families, sizes, weights, and line heights using dynamic CSS variables.',
      },
    },
  },
};
