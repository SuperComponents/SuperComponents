import { describe, it, expect } from 'vitest'
import { TokenGenerator } from './tokens.js'
import { DesignInsight } from '../types/index.js'

describe('TokenGenerator', () => {
  const mockInsight: DesignInsight = {
    imageryPalette: ['#3b82f6', '#10b981'],
    typographyFamilies: ['Inter', 'Roboto'],
    spacingScale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
    uiDensity: 'regular',
    brandKeywords: ['modern', 'clean'],
    supportingReferences: []
  }

  it('should generate W3C compliant tokens', () => {
    const generator = new TokenGenerator()
    const tokens = generator.generateTokens(mockInsight)

    // Check that all tokens have $type and $value properties
    expect(tokens.color).toBeDefined()
    expect(tokens.typography).toBeDefined()
    expect(tokens.spacing).toBeDefined()
    expect(tokens.sizing).toBeDefined()
    expect(tokens.borderRadius).toBeDefined()
    expect(tokens.shadow).toBeDefined()
    expect(tokens.transition).toBeDefined()
    
    // Check color tokens structure
    const primary = tokens.color?.primary as any
    expect(primary).toBeDefined()
    expect(primary[500]).toEqual({
      $type: 'color',
      $value: '#3b82f6'
    })
    
    // Check typography tokens structure
    const typography = tokens.typography as any
    expect(typography.fontFamily).toBeDefined()
    expect(typography.fontFamily.primary).toEqual({
      $type: 'fontFamily',
      $value: ['Inter', 'sans-serif']
    })
    
    // Check spacing tokens structure
    const spacing = tokens.spacing as any
    expect(spacing.md).toBeDefined()
    expect(spacing.md).toEqual({
      $type: 'spacing',
      $value: '16px'
    })
  })

  it('should convert W3C tokens to legacy format', () => {
    const generator = new TokenGenerator()
    const w3cTokens = generator.generateTokens(mockInsight)
    const legacyTokens = generator.convertToLegacyFormat(w3cTokens)

    expect(legacyTokens.colors).toBeDefined()
    expect(legacyTokens.typography).toBeDefined()
    expect(legacyTokens.spacing).toBeDefined()
    expect(legacyTokens.borderRadius).toBeDefined()

    // Check that colors are flattened properly
    expect(legacyTokens.colors['primary-500']).toBe('#3b82f6')
    expect(legacyTokens.colors['secondary-500']).toBe('#10b981')
    
    // Check typography conversion
    expect(legacyTokens.typography.fonts).toContain('Inter')
    expect(legacyTokens.typography.sizes.base).toBe('1rem')
    expect(legacyTokens.typography.weights.normal).toBe(400)
    
    // Check spacing conversion
    expect(legacyTokens.spacing.md).toBe('16px')
  })

  it('should validate contrast ratios when WCAG is enabled', () => {
    const generator = new TokenGenerator({ enforceWCAG: true, minContrastRatio: 4.5 })
    const tokens = generator.generateTokens(mockInsight)
    
    // Test color contrast validation
    const result = generator.validateContrast('#000000', '#ffffff')
    expect(result.passes).toBe(true)
    expect(result.ratio).toBeGreaterThan(4.5)
    
    const badResult = generator.validateContrast('#cccccc', '#ffffff')
    expect(badResult.passes).toBe(false)
    expect(badResult.adjustedColor).toBeDefined()
  })

  it('should generate tokens for different UI densities', () => {
    const generator = new TokenGenerator()
    
    const compactInsight = { ...mockInsight, uiDensity: 'compact' as const }
    const spaciousInsight = { ...mockInsight, uiDensity: 'spacious' as const }
    
    const compactTokens = generator.generateTokens(compactInsight)
    const spaciousTokens = generator.generateTokens(spaciousInsight)
    
    // Spacing should be different for different densities
    const compactSpacing = compactTokens.spacing as any
    const spaciousSpacing = spaciousTokens.spacing as any
    
    expect(compactSpacing.md.$value).not.toBe(spaciousSpacing.md.$value)
    
    // Border radius should be different for different densities
    const compactBorderRadius = compactTokens.borderRadius as any
    const spaciousBorderRadius = spaciousTokens.borderRadius as any
    
    expect(compactBorderRadius.md.$value).not.toBe(spaciousBorderRadius.md.$value)
  })
})
