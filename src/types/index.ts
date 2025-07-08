export interface DesignPrinciples {
  brandIdentity: string
  targetAudience: string
  coreValues: string[]
  designGoals: string[]
  constraints?: string[]
}

export interface DesignTokens {
  colors: {
    [key: string]: string
  }
  typography: {
    fonts: string[]
    sizes: { [key: string]: string }
    weights: { [key: string]: number }
    lineHeights: { [key: string]: string }
  }
  spacing: {
    [key: string]: string
  }
  borderRadius: {
    [key: string]: string
  }
  shadows?: {
    [key: string]: string
  }
}

// W3C Design Tokens v1 schema interfaces
export interface W3CDesignToken {
  $type: string
  $value: any
  $description?: string
}

export interface W3CDesignTokens {
  [key: string]: W3CDesignToken | W3CDesignTokens
}

// Zod schema for W3C Design Tokens v1 validation
import { z } from 'zod'

export const W3CDesignTokenSchema = z.object({
  $type: z.string(),
  $value: z.any(),
  $description: z.string().optional(),
})

export const W3CDesignTokensSchema: z.ZodType<any> = z.lazy(() =>
  z.record(z.union([W3CDesignTokenSchema, W3CDesignTokensSchema]))
)

export interface DesignInsight {
  imageryPalette: string[] // hex colors, length ≤ 8
  typographyFamilies: string[] // font names
  spacingScale: number[] // e.g. [4,8,12,16]
  uiDensity: 'compact' | 'regular' | 'spacious'
  brandKeywords: string[]
  supportingReferences: string[] // image crop URLs or CSS snippets
}

export interface ComponentSpec {
  name: string
  category: 'atom' | 'molecule' | 'organism'
  description: string
  props?: Record<string, any>
  variants?: string[]
  accessibility?: string[]
  dependencies?: string[]
}
