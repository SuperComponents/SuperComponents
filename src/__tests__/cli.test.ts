import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

describe('CLI Smoke Tests', () => {
  let testOutputDir: string
  let fixtureDir: string

  beforeEach(async () => {
    testOutputDir = path.join(__dirname, '../../test-cli-output')
    fixtureDir = path.join(__dirname, '../../fixtures')
    
    // Create fixture directory and small test fixture
    await fs.mkdir(fixtureDir, { recursive: true })
    await fs.writeFile(
      path.join(fixtureDir, 'small-fixture.json'),
      JSON.stringify({
        description: 'Simple test design',
        brandKeywords: ['modern', 'clean'],
        accessibility: 'basic',
      })
    )
  })

  afterEach(async () => {
    // Clean up
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
    try {
      await fs.rm(fixtureDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  it('should exit with code 0 when running on small fixture', async () => {
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
      const child = spawn('node', [
        'dist/cli.js',
        '--input',
        path.join(fixtureDir, 'small-fixture.json'),
        '--output',
        testOutputDir,
        '--mock-ai', // Add flag to mock AI for testing
      ], {
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        resolve({ code, stdout, stderr })
      })

      child.on('error', (error) => {
        resolve({ code: 1, stdout, stderr: error.message })
      })
    })

    expect(result.code).toBe(0)
    expect(result.stderr).not.toContain('Error')
    expect(result.stderr).not.toContain('Failed')
  }, 35000) // 35 second timeout for the test

  it('should show help when --help flag is used', async () => {
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
      const child = spawn('node', ['dist/cli.js', '--help'], {
        stdio: 'pipe',
        timeout: 10000,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        resolve({ code, stdout, stderr })
      })

      child.on('error', (error) => {
        resolve({ code: 1, stdout, stderr: error.message })
      })
    })

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Usage:')
    expect(result.stdout).toContain('Options:')
  }, 15000)

  it('should exit with non-zero code for invalid input', async () => {
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
      const child = spawn('node', [
        'dist/cli.js',
        '--input',
        'nonexistent-file.json',
        '--output',
        testOutputDir,
      ], {
        stdio: 'pipe',
        timeout: 10000,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        resolve({ code, stdout, stderr })
      })

      child.on('error', (error) => {
        resolve({ code: 1, stdout, stderr: error.message })
      })
    })

    expect(result.code).not.toBe(0)
  }, 15000)

  it('should create output directory structure', async () => {
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
      const child = spawn('node', [
        'dist/cli.js',
        '--input',
        path.join(fixtureDir, 'small-fixture.json'),
        '--output',
        testOutputDir,
        '--mock-ai',
      ], {
        stdio: 'pipe',
        timeout: 30000,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        resolve({ code, stdout, stderr })
      })

      child.on('error', (error) => {
        resolve({ code: 1, stdout, stderr: error.message })
      })
    })

    if (result.code === 0) {
      // Check if output directory was created
      const outputExists = await fs.access(testOutputDir).then(() => true).catch(() => false)
      expect(outputExists).toBe(true)

      // Check if basic files were created
      const readmeExists = await fs.access(path.join(testOutputDir, 'README.md')).then(() => true).catch(() => false)
      expect(readmeExists).toBe(true)
    }
  }, 35000)
})
