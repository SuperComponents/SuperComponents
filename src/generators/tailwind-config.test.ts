import { describe, it, expect } from 'vitest'
import { TailwindConfigGenerator } from './tailwind-config.js'
import { TokenGenerator } from './tokens.js'
import { DesignInsight } from '../types/index.js'

describe('TailwindConfigGenerator', () => {
  const mockInsight: DesignInsight = {
    imageryPalette: ['#3b82f6', '#10b981'],
    typographyFamilies: ['Inter', 'Roboto'],
    spacingScale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
    uiDensity: 'regular',
    brandKeywords: ['modern', 'clean'],
    supportingReferences: []
  }

  it('should generate valid TypeScript tailwind config', () => {
    const tokenGenerator = new TokenGenerator()
    const configGenerator = new TailwindConfigGenerator()
    const tokens = tokenGenerator.generateTokens(mockInsight)
    
    const config = configGenerator.generateConfig(tokens)
    
    // Should be valid TypeScript
    expect(config).toContain('import type { Config } from \'tailwindcss\'')
    expect(config).toContain('const config: Config = {')
    expect(config).toContain('export default config;')
    
    // Should include content paths
    expect(config).toContain('"content": [')
    expect(config).toContain('./src/**/*.{js,ts,jsx,tsx,mdx}')
    
    // Should include theme configuration
    expect(config).toContain('"theme": {')
    expect(config).toContain('"extend": {')
    
    // Should include colors
    expect(config).toContain('"colors": {')
    expect(config).toContain('"primary": {')
    expect(config).toContain('"secondary": {')
    expect(config).toContain('"neutral": {')
    expect(config).toContain('"semantic": {')
    
    // Should include typography
    expect(config).toContain('"fontFamily": {')
    expect(config).toContain('"fontSize": {')
    expect(config).toContain('"fontWeight": {')
    expect(config).toContain('"lineHeight": {')
    
    // Should include spacing
    expect(config).toContain('"spacing": {')
    
    // Should include border radius
    expect(config).toContain('"borderRadius": {')
    
    // Should include shadows
    expect(config).toContain('"boxShadow": {')
    
    // Should include transitions
    expect(config).toContain('"transitionDuration": {')
    expect(config).toContain('"transitionTimingFunction": {')
  })

  it('should extract color values correctly', () => {
    const tokenGenerator = new TokenGenerator()
    const configGenerator = new TailwindConfigGenerator()
    const tokens = tokenGenerator.generateTokens(mockInsight)
    
    const config = configGenerator.generateConfig(tokens)
    
    // Should have primary color values
    expect(config).toContain('"500": "#3b82f6"')
    
    // Should have semantic colors
    expect(config).toContain('"success": "#12823b"')
    expect(config).toContain('"warning": "#ae5f05"')
    expect(config).toContain('"error": "#dc2626"')
    expect(config).toContain('"info": "#2563eb"')
  })

  it('should extract typography values correctly', () => {
    const tokenGenerator = new TokenGenerator()
    const configGenerator = new TailwindConfigGenerator()
    const tokens = tokenGenerator.generateTokens(mockInsight)
    
    const config = configGenerator.generateConfig(tokens)
    
    // Should have font families
    expect(config).toContain('"Inter"')
    expect(config).toContain('"sans-serif"')
    
    // Should have font sizes
    expect(config).toContain('"base": "1rem"')
    expect(config).toContain('"lg": "1.125rem"')
    
    // Should have font weights
    expect(config).toContain('"normal": 400')
    expect(config).toContain('"bold": 700')
    
    // Should have line heights
    expect(config).toContain('"normal": 1.5')
    expect(config).toContain('"tight": 1.25')
  })

  it('should extract spacing values correctly', () => {
    const tokenGenerator = new TokenGenerator()
    const configGenerator = new TailwindConfigGenerator()
    const tokens = tokenGenerator.generateTokens(mockInsight)
    
    const config = configGenerator.generateConfig(tokens)
    
    // Should have spacing scale
    expect(config).toContain('"xs": "4px"')
    expect(config).toContain('"sm": "8px"')
    expect(config).toContain('"md": "16px"')
    expect(config).toContain('"lg": "24px"')
    expect(config).toContain('"xl": "32px"')
  })

  it('should format TypeScript config correctly', () => {
    const tokenGenerator = new TokenGenerator()
    const configGenerator = new TailwindConfigGenerator()
    const tokens = tokenGenerator.generateTokens(mockInsight)
    
    const config = configGenerator.generateConfig(tokens)
    
    // Should have proper TypeScript syntax
    expect(config).toContain('const config: Config = {')
    expect(config).toContain('export default config;')
    
    // Should have proper indentation
    const lines = config.split('\n')
    expect(lines.some(line => line.includes('"content": ['))).toBe(true)
    expect(lines.some(line => line.includes('"theme": {'))).toBe(true)
    expect(lines.some(line => line.includes('"extend": {'))).toBe(true)
  })
})
