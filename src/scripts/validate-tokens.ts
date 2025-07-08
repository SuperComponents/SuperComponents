#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { W3CDesignTokensSchema } from '../types/index.js'

/**
 * Validates W3C Design Tokens v1 compliance
 */
function validateTokens(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const tokens = JSON.parse(content)
    
    // Validate with Zod schema
    const result = W3CDesignTokensSchema.safeParse(tokens)
    
    if (result.success) {
      console.log('✅ W3C Design Tokens v1 validation passed')
      return true
    } else {
      console.log('❌ W3C Design Tokens v1 validation failed:')
      console.log(result.error.issues.map((issue: any) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n'))
      return false
    }
  } catch (error) {
    console.error('❌ Failed to validate tokens:', error)
    return false
  }
}

// Get file path from CLI args or use default
const filePath = process.argv[2] || resolve('tokens/design-tokens.json')

console.log(`Validating tokens in: ${filePath}`)
const isValid = validateTokens(filePath)

process.exit(isValid ? 0 : 1)
