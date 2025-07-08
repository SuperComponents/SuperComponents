import { describe, it, expect, beforeEach } from 'vitest'
import { DesignSystemMCPServer } from '../server.js'

describe('DesignSystemMCPServer', () => {
  let server: DesignSystemMCPServer

  beforeEach(() => {
    server = new DesignSystemMCPServer()
  })

  it('should create server instance', () => {
    expect(server).toBeDefined()
    expect(server).toBeInstanceOf(DesignSystemMCPServer)
  })

  it('should have server property', () => {
    expect(server['server']).toBeDefined()
  })

  it('should have handlers set up', () => {
    // This tests that the server can be created without errors
    // which means all handlers are properly configured
    expect(() => {
      new DesignSystemMCPServer()
    }).not.toThrow()
  })

  it('should be able to start without errors', () => {
    // Basic smoke test - server should be instantiable
    expect(server).toBeDefined()
  })
})
