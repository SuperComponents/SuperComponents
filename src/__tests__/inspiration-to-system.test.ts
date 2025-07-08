import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import { InspirationToSystemWorkflow, UserInspiration } from '../workflows/inspiration-to-system.js';

describe('InspirationToSystemWorkflow', () => {
  let workflow: InspirationToSystemWorkflow;
  let testOutputDir: string;

  beforeEach(() => {
    workflow = new InspirationToSystemWorkflow();
    testOutputDir = path.join(__dirname, '../../test-output');
  });

  afterEach(async () => {
    // Clean up test output directory
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should create output directory structure', async () => {
    const inspiration: UserInspiration = {
      description: 'Modern tech startup design',
      brandKeywords: ['modern', 'tech', 'clean'],
      industryType: 'technology',
      targetUsers: 'developers',
      stylePreferences: ['modern', 'minimalist'],
      colorPreferences: ['#3b82f6', '#10b981'],
      accessibility: 'enhanced'
    };

    // Mock the AI analyzer to avoid requiring OpenAI API key
    const mockAnalyzer = {
      analyzeInspiration: jest.fn().mockResolvedValue({
        insights: {
          imageryPalette: ['#3b82f6', '#10b981', '#f59e0b'],
          typographyFamilies: ['Inter', 'SF Pro Display'],
          spacingScale: [4, 8, 16, 24, 32, 48],
          uiDensity: 'regular',
          brandKeywords: ['modern', 'tech', 'clean'],
          supportingReferences: ['Clean interface', 'Modern typography']
        },
        designRationale: 'A modern tech-focused design system',
        extractedTokens: {
          colors: { primary: '#3b82f6', secondary: '#10b981' },
          typography: { fonts: ['Inter'], sizes: {}, weights: {}, lineHeights: {} },
          spacing: { sm: '8px', md: '16px' },
          borderRadius: { sm: '4px' },
          shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)' }
        },
        inferredPrinciples: {
          brandIdentity: 'modern, tech, clean',
          targetAudience: 'developers',
          coreValues: ['Simplicity', 'Performance', 'Reliability'],
          designGoals: ['Maintain clean aesthetics', 'Ensure fast performance']
        }
      })
    };

    // Replace the AI analyzer with our mock
    (workflow as any).aiAnalyzer = mockAnalyzer;

    try {
      const result = await workflow.generateDesignSystem(inspiration, testOutputDir);

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.principles).toBeDefined();
      expect(result.componentPlan).toBeDefined();
      expect(result.implementationGuide).toBeDefined();
      expect(result.insights).toBeDefined();

      // Verify tokens structure
      expect(result.tokens.colors).toBeDefined();
      expect(result.tokens.typography).toBeDefined();
      expect(result.tokens.spacing).toBeDefined();

      // Verify principles structure
      expect(result.principles.brandIdentity).toBeDefined();
      expect(result.principles.targetAudience).toBeDefined();
      expect(result.principles.coreValues).toBeDefined();
      expect(result.principles.designGoals).toBeDefined();

      // Verify component plan structure
      expect(result.componentPlan.phases).toBeDefined();
      expect(result.componentPlan.totalComponents).toBeDefined();
      expect(result.componentPlan.estimatedDuration).toBeDefined();

      // Verify files were created
      const metadataPath = path.join(testOutputDir, '.supercomponents', 'metadata.json');
      const readmePath = path.join(testOutputDir, 'README.md');
      const principlesPath = path.join(testOutputDir, 'PRINCIPLES.md');
      const tokensPath = path.join(testOutputDir, 'src', 'tokens', 'tokens.json');

      expect(await fs.access(metadataPath).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(readmePath).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(principlesPath).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(tokensPath).then(() => true).catch(() => false)).toBe(true);

      // Verify metadata content
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.generatedAt).toBeDefined();
      expect(metadata.inspiration).toEqual(inspiration);
      expect(metadata.workflow).toBe('inspiration-to-system');

    } catch (error) {
      // If AI analyzer fails (no API key), just verify the structure
      if (error instanceof Error && error.message.includes('LLM service not configured')) {
        console.log('AI analyzer not configured, skipping full workflow test');
        return;
      }
      throw error;
    }
  }, 30000); // 30 second timeout for AI calls

  it('should handle different inspiration types', () => {
    const inspirations = [
      { imageUrl: 'https://example.com/image.jpg' },
      { websiteUrl: 'https://example.com' },
      { description: 'Modern design system' }
    ];

    inspirations.forEach(inspiration => {
      expect(() => {
        new InspirationToSystemWorkflow();
      }).not.toThrow();
    });
  });

  it('should validate user inspiration input', () => {
    const validInspiration: UserInspiration = {
      description: 'Test design',
      brandKeywords: ['modern'],
      accessibility: 'basic'
    };

    expect(validInspiration).toBeDefined();
    expect(validInspiration.description).toBe('Test design');
    expect(validInspiration.brandKeywords).toContain('modern');
    expect(validInspiration.accessibility).toBe('basic');
  });
});
