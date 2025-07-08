import { TokenGenerator } from '../tokens.js';
import { DesignInsight } from '../../types/index.js';

describe('TokenGenerator', () => {
  let generator: TokenGenerator;
  let mockInsight: DesignInsight;

  beforeEach(() => {
    generator = new TokenGenerator();
    mockInsight = {
      imageryPalette: ['#3b82f6', '#10b981', '#ef4444'],
      typographyFamilies: ['Inter', 'Monaco'],
      spacingScale: [4, 8, 12, 16, 20, 24, 32, 40],
      uiDensity: 'regular',
      brandKeywords: ['modern', 'clean', 'professional'],
      supportingReferences: []
    };
  });

  describe('generateTokens', () => {
    it('should generate W3C compliant tokens', () => {
      const tokens = generator.generateTokens(mockInsight);
      
      expect(tokens).toHaveProperty('color');
      expect(tokens).toHaveProperty('typography');
      expect(tokens).toHaveProperty('spacing');
      expect(tokens).toHaveProperty('sizing');
      expect(tokens).toHaveProperty('borderRadius');
      expect(tokens).toHaveProperty('shadow');
      expect(tokens).toHaveProperty('transition');
    });

    it('should include $type and $value properties', () => {
      const tokens = generator.generateTokens(mockInsight) as any;
      
      // Check color tokens
      const primaryColor = tokens.color?.primary?.[500];
      expect(primaryColor).toHaveProperty('$type', 'color');
      expect(primaryColor).toHaveProperty('$value');
      
      // Check typography tokens
      const fontSize = tokens.typography?.fontSize?.base;
      expect(fontSize).toHaveProperty('$type', 'fontSize');
      expect(fontSize).toHaveProperty('$value');
      
      // Check spacing tokens
      const spacing = tokens.spacing?.md;
      expect(spacing).toHaveProperty('$type', 'spacing');
      expect(spacing).toHaveProperty('$value');
    });

    it('should generate primary color palette from first imagery color', () => {
      const tokens = generator.generateTokens(mockInsight);
      const primaryColor = tokens.color?.primary?.[500];
      
      expect(primaryColor?.$value).toBe('#3b82f6');
    });

    it('should generate secondary color palette from second imagery color', () => {
      const tokens = generator.generateTokens(mockInsight);
      const secondaryColor = tokens.color?.secondary?.[500];
      
      expect(secondaryColor?.$value).toBe('#10b981');
    });

    it('should include semantic colors', () => {
      const tokens = generator.generateTokens(mockInsight);
      
      expect(tokens.color?.semantic?.success).toHaveProperty('$type', 'color');
      expect(tokens.color?.semantic?.warning).toHaveProperty('$type', 'color');
      expect(tokens.color?.semantic?.error).toHaveProperty('$type', 'color');
      expect(tokens.color?.semantic?.info).toHaveProperty('$type', 'color');
    });

    it('should generate font family tokens from typography families', () => {
      const tokens = generator.generateTokens(mockInsight);
      
      const primaryFont = tokens.typography?.fontFamily?.primary;
      expect(primaryFont?.$value).toEqual(['Inter', 'sans-serif']);
      
      const secondaryFont = tokens.typography?.fontFamily?.secondary;
      expect(secondaryFont?.$value).toEqual(['Monaco', 'sans-serif']);
    });

    it('should adjust spacing based on UI density', () => {
      const compactGenerator = new TokenGenerator();
      const spaciousGenerator = new TokenGenerator();
      
      const compactInsight = { ...mockInsight, uiDensity: 'compact' as const };
      const spaciousInsight = { ...mockInsight, uiDensity: 'spacious' as const };
      
      const regularTokens = generator.generateTokens(mockInsight);
      const compactTokens = compactGenerator.generateTokens(compactInsight);
      const spaciousTokens = spaciousGenerator.generateTokens(spaciousInsight);
      
      // Extract spacing values
      const regularSpacing = regularTokens.spacing?.md?.$value;
      const compactSpacing = compactTokens.spacing?.md?.$value;
      const spaciousSpacing = spaciousTokens.spacing?.md?.$value;
      
      expect(regularSpacing).toBe('16px');
      expect(compactSpacing).toBe('14px'); // 16 * 0.875
      expect(spaciousSpacing).toBe('18px'); // 16 * 1.125
    });

    it('should generate border radius tokens based on UI density', () => {
      const compactInsight = { ...mockInsight, uiDensity: 'compact' as const };
      const spaciousInsight = { ...mockInsight, uiDensity: 'spacious' as const };
      
      const regularTokens = generator.generateTokens(mockInsight);
      const compactTokens = generator.generateTokens(compactInsight);
      const spaciousTokens = generator.generateTokens(spaciousInsight);
      
      const regularRadius = regularTokens.borderRadius?.md?.$value;
      const compactRadius = compactTokens.borderRadius?.md?.$value;
      const spaciousRadius = spaciousTokens.borderRadius?.md?.$value;
      
      expect(regularRadius).toBe('4px');
      expect(compactRadius).toBe('2px');
      expect(spaciousRadius).toBe('8px');
    });

    it('should generate shadow tokens', () => {
      const tokens = generator.generateTokens(mockInsight);
      
      expect(tokens.shadow?.sm).toHaveProperty('$type', 'shadow');
      expect(tokens.shadow?.md).toHaveProperty('$type', 'shadow');
      expect(tokens.shadow?.lg).toHaveProperty('$type', 'shadow');
      expect(tokens.shadow?.inner).toHaveProperty('$type', 'shadow');
    });

    it('should generate transition tokens', () => {
      const tokens = generator.generateTokens(mockInsight);
      
      expect(tokens.transition?.duration?.fast).toHaveProperty('$type', 'duration');
      expect(tokens.transition?.duration?.normal).toHaveProperty('$type', 'duration');
      expect(tokens.transition?.timingFunction?.ease).toHaveProperty('$type', 'cubicBezier');
    });
  });

  describe('convertToLegacyFormat', () => {
    it('should convert W3C tokens to legacy format', () => {
      const w3cTokens = generator.generateTokens(mockInsight);
      const legacyTokens = generator.convertToLegacyFormat(w3cTokens);
      
      expect(legacyTokens).toHaveProperty('colors');
      expect(legacyTokens).toHaveProperty('typography');
      expect(legacyTokens).toHaveProperty('spacing');
      expect(legacyTokens).toHaveProperty('borderRadius');
      
      // Check typography structure
      expect(legacyTokens.typography).toHaveProperty('fonts');
      expect(legacyTokens.typography).toHaveProperty('sizes');
      expect(legacyTokens.typography).toHaveProperty('weights');
      expect(legacyTokens.typography).toHaveProperty('lineHeights');
      
      // Check if fonts are extracted correctly
      expect(legacyTokens.typography.fonts).toContain('Inter');
      expect(legacyTokens.typography.fonts).toContain('Monaco');
    });

    it('should flatten nested color tokens', () => {
      const w3cTokens = generator.generateTokens(mockInsight);
      const legacyTokens = generator.convertToLegacyFormat(w3cTokens);
      
      expect(legacyTokens.colors).toHaveProperty('primary-500');
      expect(legacyTokens.colors).toHaveProperty('secondary-500');
      expect(legacyTokens.colors).toHaveProperty('neutral-500');
      expect(legacyTokens.colors).toHaveProperty('semantic-success');
    });
  });

  describe('validateContrast', () => {
    it('should validate contrast ratios correctly', () => {
      const result = generator.validateContrast('#000000', '#ffffff');
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 1);
    });

    it('should fail low contrast combinations', () => {
      const result = generator.validateContrast('#cccccc', '#ffffff');
      
      expect(result.passes).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
      expect(result.adjustedColor).toBeDefined();
    });

    it('should suggest adjusted colors for failed combinations', () => {
      const result = generator.validateContrast('#cccccc', '#ffffff');
      
      expect(result.adjustedColor).toBeDefined();
      
      if (result.adjustedColor) {
        const adjustedResult = generator.validateContrast(result.adjustedColor, '#ffffff');
        expect(adjustedResult.passes).toBe(true);
      }
    });
  });

  describe('WCAG enforcement', () => {
    it('should enforce WCAG contrast when enabled', () => {
      const wcagGenerator = new TokenGenerator({ enforceWCAG: true });
      const tokens = wcagGenerator.generateTokens(mockInsight);
      
      // Check that semantic colors meet contrast requirements
      const successColor = tokens.color?.semantic?.success?.$value;
      const errorColor = tokens.color?.semantic?.error?.$value;
      
      if (successColor) {
        const successContrast = wcagGenerator.validateContrast(successColor, '#ffffff');
        expect(successContrast.passes).toBe(true);
      }
      
      if (errorColor) {
        const errorContrast = wcagGenerator.validateContrast(errorColor, '#ffffff');
        expect(errorContrast.passes).toBe(true);
      }
    });

    it('should allow disabling WCAG enforcement', () => {
      const noWcagGenerator = new TokenGenerator({ enforceWCAG: false });
      const tokens = noWcagGenerator.generateTokens(mockInsight);
      
      // Tokens should still be generated even if they don't meet contrast requirements
      expect(tokens.color?.semantic?.success).toBeDefined();
      expect(tokens.color?.semantic?.error).toBeDefined();
    });

    it('should respect custom contrast ratio', () => {
      const customGenerator = new TokenGenerator({ minContrastRatio: 7.0 });
      const result = customGenerator.validateContrast('#666666', '#ffffff');
      
      // Should fail with AAA level requirement
      expect(result.passes).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty imagery palette', () => {
      const emptyInsight = { ...mockInsight, imageryPalette: [] };
      const tokens = generator.generateTokens(emptyInsight);
      
      expect(tokens.color?.neutral).toBeDefined();
      expect(tokens.color?.semantic).toBeDefined();
    });

    it('should handle single color in palette', () => {
      const singleColorInsight = { ...mockInsight, imageryPalette: ['#3b82f6'] };
      const tokens = generator.generateTokens(singleColorInsight);
      
      expect(tokens.color?.primary).toBeDefined();
      expect(tokens.color?.secondary).toBeUndefined();
    });

    it('should handle empty typography families', () => {
      const emptyTypographyInsight = { ...mockInsight, typographyFamilies: [] };
      const tokens = generator.generateTokens(emptyTypographyInsight);
      
      expect(tokens.typography?.fontSize).toBeDefined();
      expect(tokens.typography?.fontWeight).toBeDefined();
      expect(tokens.typography?.lineHeight).toBeDefined();
    });

    it('should handle empty spacing scale', () => {
      const emptySpacingInsight = { ...mockInsight, spacingScale: [] };
      const tokens = generator.generateTokens(emptySpacingInsight);
      
      expect(tokens.spacing?.md).toBeDefined();
      expect(tokens.spacing?.lg).toBeDefined();
    });

    it('should handle invalid hex colors gracefully', () => {
      const invalidColorInsight = { ...mockInsight, imageryPalette: ['invalid-color'] };
      
      expect(() => generator.generateTokens(invalidColorInsight)).not.toThrow();
    });
  });

  describe('color manipulation', () => {
    it('should lighten colors correctly', () => {
      const originalColor = '#3b82f6';
      const tokens = generator.generateTokens(mockInsight);
      
      const lighterShade = tokens.color?.primary?.[100]?.$value;
      expect(lighterShade).toBeDefined();
      expect(lighterShade).not.toBe(originalColor);
    });

    it('should darken colors correctly', () => {
      const originalColor = '#3b82f6';
      const tokens = generator.generateTokens(mockInsight);
      
      const darkerShade = tokens.color?.primary?.[900]?.$value;
      expect(darkerShade).toBeDefined();
      expect(darkerShade).not.toBe(originalColor);
    });

    it('should generate complete color scales', () => {
      const tokens = generator.generateTokens(mockInsight);
      const primaryColors = tokens.color?.primary;
      
      const expectedShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      expectedShades.forEach(shade => {
        expect(primaryColors?.[shade]).toBeDefined();
        expect(primaryColors?.[shade]?.$type).toBe('color');
        expect(primaryColors?.[shade]?.$value).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });
});
