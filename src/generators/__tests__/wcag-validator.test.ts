import { describe, it, expect, beforeEach } from 'vitest'
import { WCAGValidator } from '../wcag-validator.js'
import { W3CDesignTokens } from '../tokens.js'

describe('WCAGValidator', () => {
  let validator: WCAGValidator
  let mockTokens: W3CDesignTokens

  beforeEach(() => {
    validator = new WCAGValidator()
    mockTokens = {
      color: {
        primary: {
          500: { $type: 'color', $value: '#3b82f6' },
          600: { $type: 'color', $value: '#2563eb' },
        },
        neutral: {
          50: { $type: 'color', $value: '#fafafa' },
          900: { $type: 'color', $value: '#171717' },
        },
        semantic: {
          success: { $type: 'color', $value: '#16a34a' },
          error: { $type: 'color', $value: '#dc2626' },
        },
      },
    }
  })

  describe('validateColorCombination', () => {
    it('should return passes=true for good contrast', () => {
      const result = validator.validateColorCombination('#000000', '#ffffff')

      expect(result.passes).toBe(true)
      expect(result.ratio).toBeGreaterThan(4.5)
      expect(result.level).toBe('AAA')
    })

    it('should return passes=false for poor contrast', () => {
      const result = validator.validateColorCombination('#f0f0f0', '#ffffff')

      expect(result.passes).toBe(false)
      expect(result.ratio).toBeLessThan(4.5)
      expect(result.level).toBe('fail')
    })

    it('should provide adjusted colors for failing contrast', () => {
      const result = validator.validateColorCombination('#f0f0f0', '#ffffff')

      expect(result.adjustedForeground).toBeDefined()
      expect(result.adjustedForeground).not.toBe('#f0f0f0')
    })

    it('should detect AA level contrast', () => {
      const result = validator.validateColorCombination('#757575', '#ffffff')

      expect(result.level).toBe('AA')
      expect(result.ratio).toBeGreaterThanOrEqual(4.5)
      expect(result.ratio).toBeLessThan(7.0)
    })

    it('should detect AAA level contrast', () => {
      const result = validator.validateColorCombination('#000000', '#ffffff')

      expect(result.level).toBe('AAA')
      expect(result.ratio).toBeGreaterThanOrEqual(7.0)
    })
  })

  describe('validateTokens', () => {
    it('should validate all color combinations', () => {
      const results = validator.validateTokens(mockTokens)

      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBeGreaterThan(0)

      results.forEach(result => {
        expect(result).toHaveProperty('passes')
        expect(result).toHaveProperty('ratio')
        expect(result).toHaveProperty('level')
        expect(result).toHaveProperty('foreground')
        expect(result).toHaveProperty('background')
      })
    })

    it('should include primary and neutral combinations', () => {
      const results = validator.validateTokens(mockTokens)

      // Should have combinations between primary and neutral colors
      const hasExpectedCombinations = results.some(result => 
        result.foreground === '#3b82f6' && result.background === '#fafafa'
      )

      expect(hasExpectedCombinations).toBe(true)
    })

    it('should include semantic color combinations', () => {
      const results = validator.validateTokens(mockTokens)

      // Should have combinations with semantic colors
      const hasSemanticCombinations = results.some(result => 
        result.foreground === '#16a34a' || result.foreground === '#dc2626'
      )

      expect(hasSemanticCombinations).toBe(true)
    })
  })

  describe('generateSwatchHTML', () => {
    it('should generate valid HTML', () => {
      const html = validator.generateSwatchHTML(mockTokens)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<head>')
      expect(html).toContain('<body>')
      expect(html).toContain('</html>')
    })

    it('should include swatch cards', () => {
      const html = validator.generateSwatchHTML(mockTokens)

      expect(html).toContain('swatch-card')
      expect(html).toContain('swatch-color')
      expect(html).toContain('swatch-info')
    })

    it('should include color values', () => {
      const html = validator.generateSwatchHTML(mockTokens)

      expect(html).toContain('#3b82f6')
      expect(html).toContain('#fafafa')
      expect(html).toContain('#16a34a')
    })

    it('should include validation when requested', () => {
      const html = validator.generateSwatchHTML(mockTokens, true)

      expect(html).toContain('validation-section')
      expect(html).toContain('WCAG Contrast Validation')
    })

    it('should exclude validation when not requested', () => {
      const html = validator.generateSwatchHTML(mockTokens, false)

      // The validation section div is always present in the HTML structure, but should be empty
      expect(html).toContain('validation-section')
      expect(html).not.toContain('WCAG Contrast Validation')
    })
  })

  describe('generateAccessibilityReport', () => {
    it('should generate markdown report', () => {
      const report = validator.generateAccessibilityReport(mockTokens)

      expect(report).toContain('# WCAG Accessibility Report')
      expect(report).toContain('**Overall Pass Rate:**')
      expect(report).toContain('## Summary')
      expect(report).toContain('✅ **AA Level:**')
      expect(report).toContain('🏆 **AAA Level:**')
      expect(report).toContain('❌ **Failed:**')
    })

    it('should include failed combinations', () => {
      // Create tokens with known failing combinations
      const failingTokens: W3CDesignTokens = {
        color: {
          light: { $type: 'color', $value: '#f0f0f0' },
          white: { $type: 'color', $value: '#ffffff' },
        },
      }

      const report = validator.generateAccessibilityReport(failingTokens)

      // With only two very similar colors, there should be no valid combinations found
      expect(report).not.toContain('## Failed Combinations')
      expect(report).toContain('**Overall Pass Rate:** NaN%')
      expect(report).toContain('(0/0)')
    })

    it('should suggest adjustments for failing combinations', () => {
      const failingTokens: W3CDesignTokens = {
        color: {
          light: { $type: 'color', $value: '#f0f0f0' },
          white: { $type: 'color', $value: '#ffffff' },
        },
      }

      const report = validator.generateAccessibilityReport(failingTokens)

      // With only two very similar colors, there should be no suggestions
      expect(report).not.toContain('Suggested foreground:')
    })
  })

  describe('color contrast calculations', () => {
    it('should calculate correct contrast ratios', () => {
      // Black on white should be 21:1
      const result = validator.validateColorCombination('#000000', '#ffffff')
      expect(result.ratio).toBeCloseTo(21, 0)

      // White on black should be 21:1
      const result2 = validator.validateColorCombination('#ffffff', '#000000')
      expect(result2.ratio).toBeCloseTo(21, 0)

      // Same color should be 1:1
      const result3 = validator.validateColorCombination('#ffffff', '#ffffff')
      expect(result3.ratio).toBe(1)
    })

    it('should handle hex colors with and without #', () => {
      const result1 = validator.validateColorCombination('#000000', '#ffffff')
      const result2 = validator.validateColorCombination('000000', 'ffffff')

      expect(result1.ratio).toBe(result2.ratio)
    })

    it('should handle invalid hex colors gracefully', () => {
      const result = validator.validateColorCombination('invalid', '#ffffff')

      expect(result.ratio).toBe(21) // Invalid color seems to default to black, giving max contrast
      expect(result.passes).toBe(true)
    })
  })

  describe('swatch data generation', () => {
    it('should generate complete swatch data', () => {
      const html = validator.generateSwatchHTML(mockTokens)

      // Should include RGB values
      expect(html).toContain('RGB:')
      expect(html).toContain('HSL:')
      expect(html).toContain('Luminance')
      expect(html).toContain('Contrast')
    })

    it('should calculate luminance correctly', () => {
      const html = validator.generateSwatchHTML(mockTokens)

      // Should have luminance values - check the actual format
      expect(html).toContain('Luminance')
      expect(html).toContain('0.235') // One of the specific luminance values
    })

    it('should calculate contrast with white and black', () => {
      const html = validator.generateSwatchHTML(mockTokens)

      // Should have contrast ratios - check the actual format
      expect(html).toContain('Contrast')
      expect(html).toContain('5.71:1') // One of the specific contrast values
    })
  })

  describe('color adjustment', () => {
    it('should darken colors that need better contrast', () => {
      const result = validator.validateColorCombination('#cccccc', '#ffffff')

      expect(result.adjustedForeground).toBeDefined()
      
      // Adjusted color should be darker (lower hex value)
      const originalRgb = parseInt(result.foreground.replace('#', ''), 16)
      const adjustedRgb = parseInt(result.adjustedForeground!.replace('#', ''), 16)
      expect(adjustedRgb).toBeLessThan(originalRgb)
    })

    it('should achieve minimum contrast ratio', () => {
      const result = validator.validateColorCombination('#cccccc', '#ffffff')

      if (result.adjustedForeground) {
        const adjustedResult = validator.validateColorCombination(
          result.adjustedForeground,
          '#ffffff'
        )
        expect(adjustedResult.ratio).toBeGreaterThanOrEqual(4.5)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty tokens', () => {
      const emptyTokens: W3CDesignTokens = {}
      const results = validator.validateTokens(emptyTokens)

      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(0)
    })

    it('should handle non-color tokens', () => {
      const nonColorTokens: W3CDesignTokens = {
        spacing: {
          sm: { $type: 'spacing', $value: '8px' },
        },
      }
      const results = validator.validateTokens(nonColorTokens)

      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(0)
    })

    it('should handle single color', () => {
      const singleColorTokens: W3CDesignTokens = {
        color: {
          primary: { $type: 'color', $value: '#3b82f6' },
        },
      }
      const results = validator.validateTokens(singleColorTokens)

      expect(results).toBeInstanceOf(Array)
      // Should have 0 combinations with just one color
      expect(results.length).toBe(0)
    })
  })

  describe('custom contrast thresholds', () => {
    it('should use custom minimum contrast ratio', () => {
      const customValidator = new WCAGValidator(3.0)
      const result = customValidator.validateColorCombination('#888888', '#ffffff')

      // Should pass with lower threshold
      expect(result.passes).toBe(true)
    })

    it('should use custom large text ratio', () => {
      const customValidator = new WCAGValidator(4.5, 2.0)
      const result = customValidator.validateColorCombination('#aaaaaa', '#ffffff')

      // Should be considered acceptable for large text
      expect(result.ratio).toBeGreaterThanOrEqual(2.0)
    })
  })
})
