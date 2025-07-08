import { WCAGValidator } from '../wcag-validator.js';
import { TokenGenerator, W3CDesignTokens } from '../tokens.js';
import { DesignInsight } from '../../types/index.js';

describe('WCAGValidator', () => {
  let validator: WCAGValidator;
  let tokenGenerator: TokenGenerator;
  let mockTokens: W3CDesignTokens;

  beforeEach(() => {
    validator = new WCAGValidator();
    tokenGenerator = new TokenGenerator();
    
    const mockInsight: DesignInsight = {
      imageryPalette: ['#3b82f6', '#10b981', '#ef4444'],
      typographyFamilies: ['Inter', 'Monaco'],
      spacingScale: [4, 8, 12, 16, 20, 24, 32, 40],
      uiDensity: 'regular',
      brandKeywords: ['modern', 'clean'],
      supportingReferences: []
    };
    
    mockTokens = tokenGenerator.generateTokens(mockInsight);
  });

  describe('validateColorCombination', () => {
    it('should validate high contrast combinations', () => {
      const result = validator.validateColorCombination('#000000', '#ffffff');
      
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 1);
      expect(result.level).toBe('AAA');
    });

    it('should fail low contrast combinations', () => {
      const result = validator.validateColorCombination('#cccccc', '#ffffff');
      
      expect(result.passes).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
      expect(result.level).toBe('fail');
    });

    it('should identify AA level contrast', () => {
      const result = validator.validateColorCombination('#666666', '#ffffff');
      
      expect(result.level).toBe('AA');
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      expect(result.ratio).toBeLessThan(7.0);
    });

    it('should provide adjusted colors for failed combinations', () => {
      const result = validator.validateColorCombination('#cccccc', '#ffffff');
      
      expect(result.adjustedForeground).toBeDefined();
      
      if (result.adjustedForeground) {
        const adjustedResult = validator.validateColorCombination(result.adjustedForeground, '#ffffff');
        expect(adjustedResult.passes).toBe(true);
      }
    });
  });

  describe('validateTokens', () => {
    it('should validate all color combinations in tokens', () => {
      const results = validator.validateTokens(mockTokens);
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result).toHaveProperty('passes');
        expect(result).toHaveProperty('ratio');
        expect(result).toHaveProperty('level');
        expect(result).toHaveProperty('foreground');
        expect(result).toHaveProperty('background');
      });
    });

    it('should include both passing and failing results', () => {
      const results = validator.validateTokens(mockTokens);
      
      const passing = results.filter(r => r.passes);
      const failing = results.filter(r => !r.passes);
      
      expect(passing.length).toBeGreaterThan(0);
      expect(failing.length).toBeGreaterThan(0);
    });
  });

  describe('generateSwatchHTML', () => {
    it('should generate valid HTML', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should include CSS styles', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('<style>');
      expect(html).toContain('swatch-grid');
      expect(html).toContain('swatch-card');
      expect(html).toContain('swatch-color');
    });

    it('should include color swatches', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('primary-500');
      expect(html).toContain('secondary-500');
      expect(html).toContain('#3b82f6');
      expect(html).toContain('#10b981');
    });

    it('should include color information', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('HEX:');
      expect(html).toContain('RGB:');
      expect(html).toContain('HSL:');
      expect(html).toContain('Luminance');
      expect(html).toContain('Contrast');
    });

    it('should include validation section when requested', () => {
      const html = validator.generateSwatchHTML(mockTokens, true);
      
      expect(html).toContain('WCAG Contrast Validation');
      expect(html).toContain('validation-card');
      expect(html).toContain('validation-preview');
    });

    it('should exclude validation section when not requested', () => {
      const html = validator.generateSwatchHTML(mockTokens, false);
      
      expect(html).not.toContain('WCAG Contrast Validation');
      expect(html).not.toContain('validation-card');
    });

    it('should apply appropriate text colors for contrast', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      // Should contain both white and black text colors
      expect(html).toContain('color: white');
      expect(html).toContain('color: black');
    });

    it('should include contrast ratio badges', () => {
      const html = validator.generateSwatchHTML(mockTokens, true);
      
      expect(html).toContain('ratio-badge');
      expect(html).toContain('PASS');
      expect(html).toContain('FAIL');
    });
  });

  describe('generateAccessibilityReport', () => {
    it('should generate markdown report', () => {
      const report = validator.generateAccessibilityReport(mockTokens);
      
      expect(report).toContain('# WCAG Accessibility Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('Overall Pass Rate');
    });

    it('should include statistics', () => {
      const report = validator.generateAccessibilityReport(mockTokens);
      
      expect(report).toContain('AA Level:');
      expect(report).toContain('AAA Level:');
      expect(report).toContain('Failed:');
    });

    it('should include failed combinations', () => {
      const report = validator.generateAccessibilityReport(mockTokens);
      
      expect(report).toContain('## Failed Combinations');
      expect(report).toContain('Ratio:');
      expect(report).toContain('minimum:');
    });

    it('should include suggested improvements', () => {
      const report = validator.generateAccessibilityReport(mockTokens);
      
      expect(report).toMatch(/Suggested (foreground|background):/);
    });
  });

  describe('custom contrast ratios', () => {
    it('should use custom minimum contrast ratio', () => {
      const customValidator = new WCAGValidator(7.0);
      const result = customValidator.validateColorCombination('#666666', '#ffffff');
      
      expect(result.passes).toBe(false); // Should fail with AAA requirement
    });

    it('should use custom large text ratio', () => {
      const customValidator = new WCAGValidator(4.5, 2.0);
      const result = customValidator.validateColorCombination('#999999', '#ffffff');
      
      // Should pass for large text with lower requirement
      expect(result.ratio).toBeGreaterThan(2.0);
    });
  });

  describe('color manipulation helpers', () => {
    it('should convert hex to RGB correctly', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      // Should contain proper RGB values for #3b82f6
      expect(html).toContain('RGB: rgb(59, 130, 246)');
    });

    it('should convert RGB to HSL correctly', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      // Should contain HSL values
      expect(html).toMatch(/HSL: hsl\(\d+°, \d+%, \d+%\)/);
    });

    it('should calculate luminance correctly', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      // Should contain luminance values
      expect(html).toMatch(/Luminance[\s\S]*?\d+\.\d+/);
    });
  });

  describe('swatch data generation', () => {
    it('should generate complete swatch data', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      // Should contain all required swatch information
      expect(html).toContain('swatch-name');
      expect(html).toContain('swatch-value');
      expect(html).toContain('swatch-metrics');
      expect(html).toContain('metric-label');
      expect(html).toContain('metric-value');
    });

    it('should calculate contrast with both white and black', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      // Should show contrast ratios
      expect(html).toMatch(/\d+\.\d+:1/);
    });
  });

  describe('validation test combinations', () => {
    it('should test common UI combinations', () => {
      const html = validator.generateSwatchHTML(mockTokens, true);
      
      expect(html).toContain('Primary Button');
      expect(html).toContain('Body Text');
      expect(html).toContain('Error Text');
      expect(html).toContain('Success Text');
    });

    it('should include usage descriptions', () => {
      const html = validator.generateSwatchHTML(mockTokens, true);
      
      expect(html).toContain('Primary button background');
      expect(html).toContain('Main body text');
      expect(html).toContain('Error messages');
    });
  });

  describe('edge cases', () => {
    it('should handle empty tokens', () => {
      const emptyTokens: W3CDesignTokens = {};
      const html = validator.generateSwatchHTML(emptyTokens);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Design Token Swatches');
    });

    it('should handle tokens without colors', () => {
      const noColorTokens: W3CDesignTokens = {
        typography: {
          fontSize: {
            base: { $type: 'fontSize', $value: '1rem' }
          }
        }
      };
      
      const html = validator.generateSwatchHTML(noColorTokens);
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should handle invalid hex colors', () => {
      expect(() => {
        validator.validateColorCombination('invalid', '#ffffff');
      }).not.toThrow();
    });

    it('should handle malformed color tokens', () => {
      const malformedTokens: W3CDesignTokens = {
        color: {
          primary: { $type: 'color', $value: null }
        }
      };
      
      expect(() => {
        validator.validateTokens(malformedTokens);
      }).not.toThrow();
    });
  });

  describe('accessibility levels', () => {
    it('should correctly identify WCAG levels', () => {
      const aaaResult = validator.validateColorCombination('#000000', '#ffffff');
      const aaResult = validator.validateColorCombination('#666666', '#ffffff');
      const failResult = validator.validateColorCombination('#cccccc', '#ffffff');
      
      expect(aaaResult.level).toBe('AAA');
      expect(aaResult.level).toBe('AA');
      expect(failResult.level).toBe('fail');
    });

    it('should provide appropriate CSS classes for contrast levels', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('contrast-pass');
      expect(html).toContain('contrast-fail');
      expect(html).toContain('contrast-warning');
    });
  });

  describe('HTML structure', () => {
    it('should have proper semantic structure', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('<h1>');
      expect(html).toContain('<h2>');
      expect(html).toContain('aria-label');
      expect(html).toContain('lang="en"');
    });

    it('should be responsive', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('viewport');
      expect(html).toContain('grid-template-columns');
      expect(html).toContain('auto-fill');
    });

    it('should include proper meta tags', () => {
      const html = validator.generateSwatchHTML(mockTokens);
      
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('<meta name="viewport"');
      expect(html).toContain('<title>');
    });
  });
});
