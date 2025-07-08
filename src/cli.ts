#!/usr/bin/env node

import { program } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { InspirationToSystemWorkflow, UserInspiration } from './workflows/inspiration-to-system.js';
import { AIDesignAnalyzer } from './ai/design-analyzer.js';
import { TokenGenerator } from './generators/tokens.js';
import { PrincipleGenerator } from './generators/principles.js';

interface CLIOptions {
  image?: string;
  url?: string;
  description?: string;
  brand?: string;
  industry?: string;
  audience?: string;
  style?: string;
  colors?: string;
  accessibility?: 'basic' | 'enhanced' | 'enterprise';
  output?: string;
}

async function main() {
  program
    .name('inspiration-to-system')
    .description('Generate a complete design system from inspiration')
    .version('1.0.0');

  program
    .option('--image <url>', 'Image URL for visual inspiration')
    .option('--url <url>', 'Website URL for design inspiration')
    .option('--description <text>', 'Text description of desired design')
    .option('--brand <keywords>', 'Brand keywords (comma-separated)')
    .option('--industry <type>', 'Industry type (e.g., tech, finance, creative)')
    .option('--audience <description>', 'Target audience description')
    .option('--style <preferences>', 'Style preferences (comma-separated: modern, classic, playful, professional, minimalist)')
    .option('--colors <preferences>', 'Color preferences (comma-separated hex codes or names)')
    .option('--accessibility <level>', 'Accessibility level (basic, enhanced, enterprise)', 'basic')
    .option('--output <path>', 'Output directory', './design-system')
    .action(async (options: CLIOptions) => {
      await generateDesignSystem(options);
    });

  program.parse();
}

async function generateDesignSystem(options: CLIOptions) {
  console.log('🎨 Starting design system generation...\n');

  try {
    // Validate input
    if (!options.image && !options.url && !options.description) {
      console.error('❌ Error: Please provide at least one source of inspiration (--image, --url, or --description)');
      process.exit(1);
    }

    // Create output directory
    const outputPath = path.resolve(options.output || './design-system');
    await fs.mkdir(outputPath, { recursive: true });
    await fs.mkdir(path.join(outputPath, '.supercomponents'), { recursive: true });

    // Build inspiration object
    const inspiration: UserInspiration = {
      imageUrl: options.image,
      websiteUrl: options.url,
      description: options.description,
      brandKeywords: options.brand?.split(',').map(k => k.trim()),
      industryType: options.industry,
      targetUsers: options.audience,
      colorPreferences: options.colors?.split(',').map(c => c.trim()),
      stylePreferences: options.style?.split(',').map(s => s.trim()) as any,
      accessibility: options.accessibility
    };

    console.log('📊 Analyzing inspiration...');
    const workflow = new InspirationToSystemWorkflow();
    const result = await workflow.generateDesignSystem(inspiration, outputPath);

    console.log('✅ Design system generated successfully!');
    console.log(`📁 Output directory: ${outputPath}`);
    console.log(`🎯 Components planned: ${result.componentPlan.totalComponents}`);
    console.log(`⏱️  Estimated duration: ${result.componentPlan.estimatedDuration}`);

    // Generate metadata
    const metadata = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      inspiration,
      tokens: result.tokens,
      principles: result.principles,
      componentPlan: result.componentPlan,
      workflow: 'inspiration-to-system'
    };

    await fs.writeFile(
      path.join(outputPath, '.supercomponents', 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Generate implementation guide
    await fs.writeFile(
      path.join(outputPath, 'README.md'),
      result.implementationGuide
    );

    console.log('\n📋 Next steps:');
    console.log(`1. cd ${outputPath}`);
    console.log('2. Review the generated tokens and principles');
    console.log('3. Use the MCP server to generate component implementations');
    console.log('4. Follow the implementation guide in README.md');

  } catch (error) {
    console.error('❌ Error generating design system:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
