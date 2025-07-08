// src/workflows/inspiration-to-system.ts
import { DesignTokens, DesignInsight } from '../types/index.js';
import { AIDesignAnalyzer, InspirationInput } from '../ai/design-analyzer.js';
import { TokenGenerator, W3CDesignTokens } from '../generators/tokens.js';
import { generatePrinciples, writePrinciplesToFiles, PrinciplesOutput } from '../generators/principles.js';
import { ComponentFactory } from '../generators/components/factory.js';
import { WCAGValidator, WCAGValidationResult } from '../generators/wcag-validator.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface UserInspiration {
  // Visual inspiration
  imageUrl?: string;
  websiteUrl?: string;
  
  // Textual inspiration
  description?: string;
  brandKeywords?: string[];
  industryType?: string;
  targetUsers?: string;
  
  // Preferences
  colorPreferences?: string[];
  stylePreferences?: ('modern' | 'classic' | 'playful' | 'professional' | 'minimalist')[];
  accessibility?: 'basic' | 'enhanced' | 'enterprise';
}

export interface GeneratedDesignSystem {
  tokens: W3CDesignTokens;
  legacyTokens: DesignTokens;
  principles: PrinciplesOutput;
  insights: DesignInsight;
  wcagResults: WCAGValidationResult[];
  metadata: {
    timestamp: string;
    version: string;
    source: InspirationInput;
  };
}

export class InspirationToSystemWorkflow {
  private analyzer: AIDesignAnalyzer;
  private tokenGenerator: TokenGenerator;
  private wcagValidator: WCAGValidator;
  
  constructor() {
    this.analyzer = new AIDesignAnalyzer();
    this.tokenGenerator = new TokenGenerator();
    this.wcagValidator = new WCAGValidator();
  }
  
  /**
   * Main entry point: Turn user inspiration into complete design system
   */
  async generateDesignSystem(inspiration: UserInspiration, outputDir: string, options: { skipStorybook?: boolean; skipWcagValidation?: boolean } = {}): Promise<GeneratedDesignSystem> {
    console.log('🚀 Starting inspiration-to-system workflow...');
    
    // Step 1: AI analysis of inspiration using AIDesignAnalyzer
    const inspirationInput = this.convertToInspirationInput(inspiration);
    const analysisResult = await this.analyzer.analyzeInspiration(inspirationInput);
    
    // Step 2: Generate W3C tokens and convert to legacy format (parallel)
    const w3cTokens = this.tokenGenerator.generateTokens(analysisResult.insights);
    const legacyTokens = this.tokenGenerator.convertToLegacyFormat(w3cTokens);
    
    // Step 3: Run WCAG validation on generated tokens
    console.log('🔍 Running WCAG validation...');
    const wcagResults = this.wcagValidator.validateTokens(w3cTokens);
    const failedResults = wcagResults.filter(result => !result.passes);
    
    if (failedResults.length > 0 && !options.skipWcagValidation) {
      console.error(`❌ WCAG validation failed with ${failedResults.length} violations:`);
      failedResults.forEach(result => {
        console.error(`  - ${result.foreground} on ${result.background}: ${result.ratio.toFixed(2)}:1 (needs 4.5:1)`);
      });
      throw new Error(`WCAG validation failed with ${failedResults.length} contrast violations`);
    } else if (failedResults.length > 0) {
      console.warn(`⚠️  WCAG validation found ${failedResults.length} potential contrast issues (validation skipped)`);
    } else {
      console.log(`✅ WCAG validation passed (${wcagResults.length} combinations tested)`);
    }
    
    // Step 4: Generate principles and components in parallel
    const componentFactory = new ComponentFactory({
      outputDir: join(outputDir, 'src', 'components'),
      generateTests: true,
      generateStories: true,
      includeTailwind: true
    });
    
    // Run principles generation and component generation in parallel
    const [principlesOutput] = await Promise.all([
      generatePrinciples(analysisResult.insights),
      componentFactory.generate(w3cTokens)
    ]);
    
    // Step 5: Write all artifacts including WCAG results
    await Promise.all([
      writePrinciplesToFiles(principlesOutput),
      this.writeArtifacts(outputDir, w3cTokens, legacyTokens, principlesOutput, analysisResult.insights, inspirationInput, wcagResults, options)
    ]);
    
    const result: GeneratedDesignSystem = {
      tokens: w3cTokens,
      legacyTokens,
      principles: principlesOutput,
      insights: analysisResult.insights,
      wcagResults,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        source: inspirationInput
      }
    };
    
    console.log('✅ Design system generation complete!');
    return result;
  }

  private convertToInspirationInput(inspiration: UserInspiration): InspirationInput {
    // Determine the primary source type and value
    if (inspiration.imageUrl) {
      return {
        type: 'image',
        source: inspiration.imageUrl,
        context: this.buildContext(inspiration)
      };
    } else if (inspiration.websiteUrl) {
      return {
        type: 'url',
        source: inspiration.websiteUrl,
        context: this.buildContext(inspiration)
      };
    } else {
      return {
        type: 'text',
        source: inspiration.description || 'Modern design system',
        context: this.buildContext(inspiration)
      };
    }
  }

  private buildContext(inspiration: UserInspiration): string {
    const contextParts = [];
    
    if (inspiration.brandKeywords?.length) {
      contextParts.push(`Brand keywords: ${inspiration.brandKeywords.join(', ')}`);
    }
    
    if (inspiration.industryType) {
      contextParts.push(`Industry: ${inspiration.industryType}`);
    }
    
    if (inspiration.targetUsers) {
      contextParts.push(`Target users: ${inspiration.targetUsers}`);
    }
    
    if (inspiration.colorPreferences?.length) {
      contextParts.push(`Color preferences: ${inspiration.colorPreferences.join(', ')}`);
    }
    
    if (inspiration.stylePreferences?.length) {
      contextParts.push(`Style preferences: ${inspiration.stylePreferences.join(', ')}`);
    }
    
    if (inspiration.accessibility) {
      contextParts.push(`Accessibility level: ${inspiration.accessibility}`);
    }
    
    return contextParts.join('\n');
  }

  private async writeArtifacts(
    outputDir: string,
    w3cTokens: W3CDesignTokens,
    legacyTokens: DesignTokens,
    principlesOutput: PrinciplesOutput,
    insights: DesignInsight,
    source: InspirationInput,
    wcagResults: WCAGValidationResult[],
    options: { skipStorybook?: boolean; skipWcagValidation?: boolean } = {}
  ): Promise<void> {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write W3C design tokens
    const tokensDir = join(outputDir, 'tokens');
    await fs.mkdir(tokensDir, { recursive: true });
    await fs.writeFile(
      join(tokensDir, 'design-tokens.json'),
      JSON.stringify(w3cTokens, null, 2),
      'utf8'
    );
    
    // Generate and write design-tokens.css from validated tokens
    const designTokensCSS = this.generateDesignTokensCSS(w3cTokens);
    await fs.writeFile(
      join(tokensDir, 'design-tokens.css'),
      designTokensCSS,
      'utf8'
    );
    
    // Generate and write Tailwind config
    const tailwindConfig = this.generateTailwindConfig(w3cTokens);
    await fs.writeFile(
      join(outputDir, 'tailwind.config.ts'),
      tailwindConfig,
      'utf8'
    );
    
    // Export WCAG results as JSON
    await fs.writeFile(
      join(outputDir, 'wcag-results.json'),
      JSON.stringify(wcagResults, null, 2),
      'utf8'
    );
    
    // Generate WCAG accessibility report
    const accessibilityReport = this.wcagValidator.generateAccessibilityReport(w3cTokens);
    await fs.writeFile(
      join(outputDir, 'accessibility-report.md'),
      accessibilityReport,
      'utf8'
    );
    
    // Generate and save color swatches HTML
    await this.wcagValidator.saveSwatchHTML(w3cTokens, join(outputDir, 'color-swatches.html'));
    
    // Copy Storybook scaffold if not skipped
    if (!options.skipStorybook) {
      await this.copyStorybookScaffold(outputDir, w3cTokens);
    }
    
    // Write metadata
    const metadataDir = join(outputDir, '.supercomponents');
    await fs.mkdir(metadataDir, { recursive: true });
    const metadata = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source,
      insights,
      generatedFiles: [
        'design/PRINCIPLES.md',
        'tokens/design-tokens.json',
        'tokens/design-tokens.css',
        'tailwind.config.ts',
        'wcag-results.json',
        'accessibility-report.md',
        'color-swatches.html',
        'src/components/Button/',
        'src/components/Input/',
        'src/components/Card/',
        'src/components/Modal/',
        'src/stories/Principles.stories.mdx',
        ...(options.skipStorybook ? [] : ['.storybook/main.ts', '.storybook/preview.ts', 'package.json'])
      ]
    };
    await fs.writeFile(
      join(metadataDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8'
    );
    
    console.log('📝 Artifacts written to disk');
  }

  private generateTailwindConfig(tokens: W3CDesignTokens): string {
    const config = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          ${this.extractColorScale(tokens.color?.primary)}
        },
        secondary: {
          ${this.extractColorScale(tokens.color?.secondary)}
        },
        neutral: {
          ${this.extractColorScale(tokens.color?.neutral)}
        },
        semantic: {
          ${this.extractSemanticColors(tokens.color?.semantic)}
        }
      },
      fontFamily: {
        ${this.extractFontFamily(tokens.typography?.fontFamily)}
      },
      fontSize: {
        ${this.extractFontSize(tokens.typography?.fontSize)}
      },
      spacing: {
        ${this.extractSpacing(tokens.spacing)}
      },
      borderRadius: {
        ${this.extractBorderRadius(tokens.borderRadius)}
      },
      boxShadow: {
        ${this.extractShadows(tokens.shadow)}
      }
    }
  },
  plugins: [],
};

export default config;
`;
    return config;
  }

  private extractColorScale(colorObject: any): string {
    if (!colorObject || typeof colorObject !== 'object') return '';
    
    const entries = Object.entries(colorObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `          ${key}: '${value.$value}'`);
    
    return entries.join(',\n');
  }

  private extractSemanticColors(semanticObject: any): string {
    if (!semanticObject || typeof semanticObject !== 'object') return '';
    
    const entries = Object.entries(semanticObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `          ${key}: '${value.$value}'`);
    
    return entries.join(',\n');
  }

  private extractFontFamily(fontObject: any): string {
    if (!fontObject || typeof fontObject !== 'object') return '';
    
    const entries = Object.entries(fontObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `        '${key}': ${JSON.stringify(value.$value)}`);
    
    return entries.join(',\n');
  }

  private extractFontSize(fontObject: any): string {
    if (!fontObject || typeof fontObject !== 'object') return '';
    
    const entries = Object.entries(fontObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `        '${key}': '${value.$value}'`);
    
    return entries.join(',\n');
  }

  private extractSpacing(spacingObject: any): string {
    if (!spacingObject || typeof spacingObject !== 'object') return '';
    
    const entries = Object.entries(spacingObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `        '${key}': '${value.$value}'`);
    
    return entries.join(',\n');
  }

  private extractBorderRadius(borderObject: any): string {
    if (!borderObject || typeof borderObject !== 'object') return '';
    
    const entries = Object.entries(borderObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `        '${key}': '${value.$value}'`);
    
    return entries.join(',\n');
  }

  private extractShadows(shadowObject: any): string {
    if (!shadowObject || typeof shadowObject !== 'object') return '';
    
    const entries = Object.entries(shadowObject)
      .filter(([, value]) => value && typeof value === 'object' && '$value' in value)
      .map(([key, value]: [string, any]) => `        '${key}': '${value.$value}'`);
    
    return entries.join(',\n');
  }

  private generateDesignTokensCSS(tokens: W3CDesignTokens): string {
    const cssVariables = this.extractCSSVariables(tokens);
    
    return `:root {
${cssVariables}
}

/* Color utility classes */
.text-primary { color: var(--color-primary-500); }
.text-secondary { color: var(--color-secondary-500); }
.text-neutral { color: var(--color-neutral-900); }
.text-success { color: var(--color-semantic-success); }
.text-warning { color: var(--color-semantic-warning); }
.text-error { color: var(--color-semantic-error); }

.bg-primary { background-color: var(--color-primary-500); }
.bg-secondary { background-color: var(--color-secondary-500); }
.bg-neutral { background-color: var(--color-neutral-50); }
.bg-success { background-color: var(--color-semantic-success); }
.bg-warning { background-color: var(--color-semantic-warning); }
.bg-error { background-color: var(--color-semantic-error); }

/* Typography */
.font-heading { font-family: var(--font-family-heading); }
.font-body { font-family: var(--font-family-body); }
.font-mono { font-family: var(--font-family-mono); }

/* Spacing */
.space-xs { margin: var(--spacing-xs); }
.space-sm { margin: var(--spacing-sm); }
.space-md { margin: var(--spacing-md); }
.space-lg { margin: var(--spacing-lg); }
.space-xl { margin: var(--spacing-xl); }
`;
  }

  private extractCSSVariables(tokens: W3CDesignTokens, prefix = '--'): string {
    const variables: string[] = [];
    this.extractCSSVariablesRecursive(tokens, variables, prefix);
    return variables.join('\n');
  }

  private extractCSSVariablesRecursive(tokens: W3CDesignTokens, variables: string[], prefix: string): void {
    Object.entries(tokens).forEach(([key, value]) => {
      const cssKey = `${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      
      if (typeof value === 'object' && '$value' in value) {
        const token = value as any;
        variables.push(`  ${cssKey}: ${token.$value};`);
      } else if (typeof value === 'object' && !('$value' in value)) {
        this.extractCSSVariablesRecursive(value as W3CDesignTokens, variables, `${cssKey}-`);
      }
    });
  }

  private async copyStorybookScaffold(outputDir: string, tokens: W3CDesignTokens): Promise<void> {
    console.log('📚 Setting up Storybook scaffold...');
    
    const storybookDir = join(outputDir, '.storybook');
    await fs.mkdir(storybookDir, { recursive: true });
    
    // Read template files
    const templateDir = join(process.cwd(), 'templates', 'storybook');
    const mainTemplate = await fs.readFile(join(templateDir, 'main.ts'), 'utf8');
    const previewTemplate = await fs.readFile(join(templateDir, 'preview.ts'), 'utf8');
    const packageTemplate = await fs.readFile(join(templateDir, 'package.json'), 'utf8');
    
    // Replace template variables
    const replacements = {
      '{{projectName}}': 'generated-design-system',
      '{{principlesPath}}': '../src/stories/Principles.stories.mdx',
      '{{storiesPath}}': '../src',
      '{{tokensPath}}': '../tokens',
      '{{componentsPath}}': '../src/components',
      '{{tailwindConfigPath}}': '../tailwind.config.ts',
      '{{designTokensCssPath}}': '../tokens/design-tokens.css',
    };
    
    const processTemplate = (template: string): string => {
      return Object.entries(replacements).reduce(
        (content, [placeholder, replacement]) => content.replace(new RegExp(placeholder, 'g'), replacement),
        template
      );
    };
    
    // Write processed templates
    await fs.writeFile(join(storybookDir, 'main.ts'), processTemplate(mainTemplate), 'utf8');
    await fs.writeFile(join(storybookDir, 'preview.ts'), processTemplate(previewTemplate), 'utf8');
    await fs.writeFile(join(outputDir, 'package.json'), processTemplate(packageTemplate), 'utf8');
    
    console.log('✅ Storybook scaffold created');
  }
}
