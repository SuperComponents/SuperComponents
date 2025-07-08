import { describe, test, expect } from 'vitest'
import { generateComponentPrompt } from '../generate-component-prompt.js'
import { defineDesignPrinciplesPrompt } from '../define-design-principles.js'
import { planComponentLibraryPrompt } from '../plan-component-library.js'
import { DesignPrinciples, DesignTokens } from '../../types/index.js'

describe('Prompt Modules Coverage', () => {
  describe('generateComponentPrompt', () => {
    test('should handle missing componentName', () => {
      const result = generateComponentPrompt()
      expect(result).toHaveProperty('messages')
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].content.text).toContain('specify a component name')
    })

    test('should handle empty args', () => {
      const result = generateComponentPrompt({} as any)
      expect(result).toHaveProperty('messages')
      expect(result.messages[0].content.text).toContain('specify a component name')
    })

    test('should generate Button component prompt', () => {
      const result = generateComponentPrompt({ componentName: 'Button' })
      expect(result).toHaveProperty('messages')
      expect(result.messages[0].content.text).toContain('Button Component')
      expect(result.messages[0].content.text).toContain('variant')
      expect(result.messages[0].content.text).toContain('primary')
      expect(result.messages[0].content.text).toContain('secondary')
      expect(result.messages[0].content.text).toContain('aria-label')
    })

    test('should generate Input component prompt', () => {
      const result = generateComponentPrompt({ componentName: 'Input' })
      expect(result).toHaveProperty('messages')
      expect(result.messages[0].content.text).toContain('Input Component')
      expect(result.messages[0].content.text).toContain('type')
      expect(result.messages[0].content.text).toContain('placeholder')
      expect(result.messages[0].content.text).toContain('aria-invalid')
    })

    test('should generate Card component prompt', () => {
      const result = generateComponentPrompt({ componentName: 'Card' })
      expect(result).toHaveProperty('messages')
      expect(result.messages[0].content.text).toContain('Card Component')
      expect(result.messages[0].content.text).toContain('title')
      expect(result.messages[0].content.text).toContain('description')
      expect(result.messages[0].content.text).toContain('elevated')
    })

    test('should generate generic component prompt for unknown components', () => {
      const result = generateComponentPrompt({ componentName: 'CustomComponent' })
      expect(result).toHaveProperty('messages')
      expect(result.messages[0].content.text).toContain('CustomComponent Component')
      expect(result.messages[0].content.text).toContain('children')
      expect(result.messages[0].content.text).toContain('className')
    })

    test('should include design principles context', () => {
      const principles: DesignPrinciples = {
        brandIdentity: 'Modern Tech',
        targetAudience: 'Developers',
        coreValues: ['Simplicity', 'Accessibility'],
        visualPersonality: 'Clean and Professional',
        designGoals: ['Consistency', 'Usability'],
        constraints: ['WCAG AA', 'Mobile-first']
      }
      
      const result = generateComponentPrompt({ 
        componentName: 'Button', 
        principles 
      })
      
      expect(result.messages[0].content.text).toContain('Design Principles to Follow')
      expect(result.messages[0].content.text).toContain('Simplicity')
      expect(result.messages[0].content.text).toContain('Accessibility')
      expect(result.messages[0].content.text).toContain('Developers')
    })

    test('should include tokens context', () => {
      const tokens: DesignTokens = {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          danger: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b'
        },
        typography: {
          fonts: ['Inter', 'Arial'],
          sizes: {
            sm: '14px',
            md: '16px',
            lg: '18px'
          },
          weights: {
            normal: '400',
            medium: '500',
            bold: '700'
          }
        },
        spacing: {
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px'
        },
        borderRadius: {
          sm: '4px',
          md: '8px',
          lg: '12px'
        }
      }
      
      const result = generateComponentPrompt({ 
        componentName: 'Button', 
        tokens 
      })
      
      expect(result.messages[0].content.text).toContain('design tokens from your Tailwind v4 theme')
      expect(result.messages[0].content.text).toContain('primary')
      expect(result.messages[0].content.text).toContain('sm')
    })

    test('should include both principles and tokens', () => {
      const principles: DesignPrinciples = {
        brandIdentity: 'Modern Tech',
        targetAudience: 'Developers',
        coreValues: ['Simplicity'],
        visualPersonality: 'Clean',
        designGoals: ['Consistency'],
        constraints: ['WCAG AA']
      }
      
      const tokens: DesignTokens = {
        colors: { primary: '#3b82f6' },
        typography: { fonts: ['Inter'], sizes: { md: '16px' }, weights: { normal: '400' } },
        spacing: { md: '16px' },
        borderRadius: { md: '8px' }
      }
      
      const result = generateComponentPrompt({ 
        componentName: 'Button', 
        principles,
        tokens 
      })
      
      expect(result.messages[0].content.text).toContain('Design Principles to Follow')
      expect(result.messages[0].content.text).toContain('design tokens from your Tailwind v4 theme')
    })
  })

  describe('defineDesignPrinciplesPrompt', () => {
    test('should return prompt with no args', () => {
      const result = defineDesignPrinciplesPrompt()
      expect(result).toHaveProperty('messages')
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].content.text).toContain('north-star design principles')
      expect(result.messages[0].content.text).toContain('Brand Identity')
      expect(result.messages[0].content.text).toContain('Target Audience')
      expect(result.messages[0].content.text).toContain('Core Values')
      expect(result.messages[0].content.text).toContain('Visual Personality')
      expect(result.messages[0].content.text).toContain('Design Goals')
      expect(result.messages[0].content.text).toContain('Constraints')
    })

    test('should return prompt with args', () => {
      const result = defineDesignPrinciplesPrompt({ some: 'args' })
      expect(result).toHaveProperty('messages')
      expect(result.messages[0].content.text).toContain('north-star design principles')
    })
  })

  describe('planComponentLibraryPrompt', () => {
    test('should return prompt with no args', () => {
      const result = planComponentLibraryPrompt()
      expect(result).toHaveProperty('messages')
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].content.text).toContain('component library structure')
      expect(result.messages[0].content.text).toContain('Atoms')
      expect(result.messages[0].content.text).toContain('Molecules')
      expect(result.messages[0].content.text).toContain('Organisms')
      expect(result.messages[0].content.text).toContain('Button')
      expect(result.messages[0].content.text).toContain('Input')
      expect(result.messages[0].content.text).toContain('Navigation')
    })

    test('should include principles context', () => {
      const principles: DesignPrinciples = {
        brandIdentity: 'Modern Tech',
        targetAudience: 'Developers',
        coreValues: ['Simplicity', 'Accessibility'],
        visualPersonality: 'Clean and Professional',
        designGoals: ['Consistency', 'Usability'],
        constraints: ['WCAG AA', 'Mobile-first']
      }
      
      const result = planComponentLibraryPrompt({ principles })
      
      expect(result.messages[0].content.text).toContain('Based on your design principles')
      expect(result.messages[0].content.text).toContain('Brand: Modern Tech')
      expect(result.messages[0].content.text).toContain('Audience: Developers')
      expect(result.messages[0].content.text).toContain('Values: Simplicity, Accessibility')
      expect(result.messages[0].content.text).toContain('Goals: Consistency, Usability')
    })

    test('should include tokens context', () => {
      const tokens: DesignTokens = {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b'
        },
        typography: {
          fonts: ['Inter', 'Arial'],
          sizes: { md: '16px' },
          weights: { normal: '400' }
        },
        spacing: {
          sm: '8px',
          md: '16px'
        },
        borderRadius: { md: '8px' }
      }
      
      const result = planComponentLibraryPrompt({ tokens })
      
      expect(result.messages[0].content.text).toContain('Your design tokens include')
      expect(result.messages[0].content.text).toContain('Colors: primary, secondary')
      expect(result.messages[0].content.text).toContain('Typography: Inter, Arial')
      expect(result.messages[0].content.text).toContain('Spacing scale: sm, md')
    })

    test('should include both principles and tokens', () => {
      const principles: DesignPrinciples = {
        brandIdentity: 'Modern Tech',
        targetAudience: 'Developers',
        coreValues: ['Simplicity'],
        visualPersonality: 'Clean',
        designGoals: ['Consistency'],
        constraints: ['WCAG AA']
      }
      
      const tokens: DesignTokens = {
        colors: { primary: '#3b82f6' },
        typography: { fonts: ['Inter'], sizes: { md: '16px' }, weights: { normal: '400' } },
        spacing: { md: '16px' },
        borderRadius: { md: '8px' }
      }
      
      const result = planComponentLibraryPrompt({ principles, tokens })
      
      expect(result.messages[0].content.text).toContain('Based on your design principles')
      expect(result.messages[0].content.text).toContain('Your design tokens include')
    })
  })
})
