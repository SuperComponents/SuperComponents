#!/usr/bin/env node

import { program } from 'commander'
import { promises as fs } from 'fs'
import path from 'path'
import {
  InspirationToSystemWorkflow,
  UserInspiration,
} from './workflows/inspiration-to-system.js'
import { AIDesignAnalyzer } from './ai/design-analyzer.js'
import { TokenGenerator } from './generators/tokens.js'
import { PrincipleGenerator } from './generators/principles.js'

interface CLIOptions {
  image?: string
  url?: string
  description?: string
  brand?: string
  industry?: string
  audience?: string
  style?: string
  colors?: string
  accessibility?: 'basic' | 'enhanced' | 'enterprise'
  output?: string
  input?: string
  mockAi?: boolean
  bypassA11yFail?: boolean
}

async function main() {
  program
    .name('inspiration-to-system')
    .description('Generate a complete design system from inspiration')
    .version('1.0.0')

  program
    .option('--image <url>', 'Image URL for visual inspiration')
    .option('--url <url>', 'Website URL for design inspiration')
    .option('--description <text>', 'Text description of desired design')
    .option('--input <file>', 'JSON file with inspiration data')
    .option('--brand <keywords>', 'Brand keywords (comma-separated)')
    .option(
      '--industry <type>',
      'Industry type (e.g., tech, finance, creative)'
    )
    .option('--audience <description>', 'Target audience description')
    .option(
      '--style <preferences>',
      'Style preferences (comma-separated: modern, classic, playful, professional, minimalist)'
    )
    .option(
      '--colors <preferences>',
      'Color preferences (comma-separated hex codes or names)'
    )
    .option(
      '--accessibility <level>',
      'Accessibility level (basic, enhanced, enterprise)',
      'basic'
    )
    .option('--output <path>', 'Output directory', './design-system')
    .option('--mock-ai', 'Use mock AI for testing purposes')
    .option('--bypass-a11y-fail', 'Bypass accessibility validation failures (not recommended for production)')
    .action(async (options: CLIOptions) => {
      await generateDesignSystem(options)
    })

  program.parse()
  
  // If no arguments provided, show help
  if (process.argv.length === 2) {
    program.help()
  }
}

async function generateDesignSystem(options: CLIOptions) {
  console.log('🎨 Starting design system generation...\n')

  try {
    let inspiration: UserInspiration

    // Handle input from JSON file
    if (options.input) {
      try {
        const inputData = await fs.readFile(options.input, 'utf-8')
        inspiration = JSON.parse(inputData) as UserInspiration
        console.log(`📄 Loaded inspiration from ${options.input}`)
      } catch (error) {
        console.error(`❌ Error reading input file: ${error}`)
        process.exit(1)
      }
    } else {
      // Validate input
      if (!options.image && !options.url && !options.description) {
        console.error(
          '❌ Error: Please provide at least one source of inspiration (--image, --url, --description, or --input)'
        )
        process.exit(1)
      }

      // Build inspiration object from CLI options
      inspiration = {
        imageUrl: options.image,
        websiteUrl: options.url,
        description: options.description,
        brandKeywords: options.brand?.split(',').map((k) => k.trim()),
        industryType: options.industry,
        targetUsers: options.audience,
        colorPreferences: options.colors?.split(',').map((c) => c.trim()),
        stylePreferences: options.style?.split(',').map((s) => s.trim()) as any,
        accessibility: options.accessibility,
      }
    }

    // Create output directory
    const outputPath = path.resolve(options.output || './design-system')
    await fs.mkdir(outputPath, { recursive: true })
    await fs.mkdir(path.join(outputPath, '.supercomponents'), {
      recursive: true,
    })

    console.log('📊 Analyzing inspiration...')
    const workflow = new InspirationToSystemWorkflow()
    
    // Mock AI if flag is set
    if (options.mockAi) {
      const mockAnalyzer = {
        analyzeInspiration: async () => ({
          insights: {
            imageryPalette: ['#3b82f6', '#10b981'],
            typographyFamilies: ['Inter'],
            spacingScale: [8, 16, 24, 32],
            uiDensity: 'regular',
            brandKeywords: inspiration.brandKeywords || ['modern'],
            supportingReferences: ['Clean interface'],
          },
          designRationale: 'A modern design system',
          extractedTokens: {
            colors: { primary: '#3b82f6' },
            typography: { fonts: ['Inter'], sizes: {}, weights: {}, lineHeights: {} },
            spacing: { sm: '8px', md: '16px' },
            borderRadius: { sm: '4px' },
            shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)' },
          },
          inferredPrinciples: {
            brandIdentity: inspiration.brandKeywords?.join(', ') || 'modern',
            targetAudience: inspiration.targetUsers || 'users',
            coreValues: ['Simplicity'],
            designGoals: ['Maintain clean aesthetics'],
          },
        }),
      }
      ;(workflow as any).aiAnalyzer = mockAnalyzer
      console.log('🤖 Using mock AI for testing')
    }
    
    const result = await workflow.generateDesignSystem(inspiration, outputPath, {
      bypassA11yFail: options.bypassA11yFail || false
    })

    console.log('✅ Design system generated successfully!')
    console.log(`📁 Output directory: ${outputPath}`)
    console.log(
      `🎯 Components planned: ${result.componentPlan.totalComponents}`
    )
    console.log(
      `⏱️  Estimated duration: ${result.componentPlan.estimatedDuration}`
    )

    // Generate metadata
    const metadata = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      inspiration,
      tokens: result.tokens,
      principles: result.principles,
      componentPlan: result.componentPlan,
      workflow: 'inspiration-to-system',
    }

    await fs.writeFile(
      path.join(outputPath, '.supercomponents', 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )

    // Generate implementation guide
    await fs.writeFile(
      path.join(outputPath, 'README.md'),
      result.implementationGuide
    )

    console.log('\n📋 Next steps:')
    console.log(`1. cd ${outputPath}`)
    console.log('2. Review the generated tokens and principles')
    console.log('3. Use the MCP server to generate component implementations')
    console.log('4. Follow the implementation guide in README.md')
  } catch (error) {
    console.error('❌ Error generating design system:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
