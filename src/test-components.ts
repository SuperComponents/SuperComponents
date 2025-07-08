// Simple test to verify components compile
import PrincipleGenerator from './generators/principles.js';
import type { DesignInsight } from './types/index.js';

// Test the principles generator
const testInsight: DesignInsight = {
  imageryPalette: ['#3b82f6', '#10b981'],
  typographyFamilies: ['Inter', 'Roboto'],
  spacingScale: [4, 8, 16, 24, 32],
  uiDensity: 'regular',
  brandKeywords: ['modern', 'clean', 'accessible'],
  supportingReferences: []
};

const generator = new PrincipleGenerator();
const principles = generator.generatePrinciples(testInsight);
const markdown = generator.generateMarkdown(principles);

console.log('Generated principles:', principles);
console.log('Generated markdown:', markdown);

export { principles, markdown };
