import { DesignInsight } from '../types/index.js';
import { promises as fs } from 'fs';

export interface PrinciplesOutput {
  principles: Principle[];
  markdownContent: string;
  storybookContent: string;
}

export interface Principle {
  title: string;
  description: string;
  wordCount: number;
  brandKeywords: string[];
}

/**
 * Generate design principles from DesignInsight
 */
export async function generatePrinciples(insight: DesignInsight): Promise<PrinciplesOutput> {
  const principles = createPrinciplesFromInsight(insight);
  const markdownContent = generateMarkdownContent(principles);
  const storybookContent = generateStorybookContent(principles);
  
  return {
    principles,
    markdownContent,
    storybookContent
  };
}

/**
 * Create principles based on insight data
 */
function createPrinciplesFromInsight(insight: DesignInsight): Principle[] {
  const principles: Principle[] = [];
  const { brandKeywords, uiDensity } = insight;
  
  // Generate 3-5 principles based on available brand keywords
  const principleCount = Math.min(Math.max(brandKeywords.length, 3), 5);
  
  // Template-based generation using brandKeywords and uiDensity
  const principleTemplates = [
    {
      title: 'Visual Hierarchy',
      getDescription: (keywords: string[], density: string) => {
        const keywordText = keywords.slice(0, 2).join(' and ');
        const densityText = density === 'compact' ? 'efficient' : density === 'spacious' ? 'generous' : 'balanced';
        return `Our design system emphasizes ${keywordText} visual hierarchy through ${densityText} spacing and clear typographic scales. Every element serves a purpose in guiding users through their journey, creating intuitive paths that reduce cognitive load while maintaining visual appeal.`;
      }
    },
    {
      title: 'Consistency & Coherence',
      getDescription: (keywords: string[], density: string) => {
        const keywordText = keywords.slice(0, 2).join(' and ');
        const densityText = density === 'compact' ? 'streamlined' : density === 'spacious' ? 'expansive' : 'harmonious';
        return `${keywordText} design language ensures consistency across all touchpoints. Our ${densityText} component library maintains coherence through standardized patterns, unified color palettes, and systematic spacing that creates a seamless user experience.`;
      }
    },
    {
      title: 'Accessibility & Inclusion',
      getDescription: (keywords: string[], density: string) => {
        const keywordText = keywords.slice(0, 2).join(' and ');
        return `Accessibility is fundamental to our ${keywordText} approach. We design for diverse abilities and needs, ensuring our interfaces are usable by everyone. This includes proper contrast ratios, keyboard navigation, screen reader support, and clear visual indicators for all interactive elements.`;
      }
    },
    {
      title: 'Performance & Efficiency',
      getDescription: (keywords: string[], density: string) => {
        const keywordText = keywords.slice(0, 2).join(' and ');
        const densityText = density === 'compact' ? 'minimal' : density === 'spacious' ? 'thoughtful' : 'optimized';
        return `Our ${keywordText} design system prioritizes performance through ${densityText} component architecture. We focus on fast loading times, efficient interactions, and lightweight implementations that don't compromise on visual quality or user experience.`;
      }
    },
    {
      title: 'Scalability & Flexibility',
      getDescription: (keywords: string[], density: string) => {
        const keywordText = keywords.slice(0, 2).join(' and ');
        const densityText = density === 'compact' ? 'efficient' : density === 'spacious' ? 'adaptable' : 'flexible';
        return `Built with ${keywordText} principles, our system scales effortlessly across products and platforms. The ${densityText} token system and modular components adapt to different contexts while maintaining brand consistency and design integrity.`;
      }
    }
  ];
  
  // Select and generate principles
  for (let i = 0; i < principleCount; i++) {
    const template = principleTemplates[i % principleTemplates.length];
    const description = template.getDescription(brandKeywords, uiDensity);
    const usedKeywords = extractUsedKeywords(description, brandKeywords);
    
    principles.push({
      title: template.title,
      description,
      wordCount: description.split(' ').length,
      brandKeywords: usedKeywords
    });
  }
  
  return principles;
}

/**
 * Extract brand keywords that appear in the description
 */
function extractUsedKeywords(description: string, brandKeywords: string[]): string[] {
  const lowerDescription = description.toLowerCase();
  return brandKeywords.filter(keyword => 
    lowerDescription.includes(keyword.toLowerCase())
  );
}

/**
 * Generate markdown content for principles
 */
function generateMarkdownContent(principles: Principle[]): string {
  const content = [
    '# Design Principles',
    '',
    'These principles guide our design decisions and ensure consistency across all components and experiences.',
    ''
  ];
  
  principles.forEach((principle, index) => {
    content.push(`## ${index + 1}. ${principle.title}`);
    content.push('');
    content.push(principle.description);
    content.push('');
  });
  
  return content.join('\n');
}

/**
 * Generate Storybook MDX content
 */
function generateStorybookContent(principles: Principle[]): string {
  const content = [
    'import { Meta } from \'@storybook/addon-docs\';',
    '',
    '<Meta title="Design System/Principles" />',
    '',
    '# Design Principles',
    '',
    'These principles guide our design decisions and ensure consistency across all components and experiences.',
    ''
  ];
  
  principles.forEach((principle, index) => {
    content.push(`## ${index + 1}. ${principle.title}`);
    content.push('');
    content.push(principle.description);
    content.push('');
  });
  
  return content.join('\n');
}

/**
 * Write principles to files
 */
export async function writePrinciplesToFiles(output: PrinciplesOutput): Promise<void> {
  // Create directories if they don't exist
  await fs.mkdir('design', { recursive: true });
  await fs.mkdir('src/stories', { recursive: true });
  
  // Write markdown file
  await fs.writeFile('design/PRINCIPLES.md', output.markdownContent);
  
  // Write Storybook MDX file
  await fs.writeFile('src/stories/Principles.stories.mdx', output.storybookContent);
}
