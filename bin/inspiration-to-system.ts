#!/usr/bin/env tsx

import { Command } from 'commander';
import { InspirationToSystemWorkflow, UserInspiration } from '../src/workflows/inspiration-to-system.js';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';

interface CLIOptions {
  image?: string;
  url?: string;
  description?: string;
  output: string;
  verbose?: boolean;
  brandKeywords?: string;
  industryType?: string;
  targetUsers?: string;
  colorPreferences?: string;
  stylePreferences?: string;
  accessibility?: 'basic' | 'enhanced' | 'enterprise';
}

const program = new Command();

program
  .name('inspiration-to-system')
  .description('Generate a complete design system from inspiration')
  .version('1.0.0');

program
  .option('--image <url>', 'Image URL for visual inspiration')
  .option('--url <url>', 'Website URL for design inspiration')
  .option('--description <text>', 'Text description of the desired design')
  .option('--output <dir>', 'Output directory for generated design system', './generated-design-system')
  .option('--verbose', 'Enable verbose logging')
  .option('--brand-keywords <keywords>', 'Comma-separated brand keywords (e.g., "modern,professional,clean")')
  .option('--industry-type <type>', 'Industry type (e.g., "technology", "healthcare", "finance")')
  .option('--target-users <users>', 'Target user description')
  .option('--color-preferences <colors>', 'Comma-separated color preferences (e.g., "blue,green,neutral")')
  .option('--style-preferences <styles>', 'Comma-separated style preferences (modern,classic,playful,professional,minimalist)')
  .option('--accessibility <level>', 'Accessibility level (basic,enhanced,enterprise)', 'basic')
  .action(async (options: CLIOptions) => {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!options.image && !options.url && !options.description) {
        console.error('❌ Error: Must provide either --image, --url, or --description');
        process.exit(1);
      }

      if (options.verbose) {
        console.log('🔧 CLI Options:', options);
      }

      // Convert CLI options to UserInspiration
      const inspiration: UserInspiration = {
        imageUrl: options.image,
        websiteUrl: options.url,
        description: options.description,
        brandKeywords: options.brandKeywords?.split(',').map(k => k.trim()),
        industryType: options.industryType,
        targetUsers: options.targetUsers,
        colorPreferences: options.colorPreferences?.split(',').map(c => c.trim()),
        stylePreferences: options.stylePreferences?.split(',').map(s => s.trim()) as any,
        accessibility: options.accessibility
      };

      // Resolve output path
      const outputDir = resolve(options.output);
      
      if (options.verbose) {
        console.log('📁 Output directory:', outputDir);
        console.log('💡 Inspiration:', inspiration);
      }

      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Initialize workflow
      const workflow = new InspirationToSystemWorkflow();
      
      console.log('🚀 Starting design system generation...');
      console.log(`📋 Input: ${options.image ? 'Image' : options.url ? 'URL' : 'Description'}`);
      console.log(`📂 Output: ${outputDir}`);
      console.log('');

      // Generate design system
      const result = await workflow.generateDesignSystem(inspiration, outputDir);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Success output
      console.log('');
      console.log('🎉 Design system generated successfully!');
      console.log(`⏱️  Total time: ${duration.toFixed(1)}s`);
      console.log('');
      console.log('📁 Generated files:');
      console.log(`   └── ${outputDir}/`);
      console.log(`       ├── design/PRINCIPLES.md`);
      console.log(`       ├── tokens/design-tokens.json`);
      console.log(`       ├── tailwind.config.ts`);
      console.log(`       ├── src/components/`);
      console.log(`       │   ├── Button/`);
      console.log(`       │   ├── Input/`);
      console.log(`       │   ├── Card/`);
      console.log(`       │   └── Modal/`);
      console.log(`       ├── src/stories/Principles.stories.mdx`);
      console.log(`       └── .supercomponents/metadata.json`);
      console.log('');
      console.log('🚀 Next steps:');
      console.log(`   1. cd ${outputDir}`);
      console.log(`   2. npm install`);
      console.log(`   3. npm run storybook`);
      console.log('');

      if (options.verbose) {
        console.log('📊 Generation metadata:');
        console.log(`   Source type: ${result.metadata.source.type}`);
        console.log(`   Timestamp: ${result.metadata.timestamp}`);
        console.log(`   Version: ${result.metadata.version}`);
        console.log(`   Brand keywords: ${result.insights.brandKeywords.join(', ')}`);
        console.log(`   UI density: ${result.insights.uiDensity}`);
        console.log(`   Color palette: ${result.insights.imageryPalette.length} colors`);
        console.log(`   Typography families: ${result.insights.typographyFamilies.length} fonts`);
        console.log('');
      }

      // Check performance requirement (≤60s)
      if (duration > 60) {
        console.warn(`⚠️  Warning: Generation took ${duration.toFixed(1)}s (> 60s requirement)`);
      }

      process.exit(0);
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('❌ Error generating design system:');
      console.error(error instanceof Error ? error.message : String(error));
      console.error(`⏱️  Failed after ${duration.toFixed(1)}s`);
      
      if (options.verbose && error instanceof Error) {
        console.error('');
        console.error('📚 Stack trace:');
        console.error(error.stack);
      }
      
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
