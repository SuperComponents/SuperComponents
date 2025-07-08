import { OpenAI } from 'openai';
import { DesignInsight, DesignTokens, DesignPrinciples } from '../types/index.js';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

const DesignInsightSchema = z.object({
  imageryPalette: z.array(z.string()).max(8).default([]),
  typographyFamilies: z.array(z.string()).default([]),
  spacingScale: z.array(z.number()).default([]),
  uiDensity: z.enum(['compact', 'regular', 'spacious']).default('regular'),
  brandKeywords: z.array(z.string()).default([]),
  supportingReferences: z.array(z.string()).default([])
});

export interface InspirationInput {
  type: 'image' | 'url' | 'text';
  source: string;
  context?: string;
}

export interface AIAnalysisResult {
  extractedTokens: DesignTokens;
  inferredPrinciples: DesignPrinciples;
  designRationale: string;
  recommendations: string[];
  insights: DesignInsight;
}

export class AIDesignAnalyzer {
  private openai: OpenAI;
  private insightsPath: string;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    this.insightsPath = '/tmp/insights.json';
  }

  async analyzeInspiration(input: InspirationInput): Promise<AIAnalysisResult> {
    const insights = await this.extractDesignInsights(input);
    const analysisResult = await this.generateDesignSystemFromInsights(insights, input);
    
    await this.persistInsights(insights, input);
    
    return {
      ...analysisResult,
      insights
    };
  }

  private async extractDesignInsights(input: InspirationInput): Promise<DesignInsight> {
    const prompt = this.buildInsightsPrompt(input);
    
    try {
      const response = await this.callVisionAPI(prompt, input);
      const insights = this.parseInsightsResponse(response);
      
      const parsedInsights = DesignInsightSchema.parse(insights);
      return parsedInsights as DesignInsight;
    } catch (error) {
      throw new Error(`Failed to extract design insights: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildInsightsPrompt(input: InspirationInput): string {
    return `You are an expert design system architect. Analyze the provided inspiration and extract specific design insights.

Your task is to return a JSON object with the following structure:
{
  "imageryPalette": ["#hex1", "#hex2", ...], // Maximum 8 hex colors
  "typographyFamilies": ["Font Name 1", "Font Name 2", ...], // Font family names
  "spacingScale": [4, 8, 12, 16, 24, 32, 48, 64], // Spacing values in pixels
  "uiDensity": "compact" | "regular" | "spacious", // Overall UI density
  "brandKeywords": ["keyword1", "keyword2", ...], // Brand personality keywords
  "supportingReferences": ["reference1", "reference2", ...] // Supporting descriptions
}

Focus on extracting concrete, implementable design insights. Be specific with color values and typography choices.

${input.context ? `Additional context: ${input.context}` : ''}

Return only the JSON object, no additional text.`;
  }

  private async callVisionAPI(prompt: string, input: InspirationInput): Promise<string> {
    const messages: any[] = [
      {
        role: 'user',
        content: input.type === 'image' 
          ? [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: input.source,
                  detail: 'high'
                }
              }
            ]
          : [{ type: 'text', text: `${prompt}\n\n${input.type === 'url' ? 'URL:' : 'Description:'} ${input.source}` }]
      }
    ];

    const response = await this.openai.chat.completions.create({
      model: input.type === 'image' ? 'gpt-4o' : 'gpt-4',
      messages,
      max_tokens: 1000,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || '';
  }

  private parseInsightsResponse(response: string): DesignInsight {
    try {
      // Extract JSON from response if it's wrapped in text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse insights response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateDesignSystemFromInsights(
    insights: DesignInsight, 
    input: InspirationInput
  ): Promise<Omit<AIAnalysisResult, 'insights'>> {
    // Convert insights to design tokens
    const extractedTokens: DesignTokens = {
      colors: this.convertPaletteToTokens(insights.imageryPalette),
      typography: this.convertTypographyToTokens(insights.typographyFamilies),
      spacing: this.convertSpacingToTokens(insights.spacingScale),
      borderRadius: this.generateBorderRadiusTokens(insights.uiDensity),
      shadows: this.generateShadowTokens(insights.uiDensity)
    };

    // Generate design principles
    const inferredPrinciples: DesignPrinciples = {
      brandIdentity: insights.brandKeywords.join(', '),
      targetAudience: this.inferTargetAudience(insights.brandKeywords),
      coreValues: insights.brandKeywords.slice(0, 3),
      designGoals: [
        `Maintain ${insights.uiDensity} UI density`,
        'Ensure visual consistency across components',
        'Support accessibility and usability'
      ]
    };

    return {
      extractedTokens,
      inferredPrinciples,
      designRationale: this.generateDesignRationale(insights),
      recommendations: this.generateRecommendations(insights)
    };
  }

  private convertPaletteToTokens(palette: string[]): Record<string, string> {
    const tokens: Record<string, string> = {};
    
    palette.forEach((color, index) => {
      if (index === 0) tokens.primary = color;
      else if (index === 1) tokens.secondary = color;
      else if (index === 2) tokens.accent = color;
      else tokens[`color-${index + 1}`] = color;
    });

    // Add common semantic colors if not present
    if (!tokens.primary) tokens.primary = '#3B82F6';
    if (!tokens.secondary) tokens.secondary = '#6B7280';
    if (!tokens.background) tokens.background = '#FFFFFF';
    if (!tokens.text) tokens.text = '#111827';

    return tokens;
  }

  private convertTypographyToTokens(families: string[]): DesignTokens['typography'] {
    return {
      fonts: families.length > 0 ? families : ['Inter', 'system-ui', 'sans-serif'],
      sizes: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      weights: {
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700
      },
      lineHeights: {
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2'
      }
    };
  }

  private convertSpacingToTokens(scale: number[]): Record<string, string> {
    const tokens: Record<string, string> = {};
    
    scale.forEach((value, index) => {
      const key = index === 0 ? 'xs' : 
                  index === 1 ? 'sm' : 
                  index === 2 ? 'md' : 
                  index === 3 ? 'lg' : 
                  index === 4 ? 'xl' : 
                  index === 5 ? '2xl' : 
                  index === 6 ? '3xl' : 
                  index === 7 ? '4xl' : `space-${index + 1}`;
      tokens[key] = `${value}px`;
    });

    return tokens;
  }

  private generateBorderRadiusTokens(density: DesignInsight['uiDensity']): Record<string, string> {
    const baseRadius = density === 'compact' ? 2 : density === 'regular' ? 4 : 8;
    
    return {
      'none': '0',
      'sm': `${baseRadius}px`,
      'md': `${baseRadius * 2}px`,
      'lg': `${baseRadius * 3}px`,
      'xl': `${baseRadius * 4}px`,
      'full': '9999px'
    };
  }

  private generateShadowTokens(density: DesignInsight['uiDensity']): Record<string, string> {
    const shadowIntensity = density === 'compact' ? 0.5 : density === 'regular' ? 1 : 1.5;
    
    return {
      'sm': `0 1px 2px 0 rgba(0, 0, 0, ${0.05 * shadowIntensity})`,
      'md': `0 4px 6px -1px rgba(0, 0, 0, ${0.1 * shadowIntensity})`,
      'lg': `0 10px 15px -3px rgba(0, 0, 0, ${0.1 * shadowIntensity})`,
      'xl': `0 20px 25px -5px rgba(0, 0, 0, ${0.1 * shadowIntensity})`
    };
  }

  private inferTargetAudience(keywords: string[]): string {
    const professionalKeywords = ['professional', 'corporate', 'business', 'enterprise'];
    const creativeKeywords = ['creative', 'artistic', 'design', 'innovative'];
    const casualKeywords = ['casual', 'friendly', 'approachable', 'fun'];

    if (keywords.some(k => professionalKeywords.includes(k.toLowerCase()))) {
      return 'Business professionals and enterprise users';
    } else if (keywords.some(k => creativeKeywords.includes(k.toLowerCase()))) {
      return 'Creative professionals and designers';
    } else if (keywords.some(k => casualKeywords.includes(k.toLowerCase()))) {
      return 'General consumers and casual users';
    }

    return 'General audience';
  }

  private generateDesignRationale(insights: DesignInsight): string {
    return `The design system reflects ${insights.brandKeywords.join(', ')} characteristics through a ${insights.uiDensity} interface density. The color palette of ${insights.imageryPalette.length} colors provides sufficient contrast while maintaining visual harmony. Typography choices support readability and brand personality. The spacing scale ensures consistent rhythm throughout the interface.`;
  }

  private generateRecommendations(insights: DesignInsight): string[] {
    const recommendations = [
      `Maintain ${insights.uiDensity} spacing throughout all components`,
      `Use the ${insights.imageryPalette.length}-color palette consistently across the system`,
      'Implement proper contrast ratios for accessibility compliance'
    ];

    if (insights.typographyFamilies.length > 1) {
      recommendations.push('Consider using primary font for headings and secondary for body text');
    }

    if (insights.brandKeywords.includes('modern') || insights.brandKeywords.includes('minimal')) {
      recommendations.push('Embrace white space and clean lines in component design');
    }

    return recommendations;
  }

  private async persistInsights(insights: DesignInsight, input: InspirationInput): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.insightsPath), { recursive: true });
      
      const persistedData = {
        insights,
        input,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      await fs.writeFile(this.insightsPath, JSON.stringify(persistedData, null, 2));
    } catch (error) {
      console.warn(`Failed to persist insights: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loadPersistedInsights(): Promise<DesignInsight | null> {
    try {
      const data = await fs.readFile(this.insightsPath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.insights;
    } catch (error) {
      return null;
    }
  }
}

// Enhanced extraction tool that uses AI
export async function aiExtractDesignTokens(args: {
  source: string;
  sourceType: 'url' | 'image' | 'text';
  context?: string;
}): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean; metadata?: any }> {
  try {
    const analyzer = new AIDesignAnalyzer();
    
    const result = await analyzer.analyzeInspiration({
      type: args.sourceType,
      source: args.source,
      context: args.context
    });

    // Generate Tailwind v4 CSS from extracted tokens
    const cssOutput = generateTailwindV4CSS(result.extractedTokens);
    
    // Create comprehensive analysis report
    const report = `✅ AI Design Analysis Complete!

## Inspiration Source
${args.sourceType}: ${args.source}

## Design Insights
- **Palette:** ${result.insights.imageryPalette.join(', ')}
- **Typography:** ${result.insights.typographyFamilies.join(', ')}
- **Spacing Scale:** ${result.insights.spacingScale.join(', ')}px
- **UI Density:** ${result.insights.uiDensity}
- **Brand Keywords:** ${result.insights.brandKeywords.join(', ')}

## Extracted Design Tokens
- ${Object.keys(result.extractedTokens.colors).length} colors
- ${result.extractedTokens.typography.fonts.length} font families
- ${Object.keys(result.extractedTokens.spacing).length} spacing values

## Inferred Design Principles
**Brand Identity:** ${result.inferredPrinciples.brandIdentity}
**Target Audience:** ${result.inferredPrinciples.targetAudience}
**Core Values:** ${result.inferredPrinciples.coreValues.join(', ')}

## Design Rationale
${result.designRationale}

## Recommendations
${result.recommendations.map(r => `• ${r}`).join('\n')}

## Generated Tailwind v4 Theme
\`\`\`css
${cssOutput}
\`\`\`

Ready to generate style showcase and begin component implementation!`;

    return {
      content: [{ type: "text", text: report }],
      metadata: { analysisResult: result }
    };

  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ AI analysis failed: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}

function generateTailwindV4CSS(tokens: DesignTokens): string {
  const cssLines = [
    '@theme {',
    '  --color-primary: ' + tokens.colors.primary + ';',
    '  --color-secondary: ' + tokens.colors.secondary + ';',
    '  --color-background: ' + tokens.colors.background + ';',
    '  --color-text: ' + tokens.colors.text + ';'
  ];

  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssLines.push(`  --spacing-${key}: ${value};`);
  });

  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssLines.push(`  --border-radius-${key}: ${value};`);
  });

  cssLines.push('}');
  return cssLines.join('\n');
}
