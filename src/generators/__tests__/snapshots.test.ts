import { describe, it, expect, beforeEach } from 'vitest';
import { TokenGenerator } from '../tokens.js';
import { TailwindConfigGenerator } from '../tailwind-config.js';
import { DesignInsight } from '../../types/index.js';

describe('Snapshot Tests', () => {
  let tokenGenerator: TokenGenerator;
  let tailwindGenerator: TailwindConfigGenerator;
  let mockInsight: DesignInsight;

  beforeEach(() => {
    tokenGenerator = new TokenGenerator();
    tailwindGenerator = new TailwindConfigGenerator();
    
    mockInsight = {
      imageryPalette: ['#3b82f6', '#10b981', '#ef4444'],
      typographyFamilies: ['Inter', 'Monaco'],
      spacingScale: [4, 8, 12, 16, 20, 24, 32, 40],
      uiDensity: 'regular',
      brandKeywords: ['modern', 'clean', 'professional'],
      supportingReferences: ['Clean interface', 'Modern typography']
    };
  });

  describe('Design Tokens JSON Output', () => {
    it('should generate consistent tokens/design-tokens.json structure', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      
      // Snapshot test for the complete token structure
      expect(tokens).toMatchSnapshot();
    });

    it('should generate consistent color tokens', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      
      // Snapshot test for color tokens specifically
      expect(tokens.color).toMatchSnapshot();
    });

    it('should generate consistent typography tokens', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      
      // Snapshot test for typography tokens specifically
      expect(tokens.typography).toMatchSnapshot();
    });

    it('should generate consistent spacing tokens', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      
      // Snapshot test for spacing tokens specifically
      expect(tokens.spacing).toMatchSnapshot();
    });
  });

  describe('Tailwind Config Output', () => {
    it('should generate consistent tailwind.config.ts structure', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      const config = tailwindGenerator.generateConfig(tokens);
      
      // Snapshot test for the complete tailwind config
      expect(config).toMatchSnapshot();
    });

    it('should generate consistent tailwind config with custom options', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      const customGenerator = new TailwindConfigGenerator({
        prefix: 'tw-',
        important: true,
        plugins: ['@tailwindcss/forms']
      });
      const config = customGenerator.generateConfig(tokens);
      
      // Snapshot test for custom tailwind config
      expect(config).toMatchSnapshot();
    });

    it('should generate consistent CSS utilities', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      const utilities = tailwindGenerator.generateUtilities(tokens);
      
      // Snapshot test for CSS utilities
      expect(utilities).toMatchSnapshot();
    });

    it('should generate consistent CSS custom properties', () => {
      const tokens = tokenGenerator.generateTokens(mockInsight);
      const css = tailwindGenerator.generateCSSCustomProperties(tokens);
      
      // Snapshot test for CSS custom properties
      expect(css).toMatchSnapshot();
    });
  });

  describe('Different UI Density Snapshots', () => {
    it('should generate consistent compact UI tokens', () => {
      const compactInsight = { ...mockInsight, uiDensity: 'compact' as const };
      const tokens = tokenGenerator.generateTokens(compactInsight);
      
      expect(tokens.spacing).toMatchSnapshot();
      expect(tokens.borderRadius).toMatchSnapshot();
    });

    it('should generate consistent spacious UI tokens', () => {
      const spaciousInsight = { ...mockInsight, uiDensity: 'spacious' as const };
      const tokens = tokenGenerator.generateTokens(spaciousInsight);
      
      expect(tokens.spacing).toMatchSnapshot();
      expect(tokens.borderRadius).toMatchSnapshot();
    });
  });

  describe('Legacy Format Snapshots', () => {
    it('should generate consistent legacy format tokens', () => {
      const w3cTokens = tokenGenerator.generateTokens(mockInsight);
      const legacyTokens = tokenGenerator.convertToLegacyFormat(w3cTokens);
      
      // Snapshot test for legacy format conversion
      expect(legacyTokens).toMatchSnapshot();
    });
  });
});
