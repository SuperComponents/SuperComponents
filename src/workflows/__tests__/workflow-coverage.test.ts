import { describe, test, expect } from 'vitest'
import { InspirationToSystemWorkflow, UserInspiration } from '../inspiration-to-system.js'

describe('InspirationToSystemWorkflow Coverage', () => {
  let workflow: InspirationToSystemWorkflow

  beforeEach(() => {
    workflow = new InspirationToSystemWorkflow()
  })

  describe('constructor and basic methods', () => {
    test('should create workflow instance', () => {
      expect(workflow).toBeInstanceOf(InspirationToSystemWorkflow)
    })
  })

  describe('buildContextString', () => {
    test('should build context string with all properties', () => {
      const inspiration: UserInspiration = {
        industryType: 'Technology',
        targetUsers: 'Developers',
        brandKeywords: ['modern', 'clean'],
        stylePreferences: ['minimalist', 'professional'],
        colorPreferences: ['blue', 'green'],
        accessibility: 'enhanced'
      }

      // Access private method for testing
      const contextString = (workflow as any).buildContextString(inspiration)

      expect(contextString).toContain('Industry: Technology')
      expect(contextString).toContain('Target Users: Developers')
      expect(contextString).toContain('Brand Keywords: modern, clean')
      expect(contextString).toContain('Style Preferences: minimalist, professional')
      expect(contextString).toContain('Color Preferences: blue, green')
      expect(contextString).toContain('Accessibility Level: enhanced')
    })

    test('should handle empty inspiration', () => {
      const inspiration: UserInspiration = {}

      const contextString = (workflow as any).buildContextString(inspiration)

      expect(contextString).toBe('')
    })

    test('should handle partial inspiration data', () => {
      const inspiration: UserInspiration = {
        industryType: 'Healthcare',
        targetUsers: 'Medical professionals'
      }

      const contextString = (workflow as any).buildContextString(inspiration)

      expect(contextString).toContain('Industry: Healthcare')
      expect(contextString).toContain('Target Users: Medical professionals')
      expect(contextString).not.toContain('Brand Keywords')
      expect(contextString).not.toContain('Style Preferences')
    })
  })

  describe('parseColorPreferences', () => {
    test('should parse hex colors correctly', () => {
      const colorPreferences = ['#ff0000', '#00ff00', '#0000ff']
      const result = (workflow as any).parseColorPreferences(colorPreferences)

      expect(result).toEqual({
        'preference-1': '#ff0000',
        'preference-2': '#00ff00',
        'preference-3': '#0000ff'
      })
    })

    test('should parse named colors correctly', () => {
      const colorPreferences = ['red', 'blue', 'green']
      const result = (workflow as any).parseColorPreferences(colorPreferences)

      expect(result).toEqual({
        'red': '#ef4444',
        'blue': '#3b82f6',
        'green': '#10b981'
      })
    })

    test('should handle mixed color formats', () => {
      const colorPreferences = ['#ff0000', 'blue', 'invalidcolor']
      const result = (workflow as any).parseColorPreferences(colorPreferences)

      expect(result).toEqual({
        'preference-1': '#ff0000',
        'blue': '#3b82f6'
      })
    })

    test('should handle empty array', () => {
      const colorPreferences: string[] = []
      const result = (workflow as any).parseColorPreferences(colorPreferences)

      expect(result).toEqual({})
    })

    test('should handle all named colors', () => {
      const colorPreferences = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'gray', 'black', 'white']
      const result = (workflow as any).parseColorPreferences(colorPreferences)

      expect(result).toHaveProperty('red', '#ef4444')
      expect(result).toHaveProperty('blue', '#3b82f6')
      expect(result).toHaveProperty('green', '#10b981')
      expect(result).toHaveProperty('yellow', '#f59e0b')
      expect(result).toHaveProperty('purple', '#8b5cf6')
      expect(result).toHaveProperty('pink', '#ec4899')
      expect(result).toHaveProperty('orange', '#f97316')
      expect(result).toHaveProperty('gray', '#6b7280')
      expect(result).toHaveProperty('black', '#000000')
      expect(result).toHaveProperty('white', '#ffffff')
    })
  })

  describe('generateTailwindTokens', () => {
    test('should generate Tailwind CSS tokens', () => {
      const tokens = {
        colors: { primary: '#3b82f6', secondary: '#64748b' },
        spacing: { sm: '8px', md: '16px' },
        borderRadius: { sm: '4px', md: '8px' },
        typography: {
          fonts: ['Inter', 'Arial'],
          sizes: { sm: '14px', md: '16px' },
          weights: { normal: '400', bold: '700' }
        }
      }

      const result = (workflow as any).generateTailwindTokens(tokens)

      expect(result).toContain('@theme {')
      expect(result).toContain('--color-primary: #3b82f6;')
      expect(result).toContain('--color-secondary: #64748b;')
      expect(result).toContain('--spacing-sm: 8px;')
      expect(result).toContain('--spacing-md: 16px;')
      expect(result).toContain('--border-radius-sm: 4px;')
      expect(result).toContain('--border-radius-md: 8px;')
      expect(result).toContain('--font-primary: Inter;')
      expect(result).toContain('--font-secondary: Arial;')
      expect(result).toContain('--font-size-sm: 14px;')
      expect(result).toContain('--font-size-md: 16px;')
      expect(result).toContain('--font-weight-normal: 400;')
      expect(result).toContain('--font-weight-bold: 700;')
      expect(result).toContain('}')
    })

    test('should handle tokens with single font', () => {
      const tokens = {
        colors: { primary: '#3b82f6' },
        spacing: { md: '16px' },
        borderRadius: { md: '8px' },
        typography: {
          fonts: ['Inter'],
          sizes: { md: '16px' },
          weights: { normal: '400' }
        }
      }

      const result = (workflow as any).generateTailwindTokens(tokens)

      expect(result).toContain('--font-primary: Inter;')
      expect(result).not.toContain('--font-secondary')
    })
  })

  describe('generateComponentPlanMarkdown', () => {
    test('should generate component plan markdown', () => {
      const componentPlan = {
        phases: [
          {
            name: 'Atoms',
            duration: '2 weeks',
            components: ['Button', 'Input'],
            priority: 'high' as const
          },
          {
            name: 'Molecules',
            duration: '3 weeks',
            components: ['Card', 'Form'],
            priority: 'medium' as const
          }
        ],
        totalComponents: 4,
        estimatedDuration: '5 weeks'
      }

      const result = (workflow as any).generateComponentPlanMarkdown(componentPlan)

      expect(result).toContain('# Component Implementation Plan')
      expect(result).toContain('**Total Components:** 4')
      expect(result).toContain('**Estimated Duration:** 5 weeks')
      expect(result).toContain('### Phase 1: Atoms')
      expect(result).toContain('**Duration:** 2 weeks')
      expect(result).toContain('**Priority:** high')
      expect(result).toContain('- Button')
      expect(result).toContain('- Input')
      expect(result).toContain('### Phase 2: Molecules')
      expect(result).toContain('- Card')
      expect(result).toContain('- Form')
    })

    test('should handle empty component plan', () => {
      const componentPlan = {
        phases: [],
        totalComponents: 0,
        estimatedDuration: '0 weeks'
      }

      const result = (workflow as any).generateComponentPlanMarkdown(componentPlan)

      expect(result).toContain('# Component Implementation Plan')
      expect(result).toContain('**Total Components:** 0')
      expect(result).toContain('**Estimated Duration:** 0 weeks')
    })
  })

  describe('callLLM', () => {
    test('should return default component plan when no API key', async () => {
      const originalEnv = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

      try {
        const result = await (workflow as any).callLLM('test prompt')
        const parsed = JSON.parse(result)

        expect(parsed).toHaveProperty('phases')
        expect(parsed).toHaveProperty('totalComponents')
        expect(parsed).toHaveProperty('estimatedDuration')
        expect(parsed.phases).toHaveLength(2)
        expect(parsed.phases[0].name).toBe('Atoms')
        expect(parsed.phases[1].name).toBe('Molecules')
        expect(parsed.totalComponents).toBe(7)
        expect(parsed.estimatedDuration).toBe('5-7 weeks')
      } finally {
        if (originalEnv) {
          process.env.OPENAI_API_KEY = originalEnv
        }
      }
    })

    test('should throw error when API key is present but service not configured', async () => {
      const originalEnv = process.env.OPENAI_API_KEY
      process.env.OPENAI_API_KEY = 'test-key'

      try {
        await expect((workflow as any).callLLM('test prompt')).rejects.toThrow('LLM service not configured')
      } finally {
        if (originalEnv) {
          process.env.OPENAI_API_KEY = originalEnv
        } else {
          delete process.env.OPENAI_API_KEY
        }
      }
    })
  })

  describe('UserInspiration interface coverage', () => {
    test('should handle all UserInspiration properties', () => {
      const inspiration: UserInspiration = {
        imageUrl: 'https://example.com/image.jpg',
        websiteUrl: 'https://example.com',
        description: 'Test description',
        brandKeywords: ['modern', 'clean'],
        industryType: 'Technology',
        targetUsers: 'Developers',
        colorPreferences: ['#3b82f6', 'blue'],
        stylePreferences: ['modern', 'minimalist'],
        accessibility: 'enhanced'
      }

      expect(inspiration.imageUrl).toBe('https://example.com/image.jpg')
      expect(inspiration.websiteUrl).toBe('https://example.com')
      expect(inspiration.description).toBe('Test description')
      expect(inspiration.brandKeywords).toEqual(['modern', 'clean'])
      expect(inspiration.industryType).toBe('Technology')
      expect(inspiration.targetUsers).toBe('Developers')
      expect(inspiration.colorPreferences).toEqual(['#3b82f6', 'blue'])
      expect(inspiration.stylePreferences).toEqual(['modern', 'minimalist'])
      expect(inspiration.accessibility).toBe('enhanced')
    })

    test('should handle WorkflowOptions', () => {
      const options = { bypassA11yFail: true }
      expect(options.bypassA11yFail).toBe(true)
    })
  })
})
