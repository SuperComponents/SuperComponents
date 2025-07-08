import { InspirationToSystemWorkflow, UserInspiration } from '../inspiration-to-system.js';
import { join } from 'path';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { mkdtemp } from 'fs/promises';

// Mock dependencies
jest.mock('../../ai/design-analyzer.js', () => ({
  AIDesignAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeInspiration: jest.fn().mockResolvedValue({
      insights: {
        imageryPalette: ['#3B82F6', '#6B7280'],
        typographyFamilies: ['Inter', 'Roboto'],
        spacingScale: [4, 8, 12, 16, 24, 32, 48, 64],
        uiDensity: 'regular',
        brandKeywords: ['modern', 'professional'],
        supportingReferences: ['Clean design', 'Minimal interface']
      },
      extractedTokens: {
        colors: { primary: '#3B82F6', secondary: '#6B7280' },
        typography: { fonts: ['Inter'], sizes: {}, weights: {}, lineHeights: {} },
        spacing: { xs: '4px', sm: '8px', md: '16px' },
        borderRadius: { sm: '4px', md: '8px' }
      },
      inferredPrinciples: {
        brandIdentity: 'modern, professional',
        targetAudience: 'business professionals',
        coreValues: ['modern', 'professional', 'clean'],
        designGoals: ['Clean interface', 'Professional appearance']
      },
      designRationale: 'Modern design with professional aesthetic',
      recommendations: ['Use consistent spacing', 'Maintain clean lines']
    })
  }))
}));

jest.mock('../../generators/principles.js', () => ({
  generatePrinciples: jest.fn().mockResolvedValue({
    principles: {
      brandIdentity: 'modern, professional',
      targetAudience: 'business professionals',
      coreValues: ['modern', 'professional', 'clean'],
      designGoals: ['Clean interface', 'Professional appearance']
    },
    sections: {
      brandIdentity: { title: 'Brand Identity', content: 'Modern and professional' },
      targetAudience: { title: 'Target Audience', content: 'Business professionals' },
      coreValues: { title: 'Core Values', content: 'Modern, professional, clean' },
      designGoals: { title: 'Design Goals', content: 'Clean interface, professional appearance' }
    }
  }),
  writePrinciplesToFiles: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../generators/components/factory.js', () => ({
  ComponentFactory: jest.fn().mockImplementation((options) => ({
    generate: jest.fn().mockImplementation(async () => {
      // Mock the directory creation that the real ComponentFactory does
      await fs.mkdir(options.outputDir, { recursive: true });
      const components = ['Button', 'Input', 'Card', 'Modal'];
      for (const comp of components) {
        await fs.mkdir(join(options.outputDir, comp), { recursive: true });
        await fs.writeFile(join(options.outputDir, comp, `${comp}.tsx`), `// Mock ${comp} component`, 'utf-8');
      }
    })
  }))
}));

describe('InspirationToSystemWorkflow', () => {
  let workflow: InspirationToSystemWorkflow;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'workflow-test-'));
    workflow = new InspirationToSystemWorkflow();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should generate design system from image inspiration', async () => {
    const inspiration: UserInspiration = {
      imageUrl: 'https://example.com/image.jpg',
      brandKeywords: ['modern', 'clean'],
      industryType: 'technology',
      accessibility: 'enhanced'
    };

    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });

    // Check that result has expected structure
    expect(result.tokens).toBeDefined();
    expect(result.legacyTokens).toBeDefined();
    expect(result.principles).toBeDefined();
    expect(result.insights).toBeDefined();
    expect(result.metadata).toBeDefined();

    // Check metadata
    expect(result.metadata.source.type).toBe('image');
    expect(result.metadata.source.source).toBe('https://example.com/image.jpg');
    expect(result.metadata.version).toBe('1.0.0');
    expect(result.metadata.timestamp).toBeDefined();
  });

  it('should generate design system from URL inspiration', async () => {
    const inspiration: UserInspiration = {
      websiteUrl: 'https://example.com',
      stylePreferences: ['minimalist', 'professional'],
      targetUsers: 'business professionals'
    };

    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });

    expect(result.metadata.source.type).toBe('url');
    expect(result.metadata.source.source).toBe('https://example.com');
  });

  it('should generate design system from text description', async () => {
    const inspiration: UserInspiration = {
      description: 'Modern healthcare app with calming colors',
      industryType: 'healthcare',
      colorPreferences: ['blue', 'green'],
      accessibility: 'enterprise'
    };

    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });

    expect(result.metadata.source.type).toBe('text');
    expect(result.metadata.source.source).toBe('Modern healthcare app with calming colors');
  });

  it('should create expected directory structure', async () => {
    const inspiration: UserInspiration = {
      description: 'Test design system'
    };

    await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });

    // Check that directories exist
    const tokensDir = join(tempDir, 'tokens');
    const componentsDir = join(tempDir, 'src', 'components');
    const metadataDir = join(tempDir, '.supercomponents');

    expect(await fs.access(tokensDir).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(componentsDir).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(metadataDir).then(() => true).catch(() => false)).toBe(true);

    // Check specific files
    const tokensFile = join(tokensDir, 'design-tokens.json');
    const tailwindConfig = join(tempDir, 'tailwind.config.ts');
    const metadataFile = join(metadataDir, 'metadata.json');

    expect(await fs.access(tokensFile).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(tailwindConfig).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(metadataFile).then(() => true).catch(() => false)).toBe(true);
  });

  it('should handle performance requirements', async () => {
    const inspiration: UserInspiration = {
      description: 'Performance test design system',
      brandKeywords: ['fast', 'efficient'],
      stylePreferences: ['minimalist']
    };

    const startTime = Date.now();
    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });
    const endTime = Date.now();
    
    const duration = (endTime - startTime) / 1000;
    
    // Should complete within 60 seconds
    expect(duration).toBeLessThan(60);
    expect(result).toBeDefined();
  });

  it('should build context correctly', async () => {
    const inspiration: UserInspiration = {
      description: 'Test with full context',
      brandKeywords: ['professional', 'trustworthy'],
      industryType: 'finance',
      targetUsers: 'financial professionals',
      colorPreferences: ['blue', 'gray'],
      stylePreferences: ['professional', 'minimalist'],
      accessibility: 'enterprise'
    };

    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });
    
    // The context should be built and passed to the analyzer
    expect(result.metadata.source.context).toContain('Brand keywords: professional, trustworthy');
    expect(result.metadata.source.context).toContain('Industry: finance');
    expect(result.metadata.source.context).toContain('Target users: financial professionals');
    expect(result.metadata.source.context).toContain('Color preferences: blue, gray');
    expect(result.metadata.source.context).toContain('Style preferences: professional, minimalist');
    expect(result.metadata.source.context).toContain('Accessibility level: enterprise');
  });

  it('should handle missing inspiration gracefully', async () => {
    const inspiration: UserInspiration = {};

    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });
    
    // Should default to text type with default description
    expect(result.metadata.source.type).toBe('text');
    expect(result.metadata.source.source).toBe('Modern design system');
  });

  it('should generate valid Tailwind config', async () => {
    const inspiration: UserInspiration = {
      description: 'Tailwind config test'
    };

    await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });

    const tailwindConfigPath = join(tempDir, 'tailwind.config.ts');
    const configContent = await fs.readFile(tailwindConfigPath, 'utf-8');

    // Should be valid TypeScript
    expect(configContent).toContain('import type { Config } from \'tailwindcss\'');
    expect(configContent).toContain('const config: Config = {');
    expect(configContent).toContain('export default config;');
    
    // Should have expected sections
    expect(configContent).toContain('content: [');
    expect(configContent).toContain('theme: {');
    expect(configContent).toContain('extend: {');
    expect(configContent).toContain('colors: {');
  });
});
