// src/workflows/inspiration-to-system.ts
import { DesignTokens, DesignInsight } from '../types/index.js';
import { AIDesignAnalyzer, InspirationInput } from '../ai/design-analyzer.js';
import { TokenGenerator, W3CDesignTokens } from '../generators/tokens.js';
import { generatePrinciples, writePrinciplesToFiles, PrinciplesOutput } from '../generators/principles.js';
import { ComponentFactory } from '../generators/components/factory.js';
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
  metadata: {
    timestamp: string;
    version: string;
    source: InspirationInput;
  };
}

export class InspirationToSystemWorkflow {
  private analyzer: AIDesignAnalyzer;
  private tokenGenerator: TokenGenerator;
  
  constructor() {
    this.analyzer = new AIDesignAnalyzer();
    this.tokenGenerator = new TokenGenerator();
  }
  
  /**
   * Main entry point: Turn user inspiration into complete design system
   */
  async generateDesignSystem(inspiration: UserInspiration, outputDir: string): Promise<GeneratedDesignSystem> {
    console.log('🚀 Starting inspiration-to-system workflow...');
    
    // Step 1: AI analysis of inspiration using AIDesignAnalyzer
    const inspirationInput = this.convertToInspirationInput(inspiration);
    const analysisResult = await this.analyzer.analyzeInspiration(inspirationInput);
    
    // Step 2: Generate W3C tokens and Tailwind config using TokenGenerator
    const w3cTokens = this.tokenGenerator.generateTokens(analysisResult.insights);
    const legacyTokens = this.tokenGenerator.convertToLegacyFormat(w3cTokens);
    
    // Step 3: Generate design principles from insights
    const principlesOutput = await generatePrinciples(analysisResult.insights);
    await writePrinciplesToFiles(principlesOutput);
    
    // Step 4: Generate components using ComponentFactory
    const componentFactory = new ComponentFactory({
      outputDir: join(outputDir, 'src', 'components'),
      generateTests: true,
      generateStories: true,
      includeTailwind: true
    });
    await componentFactory.generate(w3cTokens);
    
    // Step 5: Write artifacts to disk
    await this.writeArtifacts(outputDir, w3cTokens, legacyTokens, principlesOutput, analysisResult.insights, inspirationInput);
    
    const result: GeneratedDesignSystem = {
      tokens: w3cTokens,
      legacyTokens,
      principles: principlesOutput,
      insights: analysisResult.insights,
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
    source: InspirationInput
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
    
    // Generate and write Tailwind config
    const tailwindConfig = this.generateTailwindConfig(w3cTokens);
    await fs.writeFile(
      join(outputDir, 'tailwind.config.ts'),
      tailwindConfig,
      'utf8'
    );
    
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
        'tailwind.config.ts',
        'src/components/Button/',
        'src/components/Input/',
        'src/components/Card/',
        'src/components/Modal/',
        'src/stories/Principles.stories.mdx'
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
}
