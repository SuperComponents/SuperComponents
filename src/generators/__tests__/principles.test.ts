import { generatePrinciples, writePrinciplesToFiles } from '../principles.js';
import { DesignInsight } from '../../types/index.js';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock fs for file writing tests
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('generatePrinciples', () => {
  let mockInsight: DesignInsight;
  
  beforeEach(() => {
    mockInsight = {
      imageryPalette: ['#3b82f6', '#10b981', '#ef4444'],
      typographyFamilies: ['Inter', 'Monaco'],
      spacingScale: [4, 8, 12, 16, 20, 24, 32, 40],
      uiDensity: 'regular',
      brandKeywords: ['modern', 'clean', 'professional', 'innovative'],
      supportingReferences: []
    };
  });

  describe('principle generation', () => {
    it('should generate 3-5 principles', async () => {
      const result = await generatePrinciples(mockInsight);
      
      expect(result.principles).toHaveLength(4); // brandKeywords.length
      expect(result.principles.length).toBeGreaterThanOrEqual(3);
      expect(result.principles.length).toBeLessThanOrEqual(5);
    });

    it('should ensure each principle has ≤120 words', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(principle.wordCount).toBeLessThanOrEqual(120);
      });
    });

    it('should ensure each principle contains ≥1 brandKeyword', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(principle.brandKeywords.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should include principle titles', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(principle.title).toBeDefined();
        expect(principle.title.length).toBeGreaterThan(0);
      });
    });

    it('should include principle descriptions', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(principle.description).toBeDefined();
        expect(principle.description.length).toBeGreaterThan(0);
      });
    });

    it('should generate at least 3 principles with minimal brandKeywords', async () => {
      const minimalInsight = { ...mockInsight, brandKeywords: ['simple'] };
      const result = await generatePrinciples(minimalInsight);
      
      expect(result.principles).toHaveLength(3);
    });

    it('should cap at 5 principles with many brandKeywords', async () => {
      const manyKeywordsInsight = { 
        ...mockInsight, 
        brandKeywords: ['modern', 'clean', 'professional', 'innovative', 'elegant', 'sophisticated', 'minimal'] 
      };
      const result = await generatePrinciples(manyKeywordsInsight);
      
      expect(result.principles).toHaveLength(5);
    });
  });

  describe('markdown content generation', () => {
    it('should generate valid markdown with proper heading structure', async () => {
      const result = await generatePrinciples(mockInsight);
      
      expect(result.markdownContent).toContain('# Design Principles');
      expect(result.markdownContent).toContain('## 1. ');
      expect(result.markdownContent).toContain('## 2. ');
      expect(result.markdownContent).toContain('## 3. ');
      expect(result.markdownContent).toContain('## 4. ');
    });

    it('should include all principle titles in markdown', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(result.markdownContent).toContain(principle.title);
      });
    });

    it('should include all principle descriptions in markdown', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(result.markdownContent).toContain(principle.description);
      });
    });
  });

  describe('Storybook MDX content generation', () => {
    it('should generate valid MDX content', async () => {
      const result = await generatePrinciples(mockInsight);
      
      expect(result.storybookContent).toContain('# Design Principles');
      expect(result.storybookContent).toContain('## 1. ');
      expect(result.storybookContent).toContain('## 2. ');
      expect(result.storybookContent).toContain('## 3. ');
      expect(result.storybookContent).toContain('## 4. ');
    });

    it('should include all principle content in MDX', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        expect(result.storybookContent).toContain(principle.title);
        expect(result.storybookContent).toContain(principle.description);
      });
    });
  });

  describe('UI density integration', () => {
    it('should adapt principle content based on compact density', async () => {
      const compactInsight = { ...mockInsight, uiDensity: 'compact' as const };
      const result = await generatePrinciples(compactInsight);
      
      const hasCompactTerms = result.principles.some(principle => 
        principle.description.includes('efficient') || 
        principle.description.includes('streamlined') || 
        principle.description.includes('minimal')
      );
      
      expect(hasCompactTerms).toBe(true);
    });

    it('should adapt principle content based on spacious density', async () => {
      const spaciousInsight = { ...mockInsight, uiDensity: 'spacious' as const };
      const result = await generatePrinciples(spaciousInsight);
      
      const hasSpaciousTerms = result.principles.some(principle => 
        principle.description.includes('generous') || 
        principle.description.includes('expansive') || 
        principle.description.includes('thoughtful') ||
        principle.description.includes('adaptable')
      );
      
      expect(hasSpaciousTerms).toBe(true);
    });

    it('should adapt principle content based on regular density', async () => {
      const regularInsight = { ...mockInsight, uiDensity: 'regular' as const };
      const result = await generatePrinciples(regularInsight);
      
      const hasRegularTerms = result.principles.some(principle => 
        principle.description.includes('balanced') || 
        principle.description.includes('harmonious') || 
        principle.description.includes('optimized') ||
        principle.description.includes('flexible')
      );
      
      expect(hasRegularTerms).toBe(true);
    });
  });

  describe('brandKeywords integration', () => {
    it('should include brandKeywords in principle descriptions', async () => {
      const result = await generatePrinciples(mockInsight);
      
      // Check that at least some brand keywords appear in descriptions
      const allDescriptions = result.principles.map(p => p.description).join(' ').toLowerCase();
      const foundKeywords = mockInsight.brandKeywords.filter(keyword => 
        allDescriptions.includes(keyword.toLowerCase())
      );
      
      expect(foundKeywords.length).toBeGreaterThan(0);
    });

    it('should track used brandKeywords in each principle', async () => {
      const result = await generatePrinciples(mockInsight);
      
      result.principles.forEach(principle => {
        principle.brandKeywords.forEach(keyword => {
          expect(principle.description.toLowerCase()).toContain(keyword.toLowerCase());
        });
      });
    });
  });

  describe('file writing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create design directory', async () => {
      const result = await generatePrinciples(mockInsight);
      await writePrinciplesToFiles(result);
      
      expect(fs.mkdir).toHaveBeenCalledWith('design', { recursive: true });
    });

    it('should create src/stories directory', async () => {
      const result = await generatePrinciples(mockInsight);
      await writePrinciplesToFiles(result);
      
      expect(fs.mkdir).toHaveBeenCalledWith('src/stories', { recursive: true });
    });

    it('should write markdown file to correct location', async () => {
      const result = await generatePrinciples(mockInsight);
      await writePrinciplesToFiles(result);
      
      expect(fs.writeFile).toHaveBeenCalledWith('design/PRINCIPLES.md', result.markdownContent);
    });

    it('should write Storybook MDX file to correct location', async () => {
      const result = await generatePrinciples(mockInsight);
      await writePrinciplesToFiles(result);
      
      expect(fs.writeFile).toHaveBeenCalledWith('src/stories/Principles.stories.mdx', result.storybookContent);
    });
  });
});
