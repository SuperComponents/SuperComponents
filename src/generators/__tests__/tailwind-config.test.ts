import { describe, it, expect, beforeEach } from 'vitest'
import { TailwindConfigGenerator } from '../tailwind-config.js'
import { W3CDesignTokens } from '../tokens.js'

describe('TailwindConfigGenerator', () => {
  let generator: TailwindConfigGenerator
  let mockTokens: W3CDesignTokens

  beforeEach(() => {
    generator = new TailwindConfigGenerator()
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
      typography: {
        fontFamily: {
          primary: { $type: 'fontFamily', $value: ['Inter', 'sans-serif'] },
        },
        fontSize: {
          base: { $type: 'fontSize', $value: '1rem' },
          lg: { $type: 'fontSize', $value: '1.125rem' },
        },
        fontWeight: {
          normal: { $type: 'fontWeight', $value: 400 },
          bold: { $type: 'fontWeight', $value: 700 },
        },
        lineHeight: {
          normal: { $type: 'lineHeight', $value: 1.5 },
          tight: { $type: 'lineHeight', $value: 1.25 },
        },
      },
      spacing: {
        sm: { $type: 'spacing', $value: '8px' },
        md: { $type: 'spacing', $value: '16px' },
        lg: { $type: 'spacing', $value: '24px' },
      },
      borderRadius: {
        sm: { $type: 'borderRadius', $value: '4px' },
        md: { $type: 'borderRadius', $value: '8px' },
      },
      shadow: {
        sm: { $type: 'shadow', $value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
        md: { $type: 'shadow', $value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
      },
      transition: {
        duration: {
          fast: { $type: 'duration', $value: '150ms' },
          normal: { $type: 'duration', $value: '250ms' },
        },
        timingFunction: {
          ease: { $type: 'cubicBezier', $value: [0.25, 0.1, 0.25, 1] },
        },
      },
    }
  })

  describe('generateConfig', () => {
    it('should generate valid TypeScript config', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain("import type { Config } from 'tailwindcss'")
      expect(config).toContain('const config: Config = {')
      expect(config).toContain('export default config')
    })

    it('should include content paths', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('./src/**/*.{js,ts,jsx,tsx,mdx}')
      expect(config).toContain('./components/**/*.{js,ts,jsx,tsx,mdx}')
    })

    it('should map colors correctly', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"primary": {')
      expect(config).toContain('"500": "#3b82f6"')
      expect(config).toContain('"600": "#2563eb"')
      expect(config).toContain('"neutral": {')
      expect(config).toContain('"50": "#fafafa"')
    })

    it('should map semantic colors', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"semantic": {')
      expect(config).toContain('"success": "#16a34a"')
      expect(config).toContain('"error": "#dc2626"')
    })

    it('should map typography tokens', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"fontFamily": {')
      expect(config).toContain('"primary": [')
      expect(config).toContain('"Inter"')
      expect(config).toContain('"sans-serif"')
      expect(config).toContain('"fontSize": {')
      expect(config).toContain('"base": "1rem"')
      expect(config).toContain('"fontWeight": {')
      expect(config).toContain('"normal": 400')
    })

    it('should map spacing tokens', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"spacing": {')
      expect(config).toContain('"sm": "8px"')
      expect(config).toContain('"md": "16px"')
    })

    it('should map border radius tokens', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"borderRadius": {')
      expect(config).toContain('"sm": "4px"')
    })

    it('should map shadow tokens', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"boxShadow": {')
      expect(config).toContain('"sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)"')
    })

    it('should map transition tokens', () => {
      const config = generator.generateConfig(mockTokens)

      expect(config).toContain('"transitionDuration": {')
      expect(config).toContain('"fast": "150ms"')
      expect(config).toContain('"transitionTimingFunction": {')
      expect(config).toContain('"ease": [')
      expect(config).toContain('0.25')
      expect(config).toContain('0.1')
    })
  })

  describe('config options', () => {
    it('should add prefix when specified', () => {
      const prefixGenerator = new TailwindConfigGenerator({ prefix: 'tw-' })
      const config = prefixGenerator.generateConfig(mockTokens)

      expect(config).toContain('"prefix": "tw-"')
    })

    it('should add important when specified', () => {
      const importantGenerator = new TailwindConfigGenerator({ important: true })
      const config = importantGenerator.generateConfig(mockTokens)

      expect(config).toContain('"important": true')
    })

    it('should add core plugins when specified', () => {
      const corePluginsGenerator = new TailwindConfigGenerator({ 
        corePlugins: ['typography', 'forms'] 
      })
      const config = corePluginsGenerator.generateConfig(mockTokens)

      expect(config).toContain('"corePlugins": [')
      expect(config).toContain('"typography"')
      expect(config).toContain('"forms"')
    })

    it('should add plugins when specified', () => {
      const pluginsGenerator = new TailwindConfigGenerator({ 
        plugins: ['@tailwindcss/forms'] 
      })
      const config = pluginsGenerator.generateConfig(mockTokens)

      expect(config).toContain('"plugins": [')
      expect(config).toContain('"@tailwindcss/forms"')
    })
  })

  describe('generateUtilities', () => {
    it('should generate utilities configuration', () => {
      const utilities = generator.generateUtilities(mockTokens)

      expect(utilities).toContain('@layer utilities')
      expect(utilities).toContain('.color-primary-500')
      expect(utilities).toContain('color')
    })

    it('should map token types to CSS properties', () => {
      const utilities = generator.generateUtilities(mockTokens)

      expect(utilities).toContain('color') // for color tokens
      expect(utilities).toContain('font-size') // for fontSize tokens
      expect(utilities).toContain('font-family') // for fontFamily tokens
    })
  })

  describe('generateCSSCustomProperties', () => {
    it('should generate CSS custom properties', () => {
      const cssVars = generator.generateCSSCustomProperties(mockTokens)

      expect(cssVars).toContain(':root {')
      expect(cssVars).toContain('--color-primary-500: #3b82f6;')
      expect(cssVars).toContain('--spacing-sm: 8px;')
      expect(cssVars).toContain('--typography-font-size-base: 1rem;')
    })

    it('should handle nested properties', () => {
      const cssVars = generator.generateCSSCustomProperties(mockTokens)

      expect(cssVars).toContain('--color-semantic-success: #16a34a;')
      expect(cssVars).toContain('--color-semantic-error: #dc2626;')
    })

    it('should convert camelCase to kebab-case', () => {
      const cssVars = generator.generateCSSCustomProperties(mockTokens)

      expect(cssVars).toContain('--typography-font-family-primary:')
      expect(cssVars).toContain('--typography-font-weight-normal:')
      expect(cssVars).toContain('--typography-line-height-normal:')
    })
  })

  describe('edge cases', () => {
    it('should handle empty tokens', () => {
      const emptyTokens: W3CDesignTokens = {}
      const config = generator.generateConfig(emptyTokens)

      expect(config).toContain('const config: Config = {')
      expect(config).toContain('"theme": {')
      expect(config).toContain('"extend": {}')
    })

    it('should handle single color token', () => {
      const singleColorTokens: W3CDesignTokens = {
        color: {
          primary: { $type: 'color', $value: '#3b82f6' }
        }
      }
      const config = generator.generateConfig(singleColorTokens)

      expect(config).toContain('"primary": "#3b82f6"')
    })

    it('should handle mixed token structures', () => {
      const mixedTokens: W3CDesignTokens = {
        color: {
          primary: { $type: 'color', $value: '#3b82f6' },
          secondary: {
            500: { $type: 'color', $value: '#10b981' },
            600: { $type: 'color', $value: '#059669' },
          },
        },
      }
      const config = generator.generateConfig(mixedTokens)

      expect(config).toContain('"primary": "#3b82f6"')
      expect(config).toContain('"secondary": {')
      expect(config).toContain('"500": "#10b981"')
    })
  })

  describe('color wiring', () => {
    it('should ensure colors are wired correctly to Tailwind', () => {
      const config = generator.generateConfig(mockTokens)

      // Check that colors are properly mapped to theme.extend.colors
      expect(config).toContain('"colors": {')
      expect(config).toContain('"primary": {')
      expect(config).toContain('"500": "#3b82f6"')
      
      // Verify it's in the right structure
      expect(config).toMatch(/"theme":\s*{\s*"extend":\s*{[^}]*"colors"/)
    })

    it('should preserve color token structure', () => {
      const config = generator.generateConfig(mockTokens)

      // Verify nested color structure is preserved
      expect(config).toContain('"primary": {')
      expect(config).toContain('"500": "#3b82f6"')
      expect(config).toContain('"600": "#2563eb"')
      
      // Verify semantic colors are flat
      expect(config).toContain('"semantic": {')
      expect(config).toContain('"success": "#16a34a"')
    })
  })
})
