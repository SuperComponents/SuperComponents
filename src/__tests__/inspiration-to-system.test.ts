import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import {
  InspirationToSystemWorkflow,
  UserInspiration,
} from '../workflows/inspiration-to-system.js'

describe('InspirationToSystemWorkflow', () => {
  let workflow: InspirationToSystemWorkflow
  let testOutputDir: string

  beforeEach(() => {
    workflow = new InspirationToSystemWorkflow()
    testOutputDir = path.join(__dirname, '../../test-output')
  })

  afterEach(async () => {
    // Clean up test output directory
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  it('should create output directory structure with mocked AI analyzer', async () => {
    const inspiration: UserInspiration = {
      description: 'Modern tech startup design',
      brandKeywords: ['modern', 'tech', 'clean'],
      industryType: 'technology',
      targetUsers: 'developers',
      stylePreferences: ['modern', 'minimalist'],
      colorPreferences: ['#3b82f6', '#10b981'],
      accessibility: 'enhanced',
    }

    // Mock the AI analyzer to avoid requiring OpenAI API key
    const mockAnalyzer = {
      analyzeInspiration: vi.fn().mockResolvedValue({
        insights: {
          imageryPalette: ['#3b82f6', '#10b981', '#f59e0b'],
          typographyFamilies: ['Inter', 'SF Pro Display'],
          spacingScale: [4, 8, 16, 24, 32, 48],
          uiDensity: 'regular',
          brandKeywords: ['modern', 'tech', 'clean'],
          supportingReferences: ['Clean interface', 'Modern typography'],
        },
        designRationale: 'A modern tech-focused design system',
        extractedTokens: {
          colors: { primary: '#3b82f6', secondary: '#10b981' },
          typography: {
            fonts: ['Inter'],
            sizes: {},
            weights: {},
            lineHeights: {},
          },
          spacing: { sm: '8px', md: '16px' },
          borderRadius: { sm: '4px' },
          shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)' },
        },
        inferredPrinciples: {
          brandIdentity: 'modern, tech, clean',
          targetAudience: 'developers',
          coreValues: ['Simplicity', 'Performance', 'Reliability'],
          designGoals: ['Maintain clean aesthetics', 'Ensure fast performance'],
        },
      }),
    }

    // Replace the AI analyzer with our mock
    ;(workflow as any).aiAnalyzer = mockAnalyzer

    const result = await workflow.generateDesignSystem(
      inspiration,
      testOutputDir,
      { bypassA11yFail: true }
    )

    // Verify result structure
    expect(result).toBeDefined()
    expect(result.tokens).toBeDefined()
    expect(result.principles).toBeDefined()
    expect(result.componentPlan).toBeDefined()
    expect(result.implementationGuide).toBeDefined()
    expect(result.insights).toBeDefined()

    // Verify tokens structure
    expect(result.tokens.colors).toBeDefined()
    expect(result.tokens.typography).toBeDefined()
    expect(result.tokens.spacing).toBeDefined()

    // Verify principles structure
    expect(result.principles.brandIdentity).toBeDefined()
    expect(result.principles.targetAudience).toBeDefined()
    expect(result.principles.coreValues).toBeDefined()
    expect(result.principles.designGoals).toBeDefined()

    // Verify component plan structure
    expect(result.componentPlan.phases).toBeDefined()
    expect(result.componentPlan.totalComponents).toBeDefined()
    expect(result.componentPlan.estimatedDuration).toBeDefined()

    // Verify files were created
    const metadataPath = path.join(
      testOutputDir,
      '.supercomponents',
      'metadata.json'
    )
    const readmePath = path.join(testOutputDir, 'README.md')
    const principlesPath = path.join(testOutputDir, 'PRINCIPLES.md')
    const tokensPath = path.join(
      testOutputDir,
      'src',
      'tokens',
      'tokens.json'
    )

    expect(
      await fs
        .access(metadataPath)
        .then(() => true)
        .catch(() => false)
    ).toBe(true)
    expect(
      await fs
        .access(readmePath)
        .then(() => true)
        .catch(() => false)
    ).toBe(true)
    expect(
      await fs
        .access(principlesPath)
        .then(() => true)
        .catch(() => false)
    ).toBe(true)
    expect(
      await fs
        .access(tokensPath)
        .then(() => true)
        .catch(() => false)
    ).toBe(true)

    // Verify metadata content
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)

    expect(metadata.version).toBe('1.0.0')
    expect(metadata.generatedAt).toBeDefined()
    expect(metadata.inspiration).toEqual(inspiration)
    expect(metadata.workflow).toBe('inspiration-to-system')

    // Verify AI analyzer was called with correct parameters
    expect(mockAnalyzer.analyzeInspiration).toHaveBeenCalledWith(inspiration)
  }, 30000) // 30 second timeout for AI calls

  it('should handle different inspiration types', () => {
    const inspirations = [
      { imageUrl: 'https://example.com/image.jpg' },
      { websiteUrl: 'https://example.com' },
      { description: 'Modern design system' },
    ]

    inspirations.forEach((inspiration) => {
      expect(() => {
        new InspirationToSystemWorkflow()
      }).not.toThrow()
    })
  })

  it('should validate user inspiration input', () => {
    const validInspiration: UserInspiration = {
      description: 'Test design',
      brandKeywords: ['modern'],
      accessibility: 'basic',
    }

    expect(validInspiration).toBeDefined()
    expect(validInspiration.description).toBe('Test design')
    expect(validInspiration.brandKeywords).toContain('modern')
    expect(validInspiration.accessibility).toBe('basic')
  })

  it('should handle AI analyzer errors gracefully', async () => {
    const inspiration: UserInspiration = {
      description: 'Test design',
      brandKeywords: ['modern'],
      accessibility: 'basic',
    }

    // Mock AI analyzer to throw error
    const failingAnalyzer = {
      analyzeInspiration: vi.fn().mockRejectedValue(new Error('LLM service not configured')),
    }

    ;(workflow as any).aiAnalyzer = failingAnalyzer

    await expect(workflow.generateDesignSystem(inspiration, testOutputDir))
      .rejects.toThrow('LLM service not configured')
  })

  it('should create proper directory structure', async () => {
    const inspiration: UserInspiration = {
      description: 'Test design',
      brandKeywords: ['modern'],
      accessibility: 'basic',
    }

    const mockAnalyzer = {
      analyzeInspiration: vi.fn().mockResolvedValue({
        insights: {
          imageryPalette: ['#3b82f6'],
          typographyFamilies: ['Inter'],
          spacingScale: [8, 16, 24],
          uiDensity: 'regular',
          brandKeywords: ['modern'],
          supportingReferences: ['Clean interface'],
        },
        designRationale: 'A modern design system',
        extractedTokens: {
          colors: { primary: '#3b82f6' },
          typography: { fonts: ['Inter'], sizes: {}, weights: {}, lineHeights: {} },
          spacing: { sm: '8px' },
          borderRadius: { sm: '4px' },
          shadows: { sm: '0 1px 2px rgba(0,0,0,0.1)' },
        },
        inferredPrinciples: {
          brandIdentity: 'modern',
          targetAudience: 'users',
          coreValues: ['Simplicity'],
          designGoals: ['Maintain clean aesthetics'],
        },
      }),
    }

    ;(workflow as any).aiAnalyzer = mockAnalyzer

    await workflow.generateDesignSystem(inspiration, testOutputDir, { bypassA11yFail: true })

    // Check directory structure
    const srcDir = path.join(testOutputDir, 'src')
    const tokensDir = path.join(srcDir, 'tokens')
    const supercomponentsDir = path.join(testOutputDir, '.supercomponents')

    expect(
      await fs.access(srcDir).then(() => true).catch(() => false)
    ).toBe(true)
    expect(
      await fs.access(tokensDir).then(() => true).catch(() => false)
    ).toBe(true)
    expect(
      await fs.access(supercomponentsDir).then(() => true).catch(() => false)
    ).toBe(true)
  })
})
