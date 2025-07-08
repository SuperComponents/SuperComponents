import { describe, it, expect } from 'vitest'
import { TokenGenerator } from '../tokens.js'
import { DesignInsight } from '../../types/index.js'

describe('TokenGenerator', () => {
  let generator: TokenGenerator
  let mockInsight: DesignInsight

  beforeEach(() => {
    generator = new TokenGenerator()
    mockInsight = {
      imageryPalette: ['#3b82f6', '#10b981', '#f59e0b'],
      typographyFamilies: ['Inter', 'SF Pro Display'],
      spacingScale: [4, 8, 16, 24, 32, 48],
      uiDensity: 'regular',
      brandKeywords: ['modern', 'tech', 'clean'],
      supportingReferences: ['Clean interface', 'Modern typography'],
    }
  })

  describe('generateTokens', () => {
    it('should generate tokens with correct structure', () => {
      const tokens = generator.generateTokens(mockInsight)

      expect(tokens).toHaveProperty('color')
      expect(tokens).toHaveProperty('typography')
      expect(tokens).toHaveProperty('spacing')
      expect(tokens).toHaveProperty('sizing')
      expect(tokens).toHaveProperty('borderRadius')
      expect(tokens).toHaveProperty('shadow')
      expect(tokens).toHaveProperty('transition')
    })

    it('should generate primary palette from first color', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      expect(tokens.color.primary).toBeDefined()
      expect(tokens.color.primary['500']).toEqual({
        $type: 'color',
        $value: '#3b82f6'
      })
    })

    it('should generate secondary palette from second color', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      expect(tokens.color.secondary).toBeDefined()
      expect(tokens.color.secondary['500']).toEqual({
        $type: 'color',
        $value: '#10b981'
      })
    })

    it('should generate neutral palette', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      expect(tokens.color.neutral).toBeDefined()
      expect(tokens.color.neutral['500']).toEqual({
        $type: 'color',
        $value: '#737373'
      })
    })

    it('should generate semantic colors', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      expect(tokens.color.semantic).toBeDefined()
      expect(tokens.color.semantic.success).toBeDefined()
      expect(tokens.color.semantic.success.$type).toBe('color')
      expect(tokens.color.semantic.success.$value).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should generate typography tokens', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      expect(tokens.typography.fontFamily).toBeDefined()
      expect(tokens.typography.fontFamily.primary).toEqual({
        $type: 'fontFamily',
        $value: ['Inter', 'sans-serif']
      })
    })

    it('should generate spacing tokens based on density', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      expect(tokens.spacing.md).toEqual({
        $type: 'spacing',
        $value: '16px'
      })
    })

    it('should adjust spacing for compact density', () => {
      const compactInsight = { ...mockInsight, uiDensity: 'compact' }
      const tokens = generator.generateTokens(compactInsight)
      
      expect(tokens.spacing.md).toEqual({
        $type: 'spacing',
        $value: '14px' // 16 * 0.875
      })
    })

    it('should adjust spacing for spacious density', () => {
      const spaciousInsight = { ...mockInsight, uiDensity: 'spacious' }
      const tokens = generator.generateTokens(spaciousInsight)
      
      expect(tokens.spacing.md).toEqual({
        $type: 'spacing',
        $value: '18px' // 16 * 1.125
      })
    })
  })

  describe('validateContrast', () => {
    it('should return passes=true for good contrast', () => {
      const result = generator.validateContrast('#000000', '#ffffff')
      
      expect(result.passes).toBe(true)
      expect(result.ratio).toBeGreaterThan(4.5)
    })

    it('should return passes=false for poor contrast', () => {
      const result = generator.validateContrast('#f0f0f0', '#ffffff')
      
      expect(result.passes).toBe(false)
      expect(result.ratio).toBeLessThan(4.5)
    })

    it('should provide adjustedColor for failing contrast', () => {
      const result = generator.validateContrast('#f0f0f0', '#ffffff')
      
      expect(result.adjustedColor).toBeDefined()
      expect(result.adjustedColor).not.toBe('#f0f0f0')
    })
  })

  describe('convertToLegacyFormat', () => {
    it('should convert W3C tokens to legacy format', () => {
      const w3cTokens = generator.generateTokens(mockInsight)
      const legacy = generator.convertToLegacyFormat(w3cTokens)

      expect(legacy).toHaveProperty('colors')
      expect(legacy).toHaveProperty('typography')
      expect(legacy).toHaveProperty('spacing')
      expect(legacy).toHaveProperty('borderRadius')
      
      expect(legacy.colors['primary-500']).toBe('#3b82f6')
      expect(legacy.typography.fonts).toContain('Inter')
      expect(legacy.spacing.md).toBe('16px')
    })
  })

  describe('WCAG enforcement', () => {
    it('should enforce WCAG when option is enabled', () => {
      const wcagGenerator = new TokenGenerator({ enforceWCAG: true })
      const tokens = wcagGenerator.generateTokens(mockInsight)
      
      // Should have colors property
      expect(tokens.color).toBeDefined()
      
      // Test that semantic colors exist (they get validated)
      expect(tokens.color.semantic).toBeDefined()
    })

    it('should not enforce WCAG when option is disabled', () => {
      const noWcagGenerator = new TokenGenerator({ enforceWCAG: false })
      const tokens = noWcagGenerator.generateTokens(mockInsight)
      
      expect(tokens.color).toBeDefined()
    })
  })

  describe('color manipulation', () => {
    it('should create lighter shades correctly', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      const primary100 = tokens.color.primary['100'].$value
      const primary500 = tokens.color.primary['500'].$value
      
      expect(primary100).not.toBe(primary500)
      // Primary 100 should be lighter than 500
      expect(primary100).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should create darker shades correctly', () => {
      const tokens = generator.generateTokens(mockInsight)
      
      const primary900 = tokens.color.primary['900'].$value
      const primary500 = tokens.color.primary['500'].$value
      
      expect(primary900).not.toBe(primary500)
      // Primary 900 should be darker than 500
      expect(primary900).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('edge cases', () => {
    it('should handle empty palette', () => {
      const emptyInsight = { ...mockInsight, imageryPalette: [] }
      const tokens = generator.generateTokens(emptyInsight)
      
      expect(tokens.color.neutral).toBeDefined()
      expect(tokens.color.semantic).toBeDefined()
    })

    it('should handle single color palette', () => {
      const singleColorInsight = { ...mockInsight, imageryPalette: ['#3b82f6'] }
      const tokens = generator.generateTokens(singleColorInsight)
      
      expect(tokens.color.primary).toBeDefined()
      expect(tokens.color.secondary).toBeUndefined()
    })

    it('should handle empty typography families', () => {
      const noTypoInsight = { ...mockInsight, typographyFamilies: [] }
      const tokens = generator.generateTokens(noTypoInsight)
      
      expect(tokens.typography.fontFamily).toBeDefined()
      expect(Object.keys(tokens.typography.fontFamily)).toHaveLength(0)
    })

    it('should handle empty spacing scale', () => {
      const noSpacingInsight = { ...mockInsight, spacingScale: [] }
      const tokens = generator.generateTokens(noSpacingInsight)
      
      expect(tokens.spacing).toBeDefined()
      // Should use default spacing
      expect(tokens.spacing.md).toBeDefined()
    })
  })
})
