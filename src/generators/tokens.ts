import { DesignInsight, DesignTokens } from '../types/index.js';

// W3C Design Tokens v1 schema interfaces
export interface W3CDesignToken {
  $type: string;
  $value: any;
  $description?: string;
}

export interface W3CDesignTokens {
  [key: string]: W3CDesignToken | W3CDesignTokens;
}

// Type-safe interfaces for specific token structures
export interface ColorTokens extends W3CDesignTokens {
  primary?: { [key: number]: W3CDesignToken };
  secondary?: { [key: number]: W3CDesignToken };
  neutral?: { [key: number]: W3CDesignToken };
  semantic?: {
    success?: W3CDesignToken;
    warning?: W3CDesignToken;
    error?: W3CDesignToken;
    info?: W3CDesignToken;
  };
}

export interface TypographyTokens extends W3CDesignTokens {
  fontFamily?: {
    primary?: W3CDesignToken;
    secondary?: W3CDesignToken;
  };
  fontSize?: {
    [key: string]: W3CDesignToken;
  };
  fontWeight?: {
    [key: string]: W3CDesignToken;
  };
  lineHeight?: {
    [key: string]: W3CDesignToken;
  };
}

export interface TransitionTokens extends W3CDesignTokens {
  duration?: {
    [key: string]: W3CDesignToken;
  };
  timingFunction?: {
    [key: string]: W3CDesignToken;
  };
}

export interface ContrastResult {
  ratio: number;
  passes: boolean;
  adjustedColor?: string;
}

export interface TokenGeneratorOptions {
  enforceWCAG?: boolean;
  minContrastRatio?: number;
  generateUtilities?: boolean;
}

export class TokenGenerator {
  private options: TokenGeneratorOptions;

  constructor(options: TokenGeneratorOptions = {}) {
    this.options = {
      enforceWCAG: true,
      minContrastRatio: 4.5,
      generateUtilities: true,
      ...options
    };
  }

  /**
   * Generate W3C Design Tokens from DesignInsight
   */
  generateTokens(insight: DesignInsight): W3CDesignTokens {
    const tokens: W3CDesignTokens = {
      color: this.generateColorTokens(insight),
      typography: this.generateTypographyTokens(insight),
      spacing: this.generateSpacingTokens(insight),
      sizing: this.generateSizingTokens(insight),
      borderRadius: this.generateBorderRadiusTokens(insight),
      shadow: this.generateShadowTokens(insight),
      transition: this.generateTransitionTokens(insight)
    };

    return tokens;
  }

  /**
   * Generate color tokens with semantic naming
   */
  private generateColorTokens(insight: DesignInsight): ColorTokens {
    const colors: ColorTokens = {};
    const palette = insight.imageryPalette;

    // Generate primary palette
    if (palette.length > 0) {
      colors.primary = {
        50: { $type: 'color', $value: this.lightenColor(palette[0], 0.95) },
        100: { $type: 'color', $value: this.lightenColor(palette[0], 0.9) },
        200: { $type: 'color', $value: this.lightenColor(palette[0], 0.8) },
        300: { $type: 'color', $value: this.lightenColor(palette[0], 0.6) },
        400: { $type: 'color', $value: this.lightenColor(palette[0], 0.4) },
        500: { $type: 'color', $value: palette[0] },
        600: { $type: 'color', $value: this.darkenColor(palette[0], 0.2) },
        700: { $type: 'color', $value: this.darkenColor(palette[0], 0.4) },
        800: { $type: 'color', $value: this.darkenColor(palette[0], 0.6) },
        900: { $type: 'color', $value: this.darkenColor(palette[0], 0.8) },
        950: { $type: 'color', $value: this.darkenColor(palette[0], 0.9) }
      };
    }

    // Generate secondary palette
    if (palette.length > 1) {
      colors.secondary = {
        50: { $type: 'color', $value: this.lightenColor(palette[1], 0.95) },
        100: { $type: 'color', $value: this.lightenColor(palette[1], 0.9) },
        200: { $type: 'color', $value: this.lightenColor(palette[1], 0.8) },
        300: { $type: 'color', $value: this.lightenColor(palette[1], 0.6) },
        400: { $type: 'color', $value: this.lightenColor(palette[1], 0.4) },
        500: { $type: 'color', $value: palette[1] },
        600: { $type: 'color', $value: this.darkenColor(palette[1], 0.2) },
        700: { $type: 'color', $value: this.darkenColor(palette[1], 0.4) },
        800: { $type: 'color', $value: this.darkenColor(palette[1], 0.6) },
        900: { $type: 'color', $value: this.darkenColor(palette[1], 0.8) },
        950: { $type: 'color', $value: this.darkenColor(palette[1], 0.9) }
      };
    }

    // Generate neutral palette
    colors.neutral = {
      50: { $type: 'color', $value: '#fafafa' },
      100: { $type: 'color', $value: '#f5f5f5' },
      200: { $type: 'color', $value: '#e5e5e5' },
      300: { $type: 'color', $value: '#d4d4d4' },
      400: { $type: 'color', $value: '#a3a3a3' },
      500: { $type: 'color', $value: '#737373' },
      600: { $type: 'color', $value: '#525252' },
      700: { $type: 'color', $value: '#404040' },
      800: { $type: 'color', $value: '#262626' },
      900: { $type: 'color', $value: '#171717' },
      950: { $type: 'color', $value: '#0a0a0a' }
    };

    // Generate semantic colors
    colors.semantic = {
      success: { $type: 'color', $value: '#16a34a' },
      warning: { $type: 'color', $value: '#d97706' },
      error: { $type: 'color', $value: '#dc2626' },
      info: { $type: 'color', $value: '#2563eb' }
    };

    // Apply WCAG contrast validation if enabled
    if (this.options.enforceWCAG) {
      this.validateAndAdjustContrast(colors);
    }

    return colors;
  }

  /**
   * Generate typography tokens
   */
  private generateTypographyTokens(insight: DesignInsight): TypographyTokens {
    const typography: TypographyTokens = {};

    // Font families
    typography.fontFamily = {};
    insight.typographyFamilies.forEach((font: string, index: number) => {
      const key = index === 0 ? 'primary' : index === 1 ? 'secondary' : `family${index + 1}`;
      (typography.fontFamily as any)[key] = {
        $type: 'fontFamily',
        $value: [font, 'sans-serif']
      };
    });

    // Font sizes based on UI density
    const sizeScale = this.getFontSizeScale(insight.uiDensity);
    typography.fontSize = {};
    Object.entries(sizeScale).forEach(([key, value]: [string, string]) => {
      (typography.fontSize as any)[key] = {
        $type: 'fontSize',
        $value: value
      };
    });

    // Font weights
    typography.fontWeight = {
      thin: { $type: 'fontWeight', $value: 100 },
      extraLight: { $type: 'fontWeight', $value: 200 },
      light: { $type: 'fontWeight', $value: 300 },
      normal: { $type: 'fontWeight', $value: 400 },
      medium: { $type: 'fontWeight', $value: 500 },
      semiBold: { $type: 'fontWeight', $value: 600 },
      bold: { $type: 'fontWeight', $value: 700 },
      extraBold: { $type: 'fontWeight', $value: 800 },
      black: { $type: 'fontWeight', $value: 900 }
    };

    // Line heights
    typography.lineHeight = {
      none: { $type: 'lineHeight', $value: 1 },
      tight: { $type: 'lineHeight', $value: 1.25 },
      snug: { $type: 'lineHeight', $value: 1.375 },
      normal: { $type: 'lineHeight', $value: 1.5 },
      relaxed: { $type: 'lineHeight', $value: 1.625 },
      loose: { $type: 'lineHeight', $value: 2 }
    };

    return typography;
  }

  /**
   * Generate spacing tokens
   */
  private generateSpacingTokens(insight: DesignInsight): W3CDesignTokens {
    const spacing: W3CDesignTokens = {};
    
    // Base spacing scale
    const baseScale = insight.spacingScale.length > 0 ? insight.spacingScale : [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64];
    const densityMultiplier = this.getDensityMultiplier(insight.uiDensity);

    baseScale.forEach((value: number, index: number) => {
      const adjustedValue = Math.round(value * densityMultiplier);
      spacing[index] = {
        $type: 'spacing',
        $value: `${adjustedValue}px`
      };
    });

    // Named spacing
    spacing.xs = { $type: 'spacing', $value: `${Math.round(4 * densityMultiplier)}px` };
    spacing.sm = { $type: 'spacing', $value: `${Math.round(8 * densityMultiplier)}px` };
    spacing.md = { $type: 'spacing', $value: `${Math.round(16 * densityMultiplier)}px` };
    spacing.lg = { $type: 'spacing', $value: `${Math.round(24 * densityMultiplier)}px` };
    spacing.xl = { $type: 'spacing', $value: `${Math.round(32 * densityMultiplier)}px` };
    spacing['2xl'] = { $type: 'spacing', $value: `${Math.round(40 * densityMultiplier)}px` };
    spacing['3xl'] = { $type: 'spacing', $value: `${Math.round(48 * densityMultiplier)}px` };

    return spacing;
  }

  /**
   * Generate sizing tokens
   */
  private generateSizingTokens(insight: DesignInsight): W3CDesignTokens {
    const sizing: W3CDesignTokens = {};
    const densityMultiplier = this.getDensityMultiplier(insight.uiDensity);

    // Base sizes
    const baseSizes = [16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 64, 72, 80, 96];
    baseSizes.forEach((size, index) => {
      const adjustedSize = Math.round(size * densityMultiplier);
      sizing[index] = {
        $type: 'sizing',
        $value: `${adjustedSize}px`
      };
    });

    // Named sizes
    sizing.xs = { $type: 'sizing', $value: `${Math.round(20 * densityMultiplier)}px` };
    sizing.sm = { $type: 'sizing', $value: `${Math.round(24 * densityMultiplier)}px` };
    sizing.md = { $type: 'sizing', $value: `${Math.round(28 * densityMultiplier)}px` };
    sizing.lg = { $type: 'sizing', $value: `${Math.round(32 * densityMultiplier)}px` };
    sizing.xl = { $type: 'sizing', $value: `${Math.round(36 * densityMultiplier)}px` };

    return sizing;
  }

  /**
   * Generate border radius tokens
   */
  private generateBorderRadiusTokens(insight: DesignInsight): W3CDesignTokens {
    const borderRadius: W3CDesignTokens = {};
    const densityMultiplier = this.getDensityMultiplier(insight.uiDensity);

    // Base border radius values
    const baseRadius = insight.uiDensity === 'compact' ? 2 : insight.uiDensity === 'spacious' ? 8 : 4;
    
    borderRadius.none = { $type: 'borderRadius', $value: '0px' };
    borderRadius.sm = { $type: 'borderRadius', $value: `${Math.round(baseRadius * 0.5)}px` };
    borderRadius.md = { $type: 'borderRadius', $value: `${baseRadius}px` };
    borderRadius.lg = { $type: 'borderRadius', $value: `${Math.round(baseRadius * 2)}px` };
    borderRadius.xl = { $type: 'borderRadius', $value: `${Math.round(baseRadius * 3)}px` };
    borderRadius['2xl'] = { $type: 'borderRadius', $value: `${Math.round(baseRadius * 4)}px` };
    borderRadius.full = { $type: 'borderRadius', $value: '9999px' };

    return borderRadius;
  }

  /**
   * Generate shadow tokens
   */
  private generateShadowTokens(insight: DesignInsight): W3CDesignTokens {
    const shadow: W3CDesignTokens = {};
    const densityMultiplier = this.getDensityMultiplier(insight.uiDensity);

    shadow.xs = { $type: 'shadow', $value: `0 1px 2px 0 rgb(0 0 0 / 0.05)` };
    shadow.sm = { $type: 'shadow', $value: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` };
    shadow.md = { $type: 'shadow', $value: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` };
    shadow.lg = { $type: 'shadow', $value: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` };
    shadow.xl = { $type: 'shadow', $value: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` };
    shadow['2xl'] = { $type: 'shadow', $value: `0 25px 50px -12px rgb(0 0 0 / 0.25)` };
    shadow.inner = { $type: 'shadow', $value: `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` };

    return shadow;
  }

  /**
   * Generate transition tokens
   */
  private generateTransitionTokens(insight: DesignInsight): TransitionTokens {
    const transition: TransitionTokens = {};

    transition.duration = {
      fast: { $type: 'duration', $value: '150ms' },
      normal: { $type: 'duration', $value: '250ms' },
      slow: { $type: 'duration', $value: '350ms' }
    };

    transition.timingFunction = {
      ease: { $type: 'cubicBezier', $value: [0.25, 0.1, 0.25, 1] },
      easeIn: { $type: 'cubicBezier', $value: [0.42, 0, 1, 1] },
      easeOut: { $type: 'cubicBezier', $value: [0, 0, 0.58, 1] },
      easeInOut: { $type: 'cubicBezier', $value: [0.42, 0, 0.58, 1] }
    };

    return transition;
  }

  /**
   * Convert to legacy DesignTokens format for backward compatibility
   */
  convertToLegacyFormat(w3cTokens: W3CDesignTokens): DesignTokens {
    const legacy: DesignTokens = {
      colors: {},
      typography: {
        fonts: [],
        sizes: {},
        weights: {},
        lineHeights: {}
      },
      spacing: {},
      borderRadius: {}
    };

    // Extract colors
    if (w3cTokens.color) {
      this.extractColorsFromW3C(w3cTokens.color as W3CDesignTokens, legacy.colors);
    }

    // Extract typography
    if (w3cTokens.typography) {
      const typo = w3cTokens.typography as W3CDesignTokens;
      if (typo.fontFamily) {
        Object.entries(typo.fontFamily).forEach(([, value]) => {
          if (typeof value === 'object' && '$value' in value) {
            const fontArray = value.$value as string[];
            if (fontArray.length > 0) {
              legacy.typography.fonts.push(fontArray[0]);
            }
          }
        });
      }
      if (typo.fontSize) {
        Object.entries(typo.fontSize).forEach(([key, value]) => {
          if (typeof value === 'object' && '$value' in value) {
            legacy.typography.sizes[key] = value.$value as string;
          }
        });
      }
      if (typo.fontWeight) {
        Object.entries(typo.fontWeight).forEach(([key, value]) => {
          if (typeof value === 'object' && '$value' in value) {
            legacy.typography.weights[key] = value.$value as number;
          }
        });
      }
      if (typo.lineHeight) {
        Object.entries(typo.lineHeight).forEach(([key, value]) => {
          if (typeof value === 'object' && '$value' in value) {
            legacy.typography.lineHeights[key] = value.$value as string;
          }
        });
      }
    }

    // Extract spacing
    if (w3cTokens.spacing) {
      Object.entries(w3cTokens.spacing).forEach(([key, value]) => {
        if (typeof value === 'object' && '$value' in value) {
          legacy.spacing[key] = value.$value as string;
        }
      });
    }

    // Extract border radius
    if (w3cTokens.borderRadius) {
      Object.entries(w3cTokens.borderRadius).forEach(([key, value]) => {
        if (typeof value === 'object' && '$value' in value) {
          legacy.borderRadius[key] = value.$value as string;
        }
      });
    }

    return legacy;
  }

  private extractColorsFromW3C(colorTokens: W3CDesignTokens, target: { [key: string]: string }, prefix = ''): void {
    Object.entries(colorTokens).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      if (typeof value === 'object' && '$value' in value) {
        target[fullKey] = value.$value as string;
      } else if (typeof value === 'object' && !('$value' in value)) {
        this.extractColorsFromW3C(value as W3CDesignTokens, target, fullKey);
      }
    });
  }

  // Helper methods
  private getFontSizeScale(density: string): { [key: string]: string } {
    const scales: { [key: string]: { [key: string]: string } } = {
      compact: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      regular: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      spacious: {
        xs: '0.875rem',
        sm: '1rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.875rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
        '5xl': '3.75rem'
      }
    };
    return scales[density] || scales.regular;
  }

  private getDensityMultiplier(density: string): number {
    const multipliers: { [key: string]: number } = {
      compact: 0.875,
      regular: 1,
      spacious: 1.125
    };
    return multipliers[density] || 1;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  private lightenColor(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
    
    return this.rgbToHex(r, g, b);
  }

  private darkenColor(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
    
    return this.rgbToHex(r, g, b);
  }

  private calculateLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    const lum1 = this.calculateLuminance(color1);
    const lum2 = this.calculateLuminance(color2);
    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (lightest + 0.05) / (darkest + 0.05);
  }

  private validateAndAdjustContrast(colors: W3CDesignTokens): void {
    // This is a simplified implementation
    // In a real implementation, you'd check all color combinations
    // and adjust them to meet WCAG contrast requirements
    const minRatio = this.options.minContrastRatio || 4.5;
    
    // Example: Ensure semantic colors have good contrast against white
    const whiteBackground = '#ffffff';
    const semanticColors = colors.semantic as W3CDesignTokens;
    
    if (semanticColors) {
      Object.entries(semanticColors).forEach(([key, value]) => {
        if (typeof value === 'object' && '$value' in value) {
          const colorValue = value.$value as string;
          const contrast = this.calculateContrastRatio(colorValue, whiteBackground);
          
          if (contrast < minRatio) {
            // Adjust color to meet minimum contrast
            const adjustedColor = this.adjustColorForContrast(colorValue, whiteBackground, minRatio);
            (value as W3CDesignToken).$value = adjustedColor;
          }
        }
      });
    }
  }

  private adjustColorForContrast(foreground: string, background: string, targetRatio: number): string {
    let adjustedColor = foreground;
    let currentRatio = this.calculateContrastRatio(foreground, background);
    
    // Simple adjustment by darkening if needed
    if (currentRatio < targetRatio) {
      let darkenAmount = 0.1;
      while (currentRatio < targetRatio && darkenAmount < 0.9) {
        adjustedColor = this.darkenColor(foreground, darkenAmount);
        currentRatio = this.calculateContrastRatio(adjustedColor, background);
        darkenAmount += 0.1;
      }
    }
    
    return adjustedColor;
  }

  /**
   * Validate contrast ratio between two colors
   */
  validateContrast(color1: string, color2: string): ContrastResult {
    const ratio = this.calculateContrastRatio(color1, color2);
    const passes = ratio >= (this.options.minContrastRatio || 4.5);
    
    let adjustedColor: string | undefined;
    if (!passes) {
      adjustedColor = this.adjustColorForContrast(color1, color2, this.options.minContrastRatio || 4.5);
    }
    
    return {
      ratio,
      passes,
      adjustedColor
    };
  }
}

export default TokenGenerator;
