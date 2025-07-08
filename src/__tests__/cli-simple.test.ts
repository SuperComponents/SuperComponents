import { describe, it, expect } from 'vitest'
import { spawn } from 'child_process'

describe('CLI Simple Tests', () => {
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

  it('should exit with error for no input', async () => {
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
      const child = spawn('node', ['dist/cli.js'], {
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

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Error:')
  }, 15000)
})
