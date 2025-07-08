#!/usr/bin/env node

/**
 * EPIC B Token Generation Demo
 * 
 * This script demonstrates the comprehensive token generator that converts
 * DesignInsight into implementation-ready design tokens following W3C Design Tokens v1 schema.
 */

import { TokenGenerator } from '../src/generators/tokens.js';
import { TailwindConfigGenerator } from '../src/generators/tailwind-config.js';
import { WCAGValidator } from '../src/generators/wcag-validator.js';
import { DesignInsight } from '../src/types/index.js';
import { promises as fs } from 'fs';
import path from 'path';

// Example DesignInsight data (normally would come from EPIC A)
const mockDesignInsight: DesignInsight = {
  imageryPalette: [
    '#3b82f6', // Blue - Primary
    '#10b981', // Green - Secondary  
    '#f59e0b', // Amber - Accent
    '#ef4444', // Red - Alert
    '#8b5cf6', // Purple - Highlight
  ],
  typographyFamilies: [
    'Inter',
    'JetBrains Mono',
    'Playfair Display'
  ],
  spacingScale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
  uiDensity: 'regular',
  brandKeywords: [
    'modern',
    'professional', 
    'approachable',
    'trustworthy',
    'innovative'
  ],
  supportingReferences: [
    'https://example.com/brand-guide.png',
    'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Modern card design with subtle shadows and rounded corners'
  ]
};

async function runTokenGenerationDemo(): Promise<void> {
  console.log('🎨 EPIC B: Token Generation Demo\n');
  console.log('================================\n');

  // B-1: Generate W3C Design Tokens from DesignInsight
  console.log('📋 B-1: Generating W3C Design Tokens...\n');
  
  const tokenGenerator = new TokenGenerator({
    enforceWCAG: true,
    minContrastRatio: 4.5,
    generateUtilities: true
  });

  const w3cTokens = tokenGenerator.generateTokens(mockDesignInsight);
  
  // Convert to legacy format for backward compatibility
  const legacyTokens = tokenGenerator.convertToLegacyFormat(w3cTokens);

  console.log('✅ Generated W3C Design Tokens:');
  console.log(`   - Color tokens: ${Object.keys((w3cTokens.color as any) || {}).length} groups`);
  console.log(`   - Typography tokens: ${Object.keys((w3cTokens.typography as any) || {}).length} categories`);
  console.log(`   - Spacing tokens: ${Object.keys((w3cTokens.spacing as any) || {}).length} values`);
  console.log(`   - Border radius tokens: ${Object.keys((w3cTokens.borderRadius as any) || {}).length} values`);
  console.log(`   - Shadow tokens: ${Object.keys((w3cTokens.shadow as any) || {}).length} variants`);
  console.log(`   - Transition tokens: ${Object.keys((w3cTokens.transition as any) || {}).length} categories\n`);

  // B-2: Demonstrate W3C Design Tokens v1 schema compliance
  console.log('📋 B-2: W3C Design Tokens v1 Schema Compliance...\n');
  
  // Show example tokens with $type and $value properties
  console.log('✅ W3C Schema Example - Primary Color Scale:');
  const primaryColors = (w3cTokens.color as any)?.primary;
  if (primaryColors) {
    Object.entries(primaryColors).slice(0, 3).forEach(([shade, token]: [string, any]) => {
      console.log(`   primary-${shade}: { $type: "${token.$type}", $value: "${token.$value}" }`);
    });
  }
  console.log();

  console.log('✅ W3C Schema Example - Typography Tokens:');
  const fontSizes = (w3cTokens.typography as any)?.fontSize;
  if (fontSizes) {
    Object.entries(fontSizes).slice(0, 3).forEach(([size, token]: [string, any]) => {
      console.log(`   fontSize-${size}: { $type: "${token.$type}", $value: "${token.$value}" }`);
    });
  }
  console.log();

  // B-3: Generate Tailwind Config
  console.log('📋 B-3: Generating tailwind.config.ts...\n');
  
  const tailwindGenerator = new TailwindConfigGenerator({
    prefix: 'sc-', // SuperComponents prefix
    important: false,
    corePlugins: undefined,
    plugins: ['@tailwindcss/forms', '@tailwindcss/typography']
  });

  const tailwindConfig = tailwindGenerator.generateConfig(w3cTokens);
  const cssCustomProperties = tailwindGenerator.generateCSSCustomProperties(w3cTokens);

  console.log('✅ Generated Tailwind Configuration:');
  console.log(`   - Config file size: ${tailwindConfig.length} characters`);
  console.log(`   - CSS custom properties: ${cssCustomProperties.split('\n').length - 2} variables`);
  console.log(`   - Theme extensions: colors, typography, spacing, sizing, etc.\n`);

  // B-4: WCAG Contrast Validation & HTML Swatch Renderer
  console.log('📋 B-4: WCAG Contrast Validation & Swatch Generation...\n');
  
  const wcagValidator = new WCAGValidator(4.5, 3.0); // AA level, large text
  
  // Validate contrast ratios
  const validationResults = wcagValidator.validateTokens(w3cTokens);
  const passedCount = validationResults.filter(r => r.passes).length;
  const failedCount = validationResults.filter(r => !r.passes).length;
  const aaaCount = validationResults.filter(r => r.level === 'AAA').length;
  
  console.log('✅ WCAG Contrast Validation Results:');
  console.log(`   - Total combinations tested: ${validationResults.length}`);
  console.log(`   - PASSED (AA): ${passedCount} combinations`);
  console.log(`   - FAILED: ${failedCount} combinations`);
  console.log(`   - AAA Level: ${aaaCount} combinations`);
  console.log(`   - Pass rate: ${((passedCount / validationResults.length) * 100).toFixed(1)}%\n`);

  // Generate specific validation examples
  console.log('✅ Individual Contrast Validation Examples:');
  
  // Test primary color on white background
  const primaryMain = (w3cTokens.color as any)?.primary?.[500]?.$value;
  if (primaryMain) {
    const primaryResult = wcagValidator.validateColorCombination(primaryMain, '#ffffff');
    console.log(`   - Primary (${primaryMain}) on white: ${primaryResult.ratio.toFixed(2)}:1 (${primaryResult.level})`);
  }

  // Test semantic colors
  const semanticColors = (w3cTokens.color as any)?.semantic;
  if (semanticColors) {
    ['success', 'warning', 'error', 'info'].forEach(type => {
      const color = semanticColors[type]?.$value;
      if (color) {
        const result = wcagValidator.validateColorCombination(color, '#ffffff');
        console.log(`   - ${type.charAt(0).toUpperCase() + type.slice(1)} (${color}) on white: ${result.ratio.toFixed(2)}:1 (${result.level})`);
      }
    });
  }
  console.log();

  // Generate HTML swatch renderer
  console.log('✅ Generating HTML Swatch Renderer...\n');
  
  const swatchHTML = wcagValidator.generateSwatchHTML(w3cTokens, true);
  const accessibilityReport = wcagValidator.generateAccessibilityReport(w3cTokens);
  
  console.log(`   - HTML swatch file size: ${swatchHTML.length} characters`);
  console.log(`   - Accessibility report: ${accessibilityReport.split('\n').length} lines`);
  console.log(`   - Includes: color swatches, contrast ratios, WCAG validation\n`);

  // Save generated files
  console.log('💾 Saving Generated Files...\n');
  
  const outputDir = 'examples/output';
  await fs.mkdir(outputDir, { recursive: true });

  // Save W3C tokens
  await fs.writeFile(
    path.join(outputDir, 'design-tokens-w3c.json'),
    JSON.stringify(w3cTokens, null, 2)
  );

  // Save legacy tokens
  await fs.writeFile(
    path.join(outputDir, 'design-tokens-legacy.json'),
    JSON.stringify(legacyTokens, null, 2)
  );

  // Save Tailwind config
  await fs.writeFile(
    path.join(outputDir, 'tailwind.config.ts'),
    tailwindConfig
  );

  // Save CSS custom properties
  await fs.writeFile(
    path.join(outputDir, 'design-tokens.css'),
    cssCustomProperties
  );

  // Save HTML swatches
  await fs.writeFile(
    path.join(outputDir, 'design-tokens-swatches.html'),
    swatchHTML
  );

  // Save accessibility report
  await fs.writeFile(
    path.join(outputDir, 'accessibility-report.md'),
    accessibilityReport
  );

  console.log('✅ Files saved to examples/output/:');
  console.log('   - design-tokens-w3c.json (W3C Design Tokens v1 format)');
  console.log('   - design-tokens-legacy.json (Backward compatibility format)');
  console.log('   - tailwind.config.ts (Tailwind CSS configuration)');
  console.log('   - design-tokens.css (CSS custom properties)');
  console.log('   - design-tokens-swatches.html (Visual swatch renderer)');
  console.log('   - accessibility-report.md (WCAG compliance report)\n');

  // Demo specific features
  console.log('🎯 Feature Demonstrations:\n');

  // Show density variations
  console.log('✅ UI Density Variations:');
  ['compact', 'regular', 'spacious'].forEach(density => {
    const densityInsight = { ...mockDesignInsight, uiDensity: density as any };
    const densityTokens = tokenGenerator.generateTokens(densityInsight);
    const spacing = (densityTokens.spacing as any)?.md?.$value;
    const radius = (densityTokens.borderRadius as any)?.md?.$value;
    console.log(`   - ${density}: spacing-md=${spacing}, borderRadius-md=${radius}`);
  });
  console.log();

  // Show color scale generation
  console.log('✅ Automatic Color Scale Generation:');
  if (primaryColors) {
    const shades = [50, 500, 950];
    shades.forEach(shade => {
      const color = primaryColors[shade]?.$value;
      console.log(`   - primary-${shade}: ${color}`);
    });
  }
  console.log();

  // Show WCAG auto-adjustment
  console.log('✅ WCAG Auto-Adjustment Example:');
  const lowContrastColor = '#cccccc';
  const background = '#ffffff';
  const adjustmentResult = wcagValidator.validateColorCombination(lowContrastColor, background);
  console.log(`   - Original: ${lowContrastColor} on ${background} = ${adjustmentResult.ratio.toFixed(2)}:1`);
  if (adjustmentResult.adjustedForeground) {
    const adjustedResult = wcagValidator.validateColorCombination(adjustmentResult.adjustedForeground, background);
    console.log(`   - Adjusted: ${adjustmentResult.adjustedForeground} on ${background} = ${adjustedResult.ratio.toFixed(2)}:1`);
  }
  console.log();

  console.log('🎉 EPIC B Token Generation Demo Complete!\n');
  console.log('Key Features Demonstrated:');
  console.log('✓ W3C Design Tokens v1 schema compliance ($type, $value)');
  console.log('✓ Comprehensive token generation (colors, typography, spacing, etc.)');
  console.log('✓ Tailwind CSS configuration generation');
  console.log('✓ WCAG contrast validation with automatic adjustments');
  console.log('✓ HTML swatch renderer for visual validation');
  console.log('✓ UI density variations (compact, regular, spacious)');
  console.log('✓ Automatic color scale generation');
  console.log('✓ CSS custom properties generation');
  console.log('✓ Accessibility reporting and compliance checking');
  console.log();
  console.log('Open examples/output/design-tokens-swatches.html in your browser to see the visual swatches!');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runTokenGenerationDemo().catch(console.error);
}

export { runTokenGenerationDemo };
