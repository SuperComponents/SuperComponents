import { describe, it, expect } from 'vitest'
import { TokenGenerator } from '../generators/tokens.js'
import { TailwindConfigGenerator } from '../generators/tailwind-config.js'
import { WCAGValidator } from '../generators/wcag-validator.js'
import { DesignInsight } from '../types/index.js'

describe('Basic Functionality Tests', () => {
  const mockInsight: DesignInsight = {
    imageryPalette: ['#3b82f6', '#10b981'],
    typographyFamilies: ['Inter'],
    spacingScale: [8, 16, 24],
    uiDensity: 'regular',
    brandKeywords: ['modern'],
    supportingReferences: ['Clean interface'],
  }

  describe('TokenGenerator', () => {
    it('should generate valid design tokens', () => {
      const generator = new TokenGenerator()
      const tokens = generator.generateTokens(mockInsight)

      expect(tokens).toBeDefined()
      expect(tokens.color).toBeDefined()
      expect(tokens.typography).toBeDefined()
      expect(tokens.spacing).toBeDefined()
    })

    it('should handle contrast validation', () => {
      const generator = new TokenGenerator()
      const result = generator.validateContrast('#000000', '#ffffff')

      expect(result.passes).toBe(true)
      expect(result.ratio).toBeGreaterThan(4.5)
    })

    it('should handle poor contrast', () => {
      const generator = new TokenGenerator()
      const result = generator.validateContrast('#f0f0f0', '#ffffff')

      expect(result.passes).toBe(false)
      expect(result.adjustedColor).toBeDefined()
    })
  })

  describe('TailwindConfigGenerator', () => {
    it('should generate tailwind config', () => {
      const generator = new TokenGenerator()
      const tokens = generator.generateTokens(mockInsight)
      
      const tailwindGen = new TailwindConfigGenerator()
      const config = tailwindGen.generateConfig(tokens)

      expect(config).toContain('import type { Config }')
      expect(config).toContain('export default config')
      expect(config).toContain('theme')
      expect(config).toContain('extend')
    })

    it('should generate CSS custom properties', () => {
      const generator = new TokenGenerator()
      const tokens = generator.generateTokens(mockInsight)
      
      const tailwindGen = new TailwindConfigGenerator()
      const cssVars = tailwindGen.generateCSSCustomProperties(tokens)

      expect(cssVars).toContain(':root {')
      expect(cssVars).toContain('--')
      expect(cssVars).toContain('#3b82f6')
    })
  })

  describe('WCAGValidator', () => {
    it('should validate color combinations', () => {
      const validator = new WCAGValidator()
      const result = validator.validateColorCombination('#000000', '#ffffff')

      expect(result.passes).toBe(true)
      expect(result.ratio).toBeCloseTo(21, 0)
      expect(result.level).toBe('AAA')
    })

    it('should generate HTML swatches', () => {
      const generator = new TokenGenerator()
      const tokens = generator.generateTokens(mockInsight)
      
      const validator = new WCAGValidator()
      const html = validator.generateSwatchHTML(tokens)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('swatch-card')
      expect(html).toContain('#3b82f6')
    })

    it('should generate accessibility report', () => {
      const generator = new TokenGenerator()
      const tokens = generator.generateTokens(mockInsight)
      
      const validator = new WCAGValidator()
      const report = validator.generateAccessibilityReport(tokens)

      expect(report).toContain('# WCAG Accessibility Report')
      expect(report).toContain('Overall Pass Rate')
    })
  })

  describe('Integration Tests', () => {
    it('should create complete workflow', () => {
      // Generate tokens
      const tokenGen = new TokenGenerator()
      const tokens = tokenGen.generateTokens(mockInsight)

      // Generate Tailwind config
      const tailwindGen = new TailwindConfigGenerator()
      const tailwindConfig = tailwindGen.generateConfig(tokens)

      // Validate accessibility
      const validator = new WCAGValidator()
      const validation = validator.validateTokens(tokens)

      expect(tokens).toBeDefined()
      expect(tailwindConfig).toContain('Config')
      expect(validation).toBeInstanceOf(Array)
    })

    it('should handle empty palette gracefully', () => {
      const emptyInsight: DesignInsight = {
        imageryPalette: [],
        typographyFamilies: [],
        spacingScale: [],
        uiDensity: 'regular',
        brandKeywords: [],
        supportingReferences: [],
      }

      const generator = new TokenGenerator()
      const tokens = generator.generateTokens(emptyInsight)

      expect(tokens).toBeDefined()
      expect(tokens.color.neutral).toBeDefined()
      expect(tokens.color.semantic).toBeDefined()
    })
  })
})
