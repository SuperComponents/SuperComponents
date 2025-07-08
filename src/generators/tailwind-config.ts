import { W3CDesignTokens, W3CDesignToken } from './tokens.js'

export interface TailwindConfigOptions {
  prefix?: string
  important?: boolean
  corePlugins?: string[]
  plugins?: string[]
}

export class TailwindConfigGenerator {
  private options: TailwindConfigOptions

  constructor(options: TailwindConfigOptions = {}) {
    this.options = options
  }

  /**
   * Generate tailwind.config.ts content from W3C design tokens
   */
  generateConfig(tokens: W3CDesignTokens): string {
    const config = this.buildConfigObject(tokens)
    return this.formatAsTypeScript(config)
  }

  private buildConfigObject(tokens: W3CDesignTokens): any {
    const config: any = {
      content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {},
      },
    }

    // Add prefix if specified
    if (this.options.prefix) {
      config.prefix = this.options.prefix
    }

    // Add important if specified
    if (this.options.important) {
      config.important = this.options.important
    }

    // Extract and map tokens to Tailwind theme
    this.mapTokensToTheme(tokens, config.theme.extend)

    // Add core plugins if specified
    if (this.options.corePlugins) {
      config.corePlugins = this.options.corePlugins
    }

    // Add plugins if specified
    if (this.options.plugins) {
      config.plugins = this.options.plugins
    }

    return config
  }

  private mapTokensToTheme(tokens: W3CDesignTokens, theme: any): void {
    Object.entries(tokens).forEach(([category, categoryTokens]) => {
      switch (category) {
        case 'color':
          this.mapColorTokens(categoryTokens as W3CDesignTokens, theme)
          break
        case 'typography':
          this.mapTypographyTokens(categoryTokens as W3CDesignTokens, theme)
          break
        case 'spacing':
          this.mapSpacingTokens(categoryTokens as W3CDesignTokens, theme)
          break
        case 'sizing':
          this.mapSizingTokens(categoryTokens as W3CDesignTokens, theme)
          break
        case 'borderRadius':
          this.mapBorderRadiusTokens(categoryTokens as W3CDesignTokens, theme)
          break
        case 'shadow':
          this.mapShadowTokens(categoryTokens as W3CDesignTokens, theme)
          break
        case 'transition':
          this.mapTransitionTokens(categoryTokens as W3CDesignTokens, theme)
          break
      }
    })
  }

  private mapColorTokens(colorTokens: W3CDesignTokens, theme: any): void {
    if (!theme.colors) theme.colors = {}

    Object.entries(colorTokens).forEach(([colorGroup, colors]) => {
      if (typeof colors === 'object' && '$value' in colors) {
        // Single color token
        theme.colors[colorGroup] = (colors as W3CDesignToken).$value
      } else {
        // Color group with multiple shades
        const colorMap: { [key: string]: string } = {}
        this.extractColorValues(colors as W3CDesignTokens, colorMap)
        theme.colors[colorGroup] = colorMap
      }
    })
  }

  private extractColorValues(
    tokens: W3CDesignTokens,
    target: { [key: string]: string }
  ): void {
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'object' && '$value' in value) {
        target[key] = (value as W3CDesignToken).$value
      } else if (typeof value === 'object' && !('$value' in value)) {
        this.extractColorValues(value as W3CDesignTokens, target)
      }
    })
  }

  private mapTypographyTokens(
    typographyTokens: W3CDesignTokens,
    theme: any
  ): void {
    Object.entries(typographyTokens).forEach(([key, value]) => {
      switch (key) {
        case 'fontFamily':
          theme.fontFamily = {}
          this.extractTokenValues(value as W3CDesignTokens, theme.fontFamily)
          break
        case 'fontSize':
          theme.fontSize = {}
          this.extractTokenValues(value as W3CDesignTokens, theme.fontSize)
          break
        case 'fontWeight':
          theme.fontWeight = {}
          this.extractTokenValues(value as W3CDesignTokens, theme.fontWeight)
          break
        case 'lineHeight':
          theme.lineHeight = {}
          this.extractTokenValues(value as W3CDesignTokens, theme.lineHeight)
          break
      }
    })
  }

  private mapSpacingTokens(spacingTokens: W3CDesignTokens, theme: any): void {
    theme.spacing = {}
    this.extractTokenValues(spacingTokens, theme.spacing)
  }

  private mapSizingTokens(sizingTokens: W3CDesignTokens, theme: any): void {
    theme.width = {}
    theme.height = {}
    this.extractTokenValues(sizingTokens, theme.width)
    this.extractTokenValues(sizingTokens, theme.height)
  }

  private mapBorderRadiusTokens(
    borderRadiusTokens: W3CDesignTokens,
    theme: any
  ): void {
    theme.borderRadius = {}
    this.extractTokenValues(borderRadiusTokens, theme.borderRadius)
  }

  private mapShadowTokens(shadowTokens: W3CDesignTokens, theme: any): void {
    theme.boxShadow = {}
    this.extractTokenValues(shadowTokens, theme.boxShadow)
  }

  private mapTransitionTokens(
    transitionTokens: W3CDesignTokens,
    theme: any
  ): void {
    Object.entries(transitionTokens).forEach(([key, value]) => {
      switch (key) {
        case 'duration':
          theme.transitionDuration = {}
          this.extractTokenValues(
            value as W3CDesignTokens,
            theme.transitionDuration
          )
          break
        case 'timingFunction':
          theme.transitionTimingFunction = {}
          this.extractTokenValues(
            value as W3CDesignTokens,
            theme.transitionTimingFunction
          )
          break
      }
    })
  }

  private extractTokenValues(
    tokens: W3CDesignTokens,
    target: { [key: string]: any }
  ): void {
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'object' && '$value' in value) {
        target[key] = (value as W3CDesignToken).$value
      }
    })
  }

  private formatAsTypeScript(config: any): string {
    const jsonString = JSON.stringify(config, null, 2)

    // Convert to TypeScript format
    const tsConfig = `import type { Config } from 'tailwindcss';

const config: Config = ${jsonString};

export default config;
`

    return tsConfig
  }

  /**
   * Generate utilities configuration for custom CSS properties
   */
  generateUtilities(tokens: W3CDesignTokens): string {
    const utilities: { [key: string]: { [key: string]: string } } = {}

    this.generateTokenUtilities(tokens, utilities)

    const utilitiesConfig = {
      '@layer utilities': utilities,
    }

    return JSON.stringify(utilitiesConfig, null, 2)
  }

  private generateTokenUtilities(
    tokens: W3CDesignTokens,
    utilities: { [key: string]: { [key: string]: string } },
    prefix = ''
  ): void {
    Object.entries(tokens).forEach(([key, value]) => {
      const utilityName = prefix ? `${prefix}-${key}` : key

      if (typeof value === 'object' && '$value' in value) {
        const token = value as W3CDesignToken
        const cssProperty = this.getCSSProperty(token.$type)

        if (cssProperty) {
          utilities[`.${utilityName}`] = {
            [cssProperty]: token.$value,
          }
        }
      } else if (typeof value === 'object' && !('$value' in value)) {
        this.generateTokenUtilities(
          value as W3CDesignTokens,
          utilities,
          utilityName
        )
      }
    })
  }

  private getCSSProperty(tokenType: string): string | null {
    const typeMapping: { [key: string]: string } = {
      color: 'color',
      fontSize: 'font-size',
      fontFamily: 'font-family',
      fontWeight: 'font-weight',
      lineHeight: 'line-height',
      spacing: 'padding',
      sizing: 'width',
      borderRadius: 'border-radius',
      shadow: 'box-shadow',
      duration: 'transition-duration',
      cubicBezier: 'transition-timing-function',
    }

    return typeMapping[tokenType] || null
  }

  /**
   * Generate CSS custom properties from tokens
   */
  generateCSSCustomProperties(tokens: W3CDesignTokens): string {
    const cssVars: string[] = []

    this.extractCSSVariables(tokens, cssVars)

    return `:root {\n${cssVars.join('\n')}\n}`
  }

  private extractCSSVariables(
    tokens: W3CDesignTokens,
    cssVars: string[],
    prefix = ''
  ): void {
    Object.entries(tokens).forEach(([key, value]) => {
      const varName = prefix ? `${prefix}-${key}` : key

      if (typeof value === 'object' && '$value' in value) {
        const token = value as W3CDesignToken
        const cssVarName = `--${varName.replace(/([A-Z])/g, '-$1').toLowerCase()}`
        cssVars.push(`  ${cssVarName}: ${token.$value};`)
      } else if (typeof value === 'object' && !('$value' in value)) {
        this.extractCSSVariables(value as W3CDesignTokens, cssVars, varName)
      }
    })
  }
}

export default TailwindConfigGenerator
