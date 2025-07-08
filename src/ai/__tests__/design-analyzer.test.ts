import { AIDesignAnalyzer } from '../design-analyzer.js';
import { DesignInsight } from '../../types/index.js';
import { promises as fs } from 'fs';
import path from 'path';

// Mock OpenAI to avoid API calls during tests
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('AIDesignAnalyzer', () => {
  let analyzer: AIDesignAnalyzer;

  beforeEach(() => {
    analyzer = new AIDesignAnalyzer('test-key');
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.unlink('/tmp/insights.json');
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  describe('analyzeInspiration', () => {
    it('should analyze modern dashboard design', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              imageryPalette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
              typographyFamilies: ['Inter', 'Roboto'],
              spacingScale: [4, 8, 12, 16, 24, 32, 48, 64],
              uiDensity: 'compact',
              brandKeywords: ['modern', 'professional', 'clean', 'data-driven'],
              supportingReferences: ['Grid-based layout', 'Card components', 'Dark sidebar']
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (analyzer as any).openai.chat.completions.create = mockCreate;

      const result = await analyzer.analyzeInspiration({
        type: 'image',
        source: path.join(process.cwd(), 'fixtures/inspiration/modern-dashboard.png'),
        context: 'Analytics dashboard for business users'
      });

      expect(result.insights.imageryPalette).toEqual(['#3B82F6', '#10B981', '#F59E0B', '#EF4444']);
      expect(result.insights.typographyFamilies).toEqual(['Inter', 'Roboto']);
      expect(result.insights.spacingScale).toEqual([4, 8, 12, 16, 24, 32, 48, 64]);
      expect(result.insights.uiDensity).toBe('compact');
      expect(result.insights.brandKeywords).toContain('modern');
      expect(result.insights.brandKeywords).toContain('professional');

      expect(result.extractedTokens.colors).toHaveProperty('primary');
      expect(result.extractedTokens.colors).toHaveProperty('secondary');
      expect(result.extractedTokens.typography.fonts).toEqual(['Inter', 'Roboto']);
      expect(result.extractedTokens.spacing).toHaveProperty('xs');
      expect(result.extractedTokens.spacing).toHaveProperty('sm');

      expect(result.inferredPrinciples.brandIdentity).toContain('modern');
      expect(result.inferredPrinciples.targetAudience).toContain('Business professionals');
      expect(result.designRationale).toContain('compact');
      expect(result.recommendations).toHaveLength(5);

      mockCreate.mockRestore();
    });

    it('should analyze nature blog design', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              imageryPalette: ['#22C55E', '#059669', '#FCD34D', '#92400E'],
              typographyFamilies: ['Merriweather', 'Open Sans'],
              spacingScale: [8, 16, 24, 32, 48, 64, 80, 96],
              uiDensity: 'spacious',
              brandKeywords: ['natural', 'organic', 'peaceful', 'sustainable'],
              supportingReferences: ['Nature photography', 'Flowing layouts', 'Serif headings']
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (analyzer as any).openai.chat.completions.create = mockCreate;

      const result = await analyzer.analyzeInspiration({
        type: 'image',
        source: path.join(process.cwd(), 'fixtures/inspiration/nature-blog.png'),
        context: 'Blog about nature and sustainability'
      });

      expect(result.insights.imageryPalette).toEqual(['#22C55E', '#059669', '#FCD34D', '#92400E']);
      expect(result.insights.typographyFamilies).toEqual(['Merriweather', 'Open Sans']);
      expect(result.insights.spacingScale).toEqual([8, 16, 24, 32, 48, 64, 80, 96]);
      expect(result.insights.uiDensity).toBe('spacious');
      expect(result.insights.brandKeywords).toContain('natural');
      expect(result.insights.brandKeywords).toContain('organic');

      expect(result.extractedTokens.colors.primary).toBe('#22C55E');
      expect(result.extractedTokens.colors.secondary).toBe('#059669');
      expect(result.extractedTokens.typography.fonts).toEqual(['Merriweather', 'Open Sans']);
      expect(result.extractedTokens.spacing.xs).toBe('8px');
      expect(result.extractedTokens.spacing.sm).toBe('16px');

      expect(result.inferredPrinciples.brandIdentity).toContain('natural');
      expect(result.inferredPrinciples.coreValues).toEqual(['natural', 'organic', 'peaceful']);
      expect(result.designRationale).toContain('spacious');
      expect(result.recommendations).toHaveLength(4);

      mockCreate.mockRestore();
    });

    it('should analyze luxury ecommerce design', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              imageryPalette: ['#000000', '#FFFFFF', '#D4AF37', '#8B4513'],
              typographyFamilies: ['Playfair Display', 'Lato'],
              spacingScale: [6, 12, 18, 24, 36, 48, 72, 96],
              uiDensity: 'regular',
              brandKeywords: ['luxury', 'elegant', 'premium', 'sophisticated'],
              supportingReferences: ['High-end product photography', 'Minimal layouts', 'Gold accents']
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (analyzer as any).openai.chat.completions.create = mockCreate;

      const result = await analyzer.analyzeInspiration({
        type: 'image',
        source: path.join(process.cwd(), 'fixtures/inspiration/luxury-ecommerce.png'),
        context: 'Luxury fashion ecommerce site'
      });

      expect(result.insights.imageryPalette).toEqual(['#000000', '#FFFFFF', '#D4AF37', '#8B4513']);
      expect(result.insights.typographyFamilies).toEqual(['Playfair Display', 'Lato']);
      expect(result.insights.spacingScale).toEqual([6, 12, 18, 24, 36, 48, 72, 96]);
      expect(result.insights.uiDensity).toBe('regular');
      expect(result.insights.brandKeywords).toContain('luxury');
      expect(result.insights.brandKeywords).toContain('elegant');

      expect(result.extractedTokens.colors.primary).toBe('#000000');
      expect(result.extractedTokens.colors.secondary).toBe('#FFFFFF');
      expect(result.extractedTokens.typography.fonts).toEqual(['Playfair Display', 'Lato']);
      expect(result.extractedTokens.spacing.xs).toBe('6px');
      expect(result.extractedTokens.spacing.sm).toBe('12px');

      expect(result.inferredPrinciples.brandIdentity).toContain('luxury');
      expect(result.inferredPrinciples.coreValues).toEqual(['luxury', 'elegant', 'premium']);
      expect(result.designRationale).toContain('regular');
      expect(result.recommendations).toHaveLength(4);

      mockCreate.mockRestore();
    });

    it('should handle text-based inspiration', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              imageryPalette: ['#1E40AF', '#DC2626', '#059669', '#F59E0B'],
              typographyFamilies: ['Source Sans Pro', 'Roboto Mono'],
              spacingScale: [4, 8, 12, 16, 24, 32, 48, 64],
              uiDensity: 'compact',
              brandKeywords: ['technical', 'reliable', 'precise', 'innovative'],
              supportingReferences: ['Developer-focused', 'Code snippets', 'Technical documentation']
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (analyzer as any).openai.chat.completions.create = mockCreate;

      const result = await analyzer.analyzeInspiration({
        type: 'text',
        source: 'A developer-focused application with technical documentation and code examples',
        context: 'API documentation platform'
      });

      expect(result.insights.brandKeywords).toContain('technical');
      expect(result.insights.brandKeywords).toContain('reliable');
      expect(result.insights.uiDensity).toBe('compact');
      expect(result.extractedTokens.typography.fonts).toEqual(['Source Sans Pro', 'Roboto Mono']);

      mockCreate.mockRestore();
    });

    it('should persist insights to /tmp/insights.json', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              imageryPalette: ['#3B82F6'],
              typographyFamilies: ['Inter'],
              spacingScale: [8, 16, 24, 32],
              uiDensity: 'regular',
              brandKeywords: ['modern'],
              supportingReferences: ['Test reference']
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (analyzer as any).openai.chat.completions.create = mockCreate;

      await analyzer.analyzeInspiration({
        type: 'text',
        source: 'Test inspiration',
        context: 'Test context'
      });

      const persistedData = await fs.readFile('/tmp/insights.json', 'utf-8');
      const parsed = JSON.parse(persistedData);

      expect(parsed.insights.imageryPalette).toEqual(['#3B82F6']);
      expect(parsed.insights.brandKeywords).toEqual(['modern']);
      expect(parsed.input.type).toBe('text');
      expect(parsed.input.source).toBe('Test inspiration');
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.version).toBe('1.0.0');

      mockCreate.mockRestore();
    });

    it('should load persisted insights', async () => {
      const testInsights: DesignInsight = {
        imageryPalette: ['#FF0000'],
        typographyFamilies: ['Arial'],
        spacingScale: [10, 20, 30, 40],
        uiDensity: 'spacious',
        brandKeywords: ['bold'],
        supportingReferences: ['Test']
      };

      const testData = {
        insights: testInsights,
        input: { type: 'text', source: 'test' },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      await fs.writeFile('/tmp/insights.json', JSON.stringify(testData));

      const loadedInsights = await analyzer.loadPersistedInsights();
      
      expect(loadedInsights).toEqual(testInsights);
    });

    it('should handle errors gracefully', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (analyzer as any).openai.chat.completions.create = mockCreate;

      await expect(analyzer.analyzeInspiration({
        type: 'text',
        source: 'Test',
        context: 'Test'
      })).rejects.toThrow('Failed to extract design insights');

      mockCreate.mockRestore();
    });
  });

  describe('Design Token Conversion', () => {
    it('should convert palette to semantic color tokens', () => {
      const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
      const tokens = (analyzer as any).convertPaletteToTokens(palette);

      expect(tokens.primary).toBe('#3B82F6');
      expect(tokens.secondary).toBe('#10B981');
      expect(tokens.accent).toBe('#F59E0B');
      expect(tokens['color-4']).toBe('#EF4444');
      expect(tokens.background).toBe('#FFFFFF');
      expect(tokens.text).toBe('#111827');
    });

    it('should convert spacing scale to tokens', () => {
      const scale = [4, 8, 12, 16, 24, 32, 48, 64];
      const tokens = (analyzer as any).convertSpacingToTokens(scale);

      expect(tokens.xs).toBe('4px');
      expect(tokens.sm).toBe('8px');
      expect(tokens.md).toBe('12px');
      expect(tokens.lg).toBe('16px');
      expect(tokens.xl).toBe('24px');
      expect(tokens['2xl']).toBe('32px');
      expect(tokens['3xl']).toBe('48px');
      expect(tokens['4xl']).toBe('64px');
    });

    it('should generate density-appropriate border radius', () => {
      const compactTokens = (analyzer as any).generateBorderRadiusTokens('compact');
      const spaciousTokens = (analyzer as any).generateBorderRadiusTokens('spacious');

      expect(compactTokens.sm).toBe('2px');
      expect(compactTokens.md).toBe('4px');
      expect(spaciousTokens.sm).toBe('8px');
      expect(spaciousTokens.md).toBe('16px');
    });
  });
});
