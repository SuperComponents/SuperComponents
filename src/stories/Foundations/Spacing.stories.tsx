import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

const meta: Meta = {
  title: 'Foundations/Spacing',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Spacing scale and sizing tokens using dynamic CSS variables',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface SpacingToken {
  name: string;
  value: string;
  category: string;
  type: 'spacing' | 'sizing';
}

const SpacingShowcase = () => {
  const [spacingTokens, setSpacingTokens] = useState<SpacingToken[]>([]);
  
  useEffect(() => {
    // Extract spacing and sizing tokens from CSS variables
    const extractSpacingTokens = () => {
      const tokens: SpacingToken[] = [];
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
        .filter(prop => prop.startsWith('--spacing-') || prop.startsWith('--sizing-'));

      allProps.forEach(prop => {
        const value = styles.getPropertyValue(prop).trim();
        if (value) {
          const name = prop.replace('--spacing-', '').replace('--sizing-', '');
          const type = prop.startsWith('--spacing-') ? 'spacing' : 'sizing';
          
          tokens.push({
            name: prop,
            value,
            category: name,
            type
          });
        }
      });

      // Sort tokens by numeric value for better visualization
      return tokens.sort((a, b) => {
        const aValue = parseFloat(a.value);
        const bValue = parseFloat(b.value);
        return aValue - bValue;
      });
    };

    const tokens = extractSpacingTokens();
    setSpacingTokens(tokens);
  }, []);

  const groupedTokens = spacingTokens.reduce((acc, token) => {
    const type = token.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(token);
    return acc;
  }, {} as Record<string, SpacingToken[]>);

  const renderSpacingTokens = (tokens: SpacingToken[], title: string) => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        marginBottom: '1.5rem',
        color: 'var(--color-neutral-800, #262626)',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        {title}
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
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--color-neutral-600, #525252)',
                fontFamily: 'var(--typography-font-family-secondary, monospace)',
                minWidth: '200px'
              }}>
                {token.name}: {token.value}
              </div>
              <div style={{ 
                fontSize: '0.75rem',
                color: 'var(--color-neutral-500, #737373)',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--color-neutral-100, #f5f5f5)',
                borderRadius: '4px'
              }}>
                {parseFloat(token.value)}px
              </div>
            </div>
            
            {/* Visual representation */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                fontSize: '0.75rem',
                color: 'var(--color-neutral-500, #737373)',
                minWidth: '60px'
              }}>
                {token.type === 'spacing' ? 'Padding:' : 'Size:'}
              </div>
              <div style={{ 
                backgroundColor: 'var(--color-primary-100, #dbeafe)',
                border: '1px solid var(--color-primary-300, #93c5fd)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: 'var(--color-primary-700, #1d4ed8)',
                fontWeight: '500',
                ...(token.type === 'spacing' ? {
                  padding: `var(${token.name})`,
                  minHeight: '40px'
                } : {
                  width: `var(${token.name})`,
                  height: `var(${token.name})`,
                  minWidth: '20px',
                  minHeight: '20px'
                })
              }}>
                {token.type === 'spacing' ? 'Content with padding' : 'Box'}
              </div>
            </div>
            
            {/* Margin example for spacing tokens */}
            {token.type === 'spacing' && (
              <div style={{ 
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--color-neutral-500, #737373)',
                  minWidth: '60px'
                }}>
                  Margin:
                </div>
                <div style={{ 
                  backgroundColor: 'var(--color-secondary-100, #e7f8f2)',
                  border: '1px solid var(--color-secondary-300, #9fe3cd)',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-secondary-700, #0a6f4d)',
                  fontWeight: '500'
                }}>
                  <div style={{ 
                    backgroundColor: 'var(--color-secondary-200, #cff1e6)',
                    margin: `var(${token.name})`,
                    padding: '0.5rem',
                    textAlign: 'center',
                    minHeight: '20px'
                  }}>
                    Content with margin
                  </div>
                </div>
              </div>
            )}
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
        Spacing & Sizing Scale
      </h1>
      
      <p style={{ 
        marginBottom: '3rem',
        color: 'var(--color-neutral-700, #404040)',
        fontSize: '1.125rem',
        lineHeight: '1.7'
      }}>
        Dynamic spacing and sizing tokens for consistent layout and component dimensions using CSS variables.
      </p>

      {groupedTokens.spacing && renderSpacingTokens(groupedTokens.spacing, 'Spacing Scale')}
      {groupedTokens.sizing && renderSpacingTokens(groupedTokens.sizing, 'Sizing Scale')}
    </div>
  );
};

export const Showcase: Story = {
  render: () => <SpacingShowcase />,
  parameters: {
    docs: {
      description: {
        story: 'Spacing and sizing scale showing all tokens with visual examples using dynamic CSS variables.',
      },
    },
  },
};
