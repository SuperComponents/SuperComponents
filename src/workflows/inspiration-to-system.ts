// src/workflows/inspiration-to-system.ts
import {
  DesignTokens,
  DesignPrinciples,
  DesignInsight,
} from '../types/index.js'
import { AIDesignAnalyzer, InspirationInput } from '../ai/design-analyzer.js'
import { TokenGenerator } from '../generators/tokens.js'
import { PrincipleGenerator } from '../generators/principles.js'
import { TailwindConfigGenerator } from '../generators/tailwind-config.js'
import { WCAGValidator } from '../generators/wcag-validator.js'
import { ComponentFactory } from '../generators/component-factory.js'
import { promises as fs } from 'fs'
import path from 'path'

export interface UserInspiration {
  // Visual inspiration
  imageUrl?: string
  websiteUrl?: string

  // Textual inspiration
  description?: string
  brandKeywords?: string[]
  industryType?: string
  targetUsers?: string

  // Preferences
  colorPreferences?: string[]
  stylePreferences?: (
    | 'modern'
    | 'classic'
    | 'playful'
    | 'professional'
    | 'minimalist'
  )[]
  accessibility?: 'basic' | 'enhanced' | 'enterprise'
}

export interface WorkflowOptions {
  bypassA11yFail?: boolean
}

export class InspirationToSystemWorkflow {
  private aiAnalyzer: AIDesignAnalyzer
  private tokenGenerator: TokenGenerator
  private principleGenerator: PrincipleGenerator
  private tailwindConfigGenerator: TailwindConfigGenerator
  private wcagValidator: WCAGValidator
  private componentFactory: ComponentFactory

  constructor() {
    this.aiAnalyzer = new AIDesignAnalyzer()
    this.tokenGenerator = new TokenGenerator()
    this.principleGenerator = new PrincipleGenerator()
    this.tailwindConfigGenerator = new TailwindConfigGenerator()
    this.wcagValidator = new WCAGValidator()
    this.componentFactory = new ComponentFactory({ projectPath: '' }) // Will be set later
  }

  /**
   * Main entry point: Turn user inspiration into complete design system
   */
  async generateDesignSystem(
    inspiration: UserInspiration,
    projectPath: string,
    options: WorkflowOptions = {}
  ): Promise<{
    tokens: DesignTokens
    principles: DesignPrinciples
    componentPlan: ComponentPlan
    implementationGuide: string
    insights: DesignInsight
  }> {
    // Step 1: AI analysis of inspiration
    const analysisResult = await this.analyzeInspiration(inspiration)

    // Step 2: Generate comprehensive design tokens
    const tokens = await this.generateTokens(
      analysisResult.insights,
      inspiration
    )

    // Step 3: Infer design principles
    const principles = await this.inferPrinciples(
      analysisResult.insights,
      inspiration,
      tokens
    )

    // Step 4: Plan component library
    const componentPlan = await this.planComponents(tokens, principles)

    // Step 5: Create implementation roadmap
    const implementationGuide = await this.createImplementationGuide(
      tokens,
      principles,
      componentPlan
    )

    // Step 6: Generate project files
    await this.generateProjectFiles(
      projectPath,
      tokens,
      principles,
      componentPlan,
      analysisResult.insights,  // Pass original insights to avoid lossy conversion
      options
    )

    return {
      tokens,
      principles,
      componentPlan,
      implementationGuide,
      insights: analysisResult.insights,
    }
  }

  private async analyzeInspiration(
    inspiration: UserInspiration
  ): Promise<{ insights: DesignInsight; analysis: string }> {
    // Determine the inspiration type and source
    let inspirationInput: InspirationInput

    if (inspiration.imageUrl) {
      inspirationInput = {
        type: 'image',
        source: inspiration.imageUrl,
        context: this.buildContextString(inspiration),
      }
    } else if (inspiration.websiteUrl) {
      inspirationInput = {
        type: 'url',
        source: inspiration.websiteUrl,
        context: this.buildContextString(inspiration),
      }
    } else {
      inspirationInput = {
        type: 'text',
        source: inspiration.description || 'General design system',
        context: this.buildContextString(inspiration),
      }
    }

    const analysisResult =
      await this.aiAnalyzer.analyzeInspiration(inspirationInput)
    return {
      insights: analysisResult.insights,
      analysis: analysisResult.designRationale,
    }
  }

  private buildContextString(inspiration: UserInspiration): string {
    const contextParts = []

    if (inspiration.industryType)
      contextParts.push(`Industry: ${inspiration.industryType}`)
    if (inspiration.targetUsers)
      contextParts.push(`Target Users: ${inspiration.targetUsers}`)
    if (inspiration.brandKeywords)
      contextParts.push(
        `Brand Keywords: ${inspiration.brandKeywords.join(', ')}`
      )
    if (inspiration.stylePreferences)
      contextParts.push(
        `Style Preferences: ${inspiration.stylePreferences.join(', ')}`
      )
    if (inspiration.colorPreferences)
      contextParts.push(
        `Color Preferences: ${inspiration.colorPreferences.join(', ')}`
      )
    if (inspiration.accessibility)
      contextParts.push(`Accessibility Level: ${inspiration.accessibility}`)

    return contextParts.join('\n')
  }

  private async generateTokens(
    insights: DesignInsight,
    inspiration: UserInspiration
  ): Promise<DesignTokens> {
    // Use the TokenGenerator to create W3C tokens from insights
    const w3cTokens = this.tokenGenerator.generateTokens(insights)

    // Convert to legacy format for backward compatibility
    const tokens = this.tokenGenerator.convertToLegacyFormat(w3cTokens)

    // Apply user preferences if provided
    if (inspiration.colorPreferences) {
      tokens.colors = {
        ...tokens.colors,
        ...this.parseColorPreferences(inspiration.colorPreferences),
      }
    }

    return tokens
  }

  private parseColorPreferences(
    colorPreferences: string[]
  ): Record<string, string> {
    const colors: Record<string, string> = {}

    colorPreferences.forEach((color, index) => {
      // If it's a hex color, use it directly
      if (color.startsWith('#')) {
        colors[`preference-${index + 1}`] = color
      } else {
        // Try to map named colors to hex values
        const namedColors: Record<string, string> = {
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#10b981',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
          pink: '#ec4899',
          orange: '#f97316',
          gray: '#6b7280',
          black: '#000000',
          white: '#ffffff',
        }

        const hexColor = namedColors[color.toLowerCase()]
        if (hexColor) {
          colors[color.toLowerCase()] = hexColor
        }
      }
    })

    return colors
  }

  private async inferPrinciples(
    insights: DesignInsight,
    inspiration: UserInspiration,
    tokens: DesignTokens
  ): Promise<DesignPrinciples> {
    // Use the PrincipleGenerator to create principles from insights
    const principles = this.principleGenerator.generatePrinciples(insights)

    // Override brand identity if user provided specific information
    if (inspiration.brandKeywords && inspiration.brandKeywords.length > 0) {
      principles.brandIdentity = inspiration.brandKeywords.join(', ')
    }

    // Override target audience if user provided specific information
    if (inspiration.targetUsers) {
      principles.targetAudience = inspiration.targetUsers
    }

    return principles
  }

  private async planComponents(
    tokens: DesignTokens,
    principles: DesignPrinciples
  ): Promise<ComponentPlan> {
    const prompt = `Given these design tokens and principles, plan a component library:

TOKENS: ${JSON.stringify(tokens, null, 2)}
PRINCIPLES: ${JSON.stringify(principles, null, 2)}

Create a development plan that:
- Prioritizes essential components first
- Groups components by complexity (atoms → molecules → organisms)
- Considers the brand personality in component behavior
- Ensures accessibility compliance
- Maps components to design tokens appropriately

Output as structured ComponentPlan JSON.`

    const response = await this.callLLM(prompt)
    return JSON.parse(response)
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
${plan.phases
  .map((phase, i) => `**Phase ${i + 1}:** ${phase.components.join(', ')}`)
  .join('\n')}

## Token Usage Guidelines
- Primary actions: Use primary-500, primary-600 for hover
- Text hierarchy: Use gray-900 for headings, gray-700 for body
- Spacing: Follow the ${Object.keys(tokens.spacing).length}-step spacing scale

## Next Steps
Use the MCP tools to generate specific component implementation prompts!`
  }

  private async callLLM(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      // Return a default component plan when LLM is not configured
      return JSON.stringify({
        phases: [
          {
            name: 'Atoms',
            duration: '2-3 weeks',
            components: ['Button', 'Input', 'Card', 'Modal'],
            priority: 'high'
          },
          {
            name: 'Molecules',
            duration: '3-4 weeks',
            components: ['SearchBox', 'Navigation', 'Form'],
            priority: 'medium'
          }
        ],
        totalComponents: 7,
        estimatedDuration: '5-7 weeks'
      })
    }
    // Your LLM integration here
    throw new Error('LLM service not configured')
  }

  private async generateProjectFiles(
    projectPath: string,
    tokens: DesignTokens,
    principles: DesignPrinciples,
    componentPlan: ComponentPlan,
    insights: DesignInsight,
    options: WorkflowOptions = {}
  ): Promise<void> {
    // Create directory structure
    await fs.mkdir(path.join(projectPath, 'tokens'), { recursive: true })
    await fs.mkdir(path.join(projectPath, 'design'), { recursive: true })
    await fs.mkdir(path.join(projectPath, 'src'), { recursive: true })
    await fs.mkdir(path.join(projectPath, 'src', 'components'), {
      recursive: true,
    })
    await fs.mkdir(path.join(projectPath, 'src', 'tokens'), { recursive: true })
    await fs.mkdir(path.join(projectPath, 'src', 'styles'), { recursive: true })
    await fs.mkdir(path.join(projectPath, 'stories'), { recursive: true })

    // Generate W3C design tokens from the original insights and write to tokens/design-tokens.json
    // Note: We use the original insights to avoid lossy round-trip conversion
    const w3cTokens = this.tokenGenerator.generateTokens(insights)
    await fs.writeFile(
      path.join(projectPath, 'tokens', 'design-tokens.json'),
      JSON.stringify(w3cTokens, null, 2)
    )

    // Generate Tailwind configuration and write to /tailwind.config.ts
    const tailwindConfig =
      this.tailwindConfigGenerator.generateConfig(w3cTokens)
    await fs.writeFile(
      path.join(projectPath, 'tailwind.config.ts'),
      tailwindConfig
    )

    // Generate principles markdown and write to design/PRINCIPLES.md
    const principlesMarkdown =
      this.principleGenerator.generateMarkdown(principles)
    await fs.writeFile(
      path.join(projectPath, 'design', 'PRINCIPLES.md'),
      principlesMarkdown
    )

    // Generate accessibility report and write to tokens/accessibility-report.md
    const accessibilityReport =
      this.wcagValidator.generateAccessibilityReport(w3cTokens)
    const passRate = this.calculatePassRate(w3cTokens)
    console.log(`Accessibility validation: ${passRate.toFixed(1)}% pass rate`)
    
    // Enforce WCAG standards unless bypassed
    if (passRate < 90 && !options.bypassA11yFail) {
      throw new Error(
        `❌ Accessibility validation failed: ${passRate.toFixed(1)}% pass rate (minimum 90% required)\n` +
        `Use --no-a11y-fail flag to bypass this check (not recommended for production)`
      )
    }
    
    if (options.bypassA11yFail && passRate < 90) {
      console.log(`⚠️  Warning: Accessibility validation bypassed. Current pass rate: ${passRate.toFixed(1)}%`)
    }
    await fs.writeFile(
      path.join(projectPath, 'tokens', 'accessibility-report.md'),
      accessibilityReport
    )

    // Generate component scaffolding
    const componentFactory = new ComponentFactory({ projectPath })
    await componentFactory.scaffoldComponents()

    // Generate Tailwind CSS configuration
    await fs.writeFile(
      path.join(projectPath, 'src', 'styles', 'tokens.css'),
      this.generateTailwindTokens(tokens)
    )

    // Generate component plan
    await fs.writeFile(
      path.join(projectPath, 'COMPONENT_PLAN.md'),
      this.generateComponentPlanMarkdown(componentPlan)
    )

    // Generate package.json
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(
        {
          name: 'my-design-system',
          version: '1.0.0',
          description: 'Generated design system',
          main: 'src/index.ts',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            storybook: 'storybook dev -p 6006',
            'build-storybook': 'storybook build',
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@storybook/react': '^8.0.0',
            '@storybook/react-vite': '^8.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            typescript: '^5.0.0',
            vite: '^5.0.0',
          },
        },
        null,
        2
      )
    )
  }

  private generateTailwindTokens(tokens: DesignTokens): string {
    const cssLines = ['@theme {']

    // Colors
    Object.entries(tokens.colors).forEach(([key, value]) => {
      cssLines.push(`  --color-${key}: ${value};`)
    })

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      cssLines.push(`  --spacing-${key}: ${value};`)
    })

    // Border radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      cssLines.push(`  --border-radius-${key}: ${value};`)
    })

    // Typography
    tokens.typography.fonts.forEach((font, index) => {
      cssLines.push(
        `  --font-${index === 0 ? 'primary' : 'secondary'}: ${font};`
      )
    })

    Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
      cssLines.push(`  --font-size-${key}: ${value};`)
    })

    Object.entries(tokens.typography.weights).forEach(([key, value]) => {
      cssLines.push(`  --font-weight-${key}: ${value};`)
    })

    cssLines.push('}')
    return cssLines.join('\n')
  }

  private generateComponentPlanMarkdown(componentPlan: ComponentPlan): string {
    const sections = [
      '# Component Implementation Plan',
      '',
      `**Total Components:** ${componentPlan.totalComponents}`,
      `**Estimated Duration:** ${componentPlan.estimatedDuration}`,
      '',
      '## Implementation Phases',
      '',
    ]

    componentPlan.phases.forEach((phase, index) => {
      sections.push(`### Phase ${index + 1}: ${phase.name}`)
      sections.push(`**Duration:** ${phase.duration}`)
      sections.push(`**Priority:** ${phase.priority}`)
      sections.push('')
      sections.push('**Components:**')
      phase.components.forEach((component) => {
        sections.push(`- ${component}`)
      })
      sections.push('')
    })

    return sections.join('\n')
  }
  
  private extractDesignInsight(tokens: DesignTokens): DesignInsight {
    // Create a basic DesignInsight from legacy tokens
    return {
      imageryPalette: Object.values(tokens.colors).slice(0, 8),
      typographyFamilies: tokens.typography.fonts,
      spacingScale: Object.values(tokens.spacing).map(s => parseInt(s.replace('px', '').replace('rem', ''))),
      uiDensity: 'regular',
      brandKeywords: [],
      supportingReferences: []
    };
  }
  
  private calculatePassRate(tokens: any): number {
    const results = this.wcagValidator.validateTokens(tokens);
    const passed = results.filter(r => r.passes).length;
    const total = results.length;
    return total > 0 ? (passed / total) * 100 : 100;
  }
}

interface ComponentPlan {
  phases: Array<{
    name: string
    duration: string
    components: string[]
    priority: 'high' | 'medium' | 'low'
  }>
  totalComponents: number
  estimatedDuration: string
}
