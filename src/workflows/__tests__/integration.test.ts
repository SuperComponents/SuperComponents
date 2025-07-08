import { InspirationToSystemWorkflow, UserInspiration } from '../inspiration-to-system.js';
import { join } from 'path';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { mkdtemp } from 'fs/promises';

// Mock OpenAI for integration tests
jest.mock('../../ai/design-analyzer.js', () => ({
  AIDesignAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeInspiration: jest.fn().mockImplementation(async (input: any) => {
      // Return different results based on input
      const sourceText = input.source || input.description || '';
      const isHealthcare = sourceText.includes('healthcare') || sourceText.includes('Healthcare');
      const isGaming = sourceText.includes('gaming') || sourceText.includes('Gaming');
      
      return {
        extractedTokens: {
          colors: { primary: isHealthcare ? '#007ACC' : isGaming ? '#FF6B35' : '#3B82F6', secondary: '#10B981' },
          typography: { body: 'Inter', heading: 'Inter' },
          spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem' },
          borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '1rem' },
          shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)', md: '0 2px 4px rgba(0,0,0,0.1)' }
        },
        inferredPrinciples: {
          primary: 'Clarity',
          secondary: 'Consistency',
          tertiary: 'Efficiency'
        },
        designRationale: isHealthcare ? 'Professional healthcare design system' : isGaming ? 'Exciting gaming platform design' : 'Modern professional design system',
        recommendations: ['Focus on accessibility', 'Use consistent spacing'],
        insights: {
          imageryPalette: isHealthcare ? 
            ['#007ACC', '#0056CC', '#004499', '#E6F3FF'] : 
            isGaming ? 
            ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5'] :
            ['#3B82F6', '#1E40AF', '#EF4444', '#DC2626', '#10B981', '#059669', '#F59E0B', '#D97706'],
          typographyFamilies: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
          spacingScale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
          uiDensity: 'regular' as const,
          brandKeywords: isHealthcare ? ['professional', 'trustworthy', 'clean'] : isGaming ? ['exciting', 'modern', 'dynamic'] : ['modern', 'professional', 'clean'],
          supportingReferences: []
        }
      };
    })
  }))
}));

describe('Integration: End-to-End Workflow', () => {
  let workflow: InspirationToSystemWorkflow;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'integration-test-'));
    workflow = new InspirationToSystemWorkflow();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should generate complete design system from description', async () => {
    const inspiration: UserInspiration = {
      description: 'A modern SaaS application with clean, professional design',
      brandKeywords: ['modern', 'professional', 'clean'],
      industryType: 'technology',
      targetUsers: 'business professionals',
      colorPreferences: ['blue', 'neutral'],
      stylePreferences: ['minimalist', 'professional'],
      accessibility: 'enhanced'
    };

    const startTime = Date.now();
    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });
    const endTime = Date.now();

    const duration = (endTime - startTime) / 1000;
    console.log(`\n⏱️  Generation completed in ${duration.toFixed(2)}s`);

    // Performance requirement: ≤ 60s
    expect(duration).toBeLessThan(60);

    // Verify all required files are created
    const expectedFiles = [
      'tokens/design-tokens.json',
      'tailwind.config.ts',
      '.supercomponents/metadata.json'
    ];

    const expectedDirs = [
      'src/components/Button',
      'src/components/Input', 
      'src/components/Card',
      'src/components/Modal'
    ];

    // Check files exist
    for (const file of expectedFiles) {
      const filePath = join(tempDir, file);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }

    // Check directories exist
    for (const dir of expectedDirs) {
      const dirPath = join(tempDir, dir);
      const exists = await fs.access(dirPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }

    // Verify W3C design tokens structure
    const tokensPath = join(tempDir, 'tokens/design-tokens.json');
    const tokensContent = await fs.readFile(tokensPath, 'utf-8');
    const tokens = JSON.parse(tokensContent);

    expect(tokens.color).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.borderRadius).toBeDefined();
    expect(tokens.shadow).toBeDefined();

    // Verify Tailwind config is valid TypeScript
    const tailwindPath = join(tempDir, 'tailwind.config.ts');
    const tailwindContent = await fs.readFile(tailwindPath, 'utf-8');
    
    expect(tailwindContent).toContain('import type { Config } from \'tailwindcss\'');
    expect(tailwindContent).toContain('export default config;');
    expect(tailwindContent).toContain('content: [');
    expect(tailwindContent).toContain('theme: {');

    // Verify metadata structure
    const metadataPath = join(tempDir, '.supercomponents/metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    expect(metadata.timestamp).toBeDefined();
    expect(metadata.version).toBe('1.0.0');
    expect(metadata.source.type).toBe('text');
    expect(metadata.source.source).toBe(inspiration.description);
    expect(metadata.insights).toBeDefined();
    expect(metadata.generatedFiles).toBeInstanceOf(Array);
    expect(metadata.generatedFiles.length).toBeGreaterThan(0);

    // Verify component structure
    const componentNames = ['Button', 'Input', 'Card', 'Modal'];
    for (const name of componentNames) {
      const componentDir = join(tempDir, 'src/components', name);
      const files = await fs.readdir(componentDir);
      
      // Should have at least the main component file
      expect(files.some(f => f.endsWith(`${name}.tsx`))).toBe(true);
    }

    // Verify return value structure
    expect(result.tokens).toBeDefined();
    expect(result.legacyTokens).toBeDefined();
    expect(result.principles).toBeDefined();
    expect(result.insights).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata.timestamp).toBeDefined();
    expect(result.metadata.version).toBe('1.0.0');
    expect(result.metadata.source.type).toBe('text');

    console.log('✅ Integration test passed - all artifacts generated successfully');
  });

  it('should handle minimal inspiration input', async () => {
    const inspiration: UserInspiration = {
      description: 'Simple design system'
    };

    const result = await workflow.generateDesignSystem(inspiration, tempDir, { skipWcagValidation: true });

    // Should still generate all required files
    const tokensPath = join(tempDir, 'tokens/design-tokens.json');
    const exists = await fs.access(tokensPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    expect(result.metadata.source.type).toBe('text');
    expect(result.metadata.source.source).toBe('Simple design system');
  });

  it('should generate different outputs for different inputs', async () => {
    const inspiration1: UserInspiration = {
      description: 'Healthcare app',
      industryType: 'healthcare',
      stylePreferences: ['professional']
    };

    const inspiration2: UserInspiration = {
      description: 'Gaming platform',
      industryType: 'gaming',
      stylePreferences: ['playful', 'modern']
    };

    const result1 = await workflow.generateDesignSystem(inspiration1, join(tempDir, 'healthcare'), { skipWcagValidation: true });
    const result2 = await workflow.generateDesignSystem(inspiration2, join(tempDir, 'gaming'), { skipWcagValidation: true });

    // Should have different insights
    expect(result1.insights).not.toEqual(result2.insights);
    expect(result1.metadata.source.source).not.toEqual(result2.metadata.source.source);
  });
});
