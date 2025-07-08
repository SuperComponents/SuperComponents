import { W3CDesignTokens, W3CDesignToken, ContrastResult } from './tokens.js';

export interface WCAGValidationResult {
  passes: boolean;
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  foreground: string;
  background: string;
  adjustedForeground?: string;
  adjustedBackground?: string;
}

export interface ColorCombination {
  foreground: string;
  background: string;
  name: string;
  usage: string;
}

export interface SwatchData {
  name: string;
  value: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  luminance: number;
  contrastWithWhite: number;
  contrastWithBlack: number;
}

export class WCAGValidator {
  private minContrastRatio: number;
  private largeTextRatio: number;

  constructor(minContrastRatio = 4.5, largeTextRatio = 3.0) {
    this.minContrastRatio = minContrastRatio;
    this.largeTextRatio = largeTextRatio;
  }

  /**
   * Validate all color combinations in design tokens
   */
  validateTokens(tokens: W3CDesignTokens): WCAGValidationResult[] {
    const results: WCAGValidationResult[] = [];
    const colors = this.extractColors(tokens);
    const combinations = this.generateColorCombinations(colors);

    combinations.forEach(combo => {
      const result = this.validateColorCombination(combo.foreground, combo.background);
      results.push({
        ...result,
        foreground: combo.foreground,
        background: combo.background
      });
    });

    return results;
  }

  /**
   * Validate a specific color combination
   */
  validateColorCombination(foreground: string, background: string): WCAGValidationResult {
    const ratio = this.calculateContrastRatio(foreground, background);
    const passes = ratio >= this.minContrastRatio;
    const level = this.getWCAGLevel(ratio);

    let adjustedForeground: string | undefined;
    let adjustedBackground: string | undefined;

    if (!passes) {
      // Try adjusting foreground first
      adjustedForeground = this.adjustColorForContrast(foreground, background, this.minContrastRatio);
      
      // If foreground adjustment isn't enough, try background
      const newRatio = this.calculateContrastRatio(adjustedForeground, background);
      if (newRatio < this.minContrastRatio) {
        adjustedBackground = this.adjustColorForContrast(background, adjustedForeground, this.minContrastRatio);
      }
    }

    return {
      passes,
      ratio,
      level,
      foreground,
      background,
      adjustedForeground,
      adjustedBackground
    };
  }

  /**
   * Generate HTML swatch renderer
   */
  generateSwatchHTML(tokens: W3CDesignTokens, includeValidation = true): string {
    const colors = this.extractColors(tokens);
    const swatches = this.generateSwatchData(colors);
    
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Token Swatches</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .swatch-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .swatch-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .swatch-color {
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .swatch-info {
            padding: 16px;
        }
        
        .swatch-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .swatch-value {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        
        .swatch-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
        }
        
        .metric {
            font-size: 12px;
        }
        
        .metric-label {
            color: #666;
            font-weight: 500;
        }
        
        .metric-value {
            font-weight: 600;
        }
        
        .contrast-pass {
            color: #16a34a;
        }
        
        .contrast-fail {
            color: #dc2626;
        }
        
        .contrast-warning {
            color: #d97706;
        }
        
${includeValidation ? `
        .validation-section {
            margin-top: 40px;
        }
        
        .validation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .validation-card {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .validation-preview {
            height: 60px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .validation-details {
            font-size: 12px;
        }
        
        .ratio-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .ratio-pass {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .ratio-fail {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .ratio-warning {
            background: #fef3c7;
            color: #d97706;
        }` : ''}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Design Token Swatches</h1>
            <p>Generated color swatches with WCAG accessibility validation</p>
        </div>
        
        <div class="swatch-grid" aria-label="Color swatches grid">
`;

    // Generate swatch cards
    swatches.forEach(swatch => {
      const textColor = swatch.contrastWithWhite > swatch.contrastWithBlack ? 'white' : 'black';
      const contrastRatio = textColor === 'white' ? swatch.contrastWithWhite : swatch.contrastWithBlack;
      const contrastClass = contrastRatio >= 4.5 ? 'contrast-pass' : contrastRatio >= 3.0 ? 'contrast-warning' : 'contrast-fail';
      
      html += `
            <div class="swatch-card">
                <div class="swatch-color" style="background-color: ${swatch.value}; color: ${textColor};">
                    ${swatch.name}
                </div>
                <div class="swatch-info">
                    <div class="swatch-name">${swatch.name}</div>
                    <div class="swatch-value">HEX: ${swatch.value}</div>
                    <div class="swatch-value">RGB: rgb(${swatch.rgb.r}, ${swatch.rgb.g}, ${swatch.rgb.b})</div>
                    <div class="swatch-value">HSL: hsl(${swatch.hsl.h}°, ${swatch.hsl.s}%, ${swatch.hsl.l}%)</div>
                    <div class="swatch-metrics">
                        <div class="metric">
                            <div class="metric-label">Luminance</div>
                            <div class="metric-value">${swatch.luminance.toFixed(3)}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Contrast</div>
                            <div class="metric-value ${contrastClass}">${contrastRatio.toFixed(2)}:1</div>
                        </div>
                    </div>
                </div>
            </div>
`;
    });

    html += `
        </div>
`;

    // Add validation section if requested
    if (includeValidation) {
      html += this.generateValidationSection(tokens);
    }

    html += `
    </div>
</body>
</html>
`;

    return html;
  }

  private generateValidationSection(tokens: W3CDesignTokens): string {
    const validationResults = this.validateTokens(tokens);
    const combinations = this.generateTestCombinations(tokens);
    
    let html = `
        <div class="validation-section">
            <div class="header">
                <h2>WCAG Contrast Validation</h2>
                <p>Common color combinations tested against WCAG 2.1 guidelines</p>
            </div>
            <div class="validation-grid" aria-label="WCAG validation results">
`;

    combinations.forEach(combo => {
      const result = this.validateColorCombination(combo.foreground, combo.background);
      const ratioClass = result.passes ? 'ratio-pass' : result.ratio >= this.largeTextRatio ? 'ratio-warning' : 'ratio-fail';
      const ratioText = result.passes ? 'PASS' : result.ratio >= this.largeTextRatio ? 'LARGE' : 'FAIL';
      
      html += `
                <div class="validation-card">
                    <div class="validation-preview" style="background-color: ${combo.background}; color: ${combo.foreground};">
                        Sample Text
                    </div>
                    <div class="validation-details">
                        <div><strong>${combo.name}</strong></div>
                        <div style="margin: 4px 0;">
                            <span>Ratio: ${result.ratio.toFixed(2)}:1</span>
                            <span class="ratio-badge ${ratioClass}">${ratioText}</span>
                        </div>
                        <div style="font-size: 11px; color: #666;">
                            ${combo.usage}
                        </div>
                    </div>
                </div>
`;
    });

    html += `
            </div>
        </div>
`;

    return html;
  }

  private extractColors(tokens: W3CDesignTokens): { [key: string]: string } {
    const colors: { [key: string]: string } = {};
    this.extractColorValues(tokens, colors);
    return colors;
  }

  private extractColorValues(tokens: W3CDesignTokens, colors: { [key: string]: string }, prefix = ''): void {
    Object.entries(tokens).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && '$value' in value) {
        const token = value as W3CDesignToken;
        if (token.$type === 'color') {
          colors[fullKey] = token.$value;
        }
      } else if (typeof value === 'object' && !('$value' in value)) {
        this.extractColorValues(value as W3CDesignTokens, colors, fullKey);
      }
    });
  }

  private generateColorCombinations(colors: { [key: string]: string }): ColorCombination[] {
    const combinations: ColorCombination[] = [];
    const colorEntries = Object.entries(colors);
    
    // Generate common UI combinations
    const primaryColors = colorEntries.filter(([name]) => name.includes('primary'));
    const neutralColors = colorEntries.filter(([name]) => name.includes('neutral'));
    const semanticColors = colorEntries.filter(([name]) => name.includes('semantic'));
    
    // Primary on neutral backgrounds
    primaryColors.forEach(([primaryName, primaryValue]) => {
      neutralColors.forEach(([neutralName, neutralValue]) => {
        combinations.push({
          foreground: primaryValue,
          background: neutralValue,
          name: `${primaryName} on ${neutralName}`,
          usage: 'Primary text on neutral background'
        });
      });
    });
    
    // Semantic colors on neutral backgrounds
    semanticColors.forEach(([semanticName, semanticValue]) => {
      neutralColors.forEach(([neutralName, neutralValue]) => {
        combinations.push({
          foreground: semanticValue,
          background: neutralValue,
          name: `${semanticName} on ${neutralName}`,
          usage: 'Semantic color on neutral background'
        });
      });
    });
    
    return combinations;
  }

  private generateTestCombinations(tokens: W3CDesignTokens): ColorCombination[] {
    const colors = this.extractColors(tokens);
    const combinations: ColorCombination[] = [];
    
    // Common UI combinations
    const testCombos = [
      { fg: 'color-primary-500', bg: 'color-neutral-50', name: 'Primary Button', usage: 'Primary button background' },
      { fg: 'color-neutral-50', bg: 'color-primary-500', name: 'Primary Button Text', usage: 'Primary button text' },
      { fg: 'color-neutral-900', bg: 'color-neutral-50', name: 'Body Text', usage: 'Main body text' },
      { fg: 'color-neutral-600', bg: 'color-neutral-50', name: 'Secondary Text', usage: 'Secondary text content' },
      { fg: 'color-semantic-error', bg: 'color-neutral-50', name: 'Error Text', usage: 'Error messages' },
      { fg: 'color-semantic-success', bg: 'color-neutral-50', name: 'Success Text', usage: 'Success messages' },
      { fg: 'color-semantic-warning', bg: 'color-neutral-50', name: 'Warning Text', usage: 'Warning messages' },
      { fg: 'color-neutral-50', bg: 'color-semantic-error', name: 'Error Background', usage: 'Error alert background' },
      { fg: 'color-neutral-400', bg: 'color-neutral-300', name: 'Poor Contrast', usage: 'Low contrast example' }
    ];
    
    testCombos.forEach(combo => {
      const fgColor = colors[combo.fg];
      const bgColor = colors[combo.bg];
      
      if (fgColor && bgColor) {
        combinations.push({
          foreground: fgColor,
          background: bgColor,
          name: combo.name,
          usage: combo.usage
        });
      }
    });
    
    return combinations;
  }

  private generateSwatchData(colors: { [key: string]: string }): SwatchData[] {
    return Object.entries(colors).map(([name, value]) => {
      const rgb = this.hexToRgb(value);
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      const luminance = this.calculateLuminance(value);
      
      return {
        name,
        value,
        rgb,
        hsl,
        luminance,
        contrastWithWhite: this.calculateContrastRatio(value, '#ffffff'),
        contrastWithBlack: this.calculateContrastRatio(value, '#000000')
      };
    });
  }

  private calculateLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
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

  private getWCAGLevel(ratio: number): 'AA' | 'AAA' | 'fail' {
    if (ratio >= 7.0) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'fail';
  }

  private adjustColorForContrast(color: string, background: string, targetRatio: number): string {
    let adjustedColor = color;
    let currentRatio = this.calculateContrastRatio(color, background);
    
    if (currentRatio < targetRatio) {
      // Try darkening first
      let darkenAmount = 0.1;
      while (currentRatio < targetRatio && darkenAmount < 0.9) {
        adjustedColor = this.darkenColor(color, darkenAmount);
        currentRatio = this.calculateContrastRatio(adjustedColor, background);
        darkenAmount += 0.1;
      }
      
      // If darkening didn't work, try lightening
      if (currentRatio < targetRatio) {
        adjustedColor = color;
        let lightenAmount = 0.1;
        while (currentRatio < targetRatio && lightenAmount < 0.9) {
          adjustedColor = this.lightenColor(color, lightenAmount);
          currentRatio = this.calculateContrastRatio(adjustedColor, background);
          lightenAmount += 0.1;
        }
      }
    }
    
    return adjustedColor;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private lightenColor(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
    
    return this.rgbToHex(r, g, b);
  }

  private darkenColor(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
    
    return this.rgbToHex(r, g, b);
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Save swatch HTML to file
   */
  async saveSwatchHTML(tokens: W3CDesignTokens, filename: string): Promise<void> {
    const html = this.generateSwatchHTML(tokens, true);
    const fs = await import('fs');
    fs.writeFileSync(filename, html);
  }

  /**
   * Generate accessibility report
   */
  generateAccessibilityReport(tokens: W3CDesignTokens): string {
    const results = this.validateTokens(tokens);
    const passed = results.filter(r => r.passes).length;
    const total = results.length;
    const passRate = (passed / total) * 100;
    
    let report = `# WCAG Accessibility Report\n\n`;
    report += `**Overall Pass Rate:** ${passRate.toFixed(1)}% (${passed}/${total})\n\n`;
    report += `## Summary\n\n`;
    report += `- ✅ **AA Level:** ${results.filter(r => r.level === 'AA').length} combinations\n`;
    report += `- 🏆 **AAA Level:** ${results.filter(r => r.level === 'AAA').length} combinations\n`;
    report += `- ❌ **Failed:** ${results.filter(r => r.level === 'fail').length} combinations\n\n`;
    
    const failedResults = results.filter(r => !r.passes);
    if (failedResults.length > 0) {
      report += `## Failed Combinations\n\n`;
      failedResults.forEach(result => {
        report += `- **${result.foreground}** on **${result.background}**\n`;
        report += `  - Ratio: ${result.ratio.toFixed(2)}:1 (minimum: ${this.minContrastRatio}:1)\n`;
        if (result.adjustedForeground) {
          report += `  - Suggested foreground: ${result.adjustedForeground}\n`;
        }
        if (result.adjustedBackground) {
          report += `  - Suggested background: ${result.adjustedBackground}\n`;
        }
        report += `\n`;
      });
    }
    
    return report;
  }
}

export default WCAGValidator;
