import { TailwindConfigGenerator } from '../tailwind-config.js';
import { TokenGenerator, W3CDesignTokens } from '../tokens.js';
import { DesignInsight } from '../../types/index.js';

describe('TailwindConfigGenerator', () => {
  let generator: TailwindConfigGenerator;
  let tokenGenerator: TokenGenerator;
  let mockTokens: W3CDesignTokens;

  beforeEach(() => {
    generator = new TailwindConfigGenerator();
    tokenGenerator = new TokenGenerator();
    
    const mockInsight: DesignInsight = {
      imageryPalette: ['#3b82f6', '#10b981'],
      typographyFamilies: ['Inter', 'Monaco'],
      spacingScale: [4, 8, 12, 16, 20, 24, 32, 40],
      uiDensity: 'regular',
      brandKeywords: ['modern', 'clean'],
      supportingReferences: []
    };
    
    mockTokens = tokenGenerator.generateTokens(mockInsight);
  });

  describe('generateConfig', () => {
    it('should generate valid TypeScript config', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain("import type { Config } from 'tailwindcss'");
      expect(config).toContain('const config: Config =');
      expect(config).toContain('export default config');
    });

    it('should include content paths', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"./src/**/*.{js,ts,jsx,tsx,mdx}"');
      expect(config).toContain('"./components/**/*.{js,ts,jsx,tsx,mdx}"');
    });

    it('should include color tokens in theme', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"colors"');
      expect(config).toContain('"primary"');
      expect(config).toContain('"secondary"');
      expect(config).toContain('"neutral"');
      expect(config).toContain('"semantic"');
    });

    it('should include typography tokens', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"fontFamily"');
      expect(config).toContain('"fontSize"');
      expect(config).toContain('"fontWeight"');
      expect(config).toContain('"lineHeight"');
    });

    it('should include spacing tokens', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"spacing"');
    });

    it('should include sizing tokens as width and height', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"width"');
      expect(config).toContain('"height"');
    });

    it('should include border radius tokens', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"borderRadius"');
    });

    it('should include shadow tokens as box shadow', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"boxShadow"');
    });

    it('should include transition tokens', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"transitionDuration"');
      expect(config).toContain('"transitionTimingFunction"');
    });
  });

  describe('generateConfig with options', () => {
    it('should include prefix when specified', () => {
      const customGenerator = new TailwindConfigGenerator({ prefix: 'tw-' });
      const config = customGenerator.generateConfig(mockTokens);
      
      expect(config).toContain('"prefix": "tw-"');
    });

    it('should include important when specified', () => {
      const customGenerator = new TailwindConfigGenerator({ important: true });
      const config = customGenerator.generateConfig(mockTokens);
      
      expect(config).toContain('"important": true');
    });

    it('should include core plugins when specified', () => {
      const customGenerator = new TailwindConfigGenerator({ 
        corePlugins: ['padding', 'margin'] 
      });
      const config = customGenerator.generateConfig(mockTokens);
      
      expect(config).toContain('"corePlugins"');
      expect(config).toContain('"padding"');
      expect(config).toContain('"margin"');
    });

    it('should include custom plugins when specified', () => {
      const customGenerator = new TailwindConfigGenerator({ 
        plugins: ['@tailwindcss/forms', '@tailwindcss/typography'] 
      });
      const config = customGenerator.generateConfig(mockTokens);
      
      expect(config).toContain('"plugins"');
      expect(config).toContain('"@tailwindcss/forms"');
      expect(config).toContain('"@tailwindcss/typography"');
    });
  });

  describe('generateUtilities', () => {
    it('should generate utility classes', () => {
      const utilities = generator.generateUtilities(mockTokens);
      
      expect(utilities).toContain('@layer utilities');
    });

    it('should create CSS classes for color tokens', () => {
      const utilities = generator.generateUtilities(mockTokens);
      
      expect(utilities).toContain('.primary-500');
      expect(utilities).toContain('.secondary-500');
    });

    it('should map token types to CSS properties', () => {
      const utilities = generator.generateUtilities(mockTokens);
      
      // Color tokens should use color property
      expect(utilities).toContain('"color"');
      
      // Font size tokens should use font-size property
      expect(utilities).toContain('"font-size"');
    });
  });

  describe('generateCSSCustomProperties', () => {
    it('should generate CSS custom properties', () => {
      const css = generator.generateCSSCustomProperties(mockTokens);
      
      expect(css).toContain(':root {');
      expect(css).toContain('--');
      expect(css).toContain('}');
    });

    it('should create variables for all token types', () => {
      const css = generator.generateCSSCustomProperties(mockTokens);
      
      expect(css).toContain('--color-primary');
      expect(css).toContain('--typography-font-size');
      expect(css).toContain('--spacing-');
      expect(css).toContain('--sizing-');
    });

    it('should use kebab-case for variable names', () => {
      const css = generator.generateCSSCustomProperties(mockTokens);
      
      // Should convert camelCase to kebab-case
      expect(css).toContain('--border-radius');
      expect(css).toContain('--transition-duration');
    });

    it('should include token values', () => {
      const css = generator.generateCSSCustomProperties(mockTokens);
      
      expect(css).toContain('#3b82f6'); // Primary color
      expect(css).toContain('16px'); // Spacing value
      expect(css).toContain('1rem'); // Font size value
    });
  });

  describe('color mapping', () => {
    it('should map color groups correctly', () => {
      const config = generator.generateConfig(mockTokens);
      
      // Should contain primary color with all shades
      expect(config).toContain('"50"');
      expect(config).toContain('"100"');
      expect(config).toContain('"500"');
      expect(config).toContain('"900"');
      expect(config).toContain('"950"');
    });

    it('should map semantic colors as single values', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"success"');
      expect(config).toContain('"error"');
      expect(config).toContain('"warning"');
      expect(config).toContain('"info"');
    });
  });

  describe('font family mapping', () => {
    it('should map font families correctly', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"primary"');
      expect(config).toContain('"secondary"');
      expect(config).toContain('["Inter","sans-serif"]');
      expect(config).toContain('["Monaco","sans-serif"]');
    });
  });

  describe('spacing and sizing mapping', () => {
    it('should map spacing tokens correctly', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"xs"');
      expect(config).toContain('"sm"');
      expect(config).toContain('"md"');
      expect(config).toContain('"lg"');
      expect(config).toContain('"xl"');
    });

    it('should map sizing tokens to both width and height', () => {
      const config = generator.generateConfig(mockTokens);
      const configObj = JSON.parse(config.match(/const config: Config = ({.*});/s)?.[1] || '{}');
      
      expect(configObj.theme.extend.width).toBeDefined();
      expect(configObj.theme.extend.height).toBeDefined();
      
      // Should have the same values for both width and height
      expect(configObj.theme.extend.width).toEqual(configObj.theme.extend.height);
    });
  });

  describe('transition mapping', () => {
    it('should map transition duration tokens', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"transitionDuration"');
      expect(config).toContain('"fast"');
      expect(config).toContain('"normal"');
      expect(config).toContain('"slow"');
    });

    it('should map transition timing function tokens', () => {
      const config = generator.generateConfig(mockTokens);
      
      expect(config).toContain('"transitionTimingFunction"');
      expect(config).toContain('"ease"');
      expect(config).toContain('"easeIn"');
      expect(config).toContain('"easeOut"');
      expect(config).toContain('"easeInOut"');
    });
  });

  describe('edge cases', () => {
    it('should handle empty tokens', () => {
      const emptyTokens: W3CDesignTokens = {};
      const config = generator.generateConfig(emptyTokens);
      
      expect(config).toContain('const config: Config =');
      expect(config).toContain('export default config');
    });

    it('should handle tokens without specific categories', () => {
      const partialTokens: W3CDesignTokens = {
        color: {
          primary: { $type: 'color', $value: '#3b82f6' }
        }
      };
      
      const config = generator.generateConfig(partialTokens);
      
      expect(config).toContain('"primary"');
      expect(config).toContain('#3b82f6');
    });

    it('should handle malformed token values gracefully', () => {
      const malformedTokens: W3CDesignTokens = {
        color: {
          primary: { $type: 'color', $value: null }
        }
      };
      
      expect(() => generator.generateConfig(malformedTokens)).not.toThrow();
    });
  });

  describe('TypeScript formatting', () => {
    it('should generate properly formatted TypeScript', () => {
      const config = generator.generateConfig(mockTokens);
      
      // Should have proper imports
      expect(config).toMatch(/^import type { Config } from 'tailwindcss';/);
      
      // Should have proper variable declaration
      expect(config).toContain('const config: Config =');
      
      // Should have proper export
      expect(config).toMatch(/export default config;$/);
      
      // Should be properly formatted JSON
      const jsonMatch = config.match(/const config: Config = ({.*});/s);
      expect(jsonMatch).toBeTruthy();
      
      if (jsonMatch) {
        expect(() => JSON.parse(jsonMatch[1])).not.toThrow();
      }
    });

    it('should include proper indentation', () => {
      const config = generator.generateConfig(mockTokens);
      
      // Should have 2-space indentation
      expect(config).toContain('  "content"');
      expect(config).toContain('    "./src/**/*.{js,ts,jsx,tsx,mdx}"');
    });
  });
});
