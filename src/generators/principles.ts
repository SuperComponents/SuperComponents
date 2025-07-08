import { DesignInsight, DesignPrinciples } from '../types/index.js';

export interface PrincipleGeneratorOptions {
  maxPrinciples?: number;
  includeConstraints?: boolean;
  focusAreas?: string[];
}

export class PrincipleGenerator {
  private options: PrincipleGeneratorOptions;

  constructor(options: PrincipleGeneratorOptions = {}) {
    this.options = {
      maxPrinciples: 5,
      includeConstraints: true,
      focusAreas: ['usability', 'accessibility', 'brand-alignment'],
      ...options
    };
  }

  /**
   * Generate design principles from DesignInsight
   */
  generatePrinciples(insight: DesignInsight): DesignPrinciples {
    const brandIdentity = this.generateBrandIdentity(insight);
    const targetAudience = this.generateTargetAudience(insight);
    const coreValues = this.generateCoreValues(insight);
    const designGoals = this.generateDesignGoals(insight);
    const constraints = this.options.includeConstraints ? this.generateConstraints(insight) : undefined;

    return {
      brandIdentity,
      targetAudience,
      coreValues,
      designGoals,
      constraints
    };
  }

  /**
   * Generate brand identity statement
   */
  private generateBrandIdentity(insight: DesignInsight): string {
    const keywords = insight.brandKeywords.slice(0, 3);
    const density = insight.uiDensity;
    
    if (keywords.length === 0) {
      return `A ${density} interface that prioritizes user experience and accessibility`;
    }

    const keywordString = keywords.join(', ');
    const densityMap = {
      compact: 'efficient and focused',
      regular: 'balanced and intuitive',
      spacious: 'comfortable and accessible'
    };

    return `A ${densityMap[density]} brand experience that embodies ${keywordString}`;
  }

  /**
   * Generate target audience description
   */
  private generateTargetAudience(insight: DesignInsight): string {
    const density = insight.uiDensity;
    const keywords = insight.brandKeywords;
    
    const audienceMap = {
      compact: 'power users and professionals who value efficiency',
      regular: 'general users seeking intuitive and reliable experiences',
      spacious: 'users who prioritize comfort and accessibility'
    };

    let audience = audienceMap[density];
    
    if (keywords.includes('premium') || keywords.includes('luxury')) {
      audience += ' with high expectations for quality';
    }
    
    if (keywords.includes('playful') || keywords.includes('creative')) {
      audience += ' who appreciate engaging interactions';
    }

    return audience;
  }

  /**
   * Generate core values based on insight
   */
  private generateCoreValues(insight: DesignInsight): string[] {
    const values: string[] = [];
    const keywords = insight.brandKeywords;
    const density = insight.uiDensity;

    // Base values based on UI density
    if (density === 'compact') {
      values.push('Efficiency', 'Performance');
    } else if (density === 'spacious') {
      values.push('Accessibility', 'Comfort');
    } else {
      values.push('Usability', 'Reliability');
    }

    // Add values based on brand keywords
    if (keywords.includes('modern') || keywords.includes('clean')) {
      values.push('Simplicity');
    }
    if (keywords.includes('premium') || keywords.includes('luxury')) {
      values.push('Quality');
    }
    if (keywords.includes('playful') || keywords.includes('creative')) {
      values.push('Engagement');
    }
    if (keywords.includes('trust') || keywords.includes('secure')) {
      values.push('Trust');
    }

    // Ensure we have at least 3 values
    if (values.length < 3) {
      const additionalValues = ['Consistency', 'Clarity', 'Innovation'];
      values.push(...additionalValues.slice(0, 3 - values.length));
    }

    return values.slice(0, this.options.maxPrinciples);
  }

  /**
   * Generate design goals
   */
  private generateDesignGoals(insight: DesignInsight): string[] {
    const goals: string[] = [];
    const density = insight.uiDensity;
    const keywords = insight.brandKeywords;

    // Base goals based on UI density
    const densityGoals = {
      compact: ['Minimize cognitive load', 'Maximize information density'],
      regular: ['Balance functionality with aesthetics', 'Ensure intuitive navigation'],
      spacious: ['Provide comfortable interaction areas', 'Support diverse user needs']
    };

    goals.push(...densityGoals[density]);

    // Add goals based on brand keywords
    if (keywords.includes('accessible') || keywords.includes('inclusive')) {
      goals.push('Meet WCAG 2.1 AA standards');
    }
    if (keywords.includes('fast') || keywords.includes('responsive')) {
      goals.push('Optimize for performance');
    }
    if (keywords.includes('mobile') || keywords.includes('responsive')) {
      goals.push('Ensure mobile-first design');
    }

    // Add universal goals
    if (goals.length < 4) {
      const universalGoals = [
        'Maintain visual consistency',
        'Provide clear feedback',
        'Support keyboard navigation',
        'Ensure cross-browser compatibility'
      ];
      goals.push(...universalGoals.slice(0, 4 - goals.length));
    }

    return goals.slice(0, this.options.maxPrinciples);
  }

  /**
   * Generate design constraints
   */
  private generateConstraints(insight: DesignInsight): string[] {
    const constraints: string[] = [];
    const density = insight.uiDensity;
    const palette = insight.imageryPalette;

    // Color constraints
    if (palette.length > 0) {
      constraints.push(`Primary color palette limited to ${palette.length} colors`);
    }

    // Density constraints
    if (density === 'compact') {
      constraints.push('Minimize whitespace and padding');
    } else if (density === 'spacious') {
      constraints.push('Maintain minimum 44px touch targets');
    }

    // Typography constraints
    if (insight.typographyFamilies.length > 0) {
      constraints.push(`Typography limited to ${insight.typographyFamilies.length} font families`);
    }

    // Spacing constraints
    if (insight.spacingScale.length > 0) {
      constraints.push(`Spacing must follow ${insight.spacingScale.length}-step scale`);
    }

    return constraints;
  }

  /**
   * Generate markdown documentation
   */
  generateMarkdown(principles: DesignPrinciples): string {
    const sections = [
      '# Design Principles',
      '',
      '## Brand Identity',
      principles.brandIdentity,
      '',
      '## Target Audience',
      principles.targetAudience,
      '',
      '## Core Values',
      principles.coreValues.map(value => `- **${value}**`).join('\n'),
      '',
      '## Design Goals',
      principles.designGoals.map(goal => `- ${goal}`).join('\n')
    ];

    if (principles.constraints && principles.constraints.length > 0) {
      sections.push(
        '',
        '## Design Constraints',
        principles.constraints.map(constraint => `- ${constraint}`).join('\n')
      );
    }

    sections.push(
      '',
      '---',
      `*Generated on ${new Date().toISOString().split('T')[0]}*`
    );

    return sections.join('\n');
  }

  /**
   * Generate AI prompt for principle refinement
   */
  generateRefinementPrompt(insight: DesignInsight, existingPrinciples?: DesignPrinciples): string {
    const context = [
      'You are a design systems expert. Refine these design principles based on the provided context.',
      '',
      '## Brand Context',
      `Keywords: ${insight.brandKeywords.join(', ')}`,
      `UI Density: ${insight.uiDensity}`,
      `Color Palette: ${insight.imageryPalette.join(', ')}`,
      `Typography: ${insight.typographyFamilies.join(', ')}`,
      ''
    ];

    if (existingPrinciples) {
      context.push(
        '## Current Principles',
        `Brand Identity: ${existingPrinciples.brandIdentity}`,
        `Target Audience: ${existingPrinciples.targetAudience}`,
        `Core Values: ${existingPrinciples.coreValues.join(', ')}`,
        `Design Goals: ${existingPrinciples.designGoals.join(', ')}`,
        ''
      );
    }

    context.push(
      '## Requirements',
      '- Keep principles concise and actionable',
      '- Ensure alignment with brand keywords',
      '- Consider UI density implications',
      '- Maintain consistency across all elements',
      '',
      'Provide refined principles in the same format, focusing on clarity and specificity.'
    );

    return context.join('\n');
  }
}

export default PrincipleGenerator;
