// src/workflows/inspiration-to-system.ts
import { DesignTokens, DesignPrinciples, DesignInsight } from '../types/index.js';
import { AIDesignAnalyzer, InspirationInput } from '../ai/design-analyzer.js';
import { TokenGenerator } from '../generators/tokens.js';
import { PrincipleGenerator } from '../generators/principles.js';
import { promises as fs } from 'fs';
import path from 'path';

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

export class InspirationToSystemWorkflow {
  private aiAnalyzer: AIDesignAnalyzer;
  private tokenGenerator: TokenGenerator;
  private principleGenerator: PrincipleGenerator;
  
  constructor() {
    this.aiAnalyzer = new AIDesignAnalyzer();
    this.tokenGenerator = new TokenGenerator();
    this.principleGenerator = new PrincipleGenerator();
  }
  
  /**
   * Main entry point: Turn user inspiration into complete design system
   */
  async generateDesignSystem(inspiration: UserInspiration, projectPath: string): Promise<{
    tokens: DesignTokens;
    principles: DesignPrinciples;
    componentPlan: ComponentPlan;
    implementationGuide: string;
    insights: DesignInsight;
  }> {
    
    // Step 1: AI analysis of inspiration
    const analysisResult = await this.analyzeInspiration(inspiration);
    
    // Step 2: Generate comprehensive design tokens
    const tokens = await this.generateTokens(analysisResult.insights, inspiration);
    
    // Step 3: Infer design principles
    const principles = await this.inferPrinciples(analysisResult.insights, inspiration, tokens);
    
    // Step 4: Plan component library
    const componentPlan = await this.planComponents(tokens, principles);
    
    // Step 5: Create implementation roadmap
    const implementationGuide = await this.createImplementationGuide(
      tokens, 
      principles, 
      componentPlan
    );
    
    // Step 6: Generate project files
    await this.generateProjectFiles(projectPath, tokens, principles, componentPlan);
    
    return { 
      tokens, 
      principles, 
      componentPlan, 
      implementationGuide,
      insights: analysisResult.insights
    };
  }

  private async analyzeInspiration(inspiration: UserInspiration): Promise<{ insights: DesignInsight; analysis: string }> {
    // Determine the inspiration type and source
    let inspirationInput: InspirationInput;
    
    if (inspiration.imageUrl) {
      inspirationInput = {
        type: 'image',
        source: inspiration.imageUrl,
        context: this.buildContextString(inspiration)
      };
    } else if (inspiration.websiteUrl) {
      inspirationInput = {
        type: 'url',
        source: inspiration.websiteUrl,
        context: this.buildContextString(inspiration)
      };
    } else {
      inspirationInput = {
        type: 'text',
        source: inspiration.description || 'General design system',
        context: this.buildContextString(inspiration)
      };
    }

    const analysisResult = await this.aiAnalyzer.analyzeInspiration(inspirationInput);
    return {
      insights: analysisResult.insights,
      analysis: analysisResult.designRationale
    };
  }

  private buildContextString(inspiration: UserInspiration): string {
    const contextParts = [];
    
    if (inspiration.industryType) contextParts.push(`Industry: ${inspiration.industryType}`);
    if (inspiration.targetUsers) contextParts.push(`Target Users: ${inspiration.targetUsers}`);
    if (inspiration.brandKeywords) contextParts.push(`Brand Keywords: ${inspiration.brandKeywords.join(', ')}`);
    if (inspiration.stylePreferences) contextParts.push(`Style Preferences: ${inspiration.stylePreferences.join(', ')}`);
    if (inspiration.colorPreferences) contextParts.push(`Color Preferences: ${inspiration.colorPreferences.join(', ')}`);
    if (inspiration.accessibility) contextParts.push(`Accessibility Level: ${inspiration.accessibility}`);
    
    return contextParts.join('\n');
  }

  private async generateTokens(insights: DesignInsight, inspiration: UserInspiration): Promise<DesignTokens> {
    // Use the TokenGenerator to create W3C tokens from insights
    const w3cTokens = this.tokenGenerator.generateTokens(insights);
    
    // Convert to legacy format for backward compatibility
    const tokens = this.tokenGenerator.convertToLegacyFormat(w3cTokens);
    
    // Apply user preferences if provided
    if (inspiration.colorPreferences) {
      tokens.colors = { ...tokens.colors, ...this.parseColorPreferences(inspiration.colorPreferences) };
    }
    
    return tokens;
  }

  private parseColorPreferences(colorPreferences: string[]): Record<string, string> {
    const colors: Record<string, string> = {};
    
    colorPreferences.forEach((color, index) => {
      // If it's a hex color, use it directly
      if (color.startsWith('#')) {
        colors[`preference-${index + 1}`] = color;
      } else {
        // Try to map named colors to hex values
        const namedColors: Record<string, string> = {
          'red': '#ef4444',
          'blue': '#3b82f6',
          'green': '#10b981',
          'yellow': '#f59e0b',
          'purple': '#8b5cf6',
          'pink': '#ec4899',
          'orange': '#f97316',
          'gray': '#6b7280',
          'black': '#000000',
          'white': '#ffffff'
        };
        
        const hexColor = namedColors[color.toLowerCase()];
        if (hexColor) {
          colors[color.toLowerCase()] = hexColor;
        }
      }
    });
    
    return colors;
  }

  private async inferPrinciples(insights: DesignInsight, inspiration: UserInspiration, tokens: DesignTokens): Promise<DesignPrinciples> {
    // Use the PrincipleGenerator to create principles from insights
    const principles = this.principleGenerator.generatePrinciples(insights);
    
    // Override brand identity if user provided specific information
    if (inspiration.brandKeywords && inspiration.brandKeywords.length > 0) {
      principles.brandIdentity = inspiration.brandKeywords.join(', ');
    }
    
    // Override target audience if user provided specific information
    if (inspiration.targetUsers) {
      principles.targetAudience = inspiration.targetUsers;
    }
    
    return principles;
  }

  private async planComponents(tokens: DesignTokens, principles: DesignPrinciples): Promise<ComponentPlan> {
    const prompt = `Given these design tokens and principles, plan a component library:

TOKENS: ${JSON.stringify(tokens, null, 2)}
PRINCIPLES: ${JSON.stringify(principles, null, 2)}

Create a development plan that:
- Prioritizes essential components first
- Groups components by complexity (atoms → molecules → organisms)
- Considers the brand personality in component behavior
- Ensures accessibility compliance
- Maps components to design tokens appropriately

Output as structured ComponentPlan JSON.`;

    const response = await this.callLLM(prompt);
    return JSON.parse(response);
  }

  private async createImplementationGuide(
    tokens: DesignTokens, 
    principles: DesignPrinciples, 
    plan: ComponentPlan
  ): Promise<string> {
    return `# Implementation Guide

## Quick Start
1. Run the generated Storybook: \`npm run storybook\`
2. Review the style showcase to understand your design tokens
3. Begin with Phase 1 components (atoms)
4. Use the generated component prompts for implementation

## Design System Overview
Your design system embodies: ${principles.coreValues.join(', ')}

## Component Priority
${plan.phases.map((phase, i) => 
  `**Phase ${i + 1}:** ${phase.components.join(', ')}`
).join('\n')}

## Token Usage Guidelines
- Primary actions: Use primary-500, primary-600 for hover
- Text hierarchy: Use gray-900 for headings, gray-700 for body
- Spacing: Follow the ${Object.keys(tokens.spacing).length}-step spacing scale

## Next Steps
Use the MCP tools to generate specific component implementation prompts!`;
  }

  private async callLLM(prompt: string): Promise<string> {
    // Your LLM integration here
    throw new Error('LLM service not configured');
  }

  private async generateProjectFiles(
    projectPath: string,
    tokens: DesignTokens,
    principles: DesignPrinciples,
    componentPlan: ComponentPlan
  ): Promise<void> {
    // Create directory structure
    await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'tokens'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'styles'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'stories'), { recursive: true });
    
    // Generate tokens.json
    await fs.writeFile(
      path.join(projectPath, 'src', 'tokens', 'tokens.json'),
      JSON.stringify(tokens, null, 2)
    );
    
    // Generate principles.md
    const principlesMarkdown = this.principleGenerator.generateMarkdown(principles);
    await fs.writeFile(
      path.join(projectPath, 'PRINCIPLES.md'),
      principlesMarkdown
    );
    
    // Generate Tailwind CSS configuration
    await fs.writeFile(
      path.join(projectPath, 'src', 'styles', 'tokens.css'),
      this.generateTailwindTokens(tokens)
    );
    
    // Generate component plan
    await fs.writeFile(
      path.join(projectPath, 'COMPONENT_PLAN.md'),
      this.generateComponentPlanMarkdown(componentPlan)
    );
    
    // Generate package.json
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify({
        name: 'my-design-system',
        version: '1.0.0',
        description: 'Generated design system',
        main: 'src/index.ts',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          storybook: 'storybook dev -p 6006',
          'build-storybook': 'storybook build'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@storybook/react': '^8.0.0',
          '@storybook/react-vite': '^8.0.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          typescript: '^5.0.0',
          vite: '^5.0.0'
        }
      }, null, 2)
    );
  }

  private generateTailwindTokens(tokens: DesignTokens): string {
    const cssLines = ['@theme {'];
    
    // Colors
    Object.entries(tokens.colors).forEach(([key, value]) => {
      cssLines.push(`  --color-${key}: ${value};`);
    });
    
    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      cssLines.push(`  --spacing-${key}: ${value};`);
    });
    
    // Border radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      cssLines.push(`  --border-radius-${key}: ${value};`);
    });
    
    // Typography
    tokens.typography.fonts.forEach((font, index) => {
      cssLines.push(`  --font-${index === 0 ? 'primary' : 'secondary'}: ${font};`);
    });
    
    Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
      cssLines.push(`  --font-size-${key}: ${value};`);
    });
    
    Object.entries(tokens.typography.weights).forEach(([key, value]) => {
      cssLines.push(`  --font-weight-${key}: ${value};`);
    });
    
    cssLines.push('}');
    return cssLines.join('\n');
  }

  private generateComponentPlanMarkdown(componentPlan: ComponentPlan): string {
    const sections = [
      '# Component Implementation Plan',
      '',
      `**Total Components:** ${componentPlan.totalComponents}`,
      `**Estimated Duration:** ${componentPlan.estimatedDuration}`,
      '',
      '## Implementation Phases',
      ''
    ];
    
    componentPlan.phases.forEach((phase, index) => {
      sections.push(`### Phase ${index + 1}: ${phase.name}`);
      sections.push(`**Duration:** ${phase.duration}`);
      sections.push(`**Priority:** ${phase.priority}`);
      sections.push('');
      sections.push('**Components:**');
      phase.components.forEach(component => {
        sections.push(`- ${component}`);
      });
      sections.push('');
    });
    
    return sections.join('\n');
  }
}

interface ComponentPlan {
  phases: Array<{
    name: string;
    duration: string;
    components: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  totalComponents: number;
  estimatedDuration: string;
}