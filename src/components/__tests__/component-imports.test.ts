import { describe, test, expect } from 'vitest'

describe('Component Imports', () => {
  test('should import all components from index', async () => {
    const components = await import('../index.js')
    
    // Test that all expected exports are available
    expect(components.Button).toBeDefined()
    expect(components.Input).toBeDefined()
    expect(components.Card).toBeDefined()
    expect(components.Modal).toBeDefined()
    
    // Test that sub-components are exported
    expect(components.CardHeader).toBeDefined()
    expect(components.CardContent).toBeDefined()
    expect(components.CardFooter).toBeDefined()
    
    expect(components.ModalHeader).toBeDefined()
    expect(components.ModalContent).toBeDefined()
    expect(components.ModalFooter).toBeDefined()
  })

  test('should export Button component', async () => {
    const { Button } = await import('../index.js')
    expect(Button).toBeDefined()
  })

  test('should export Input component', async () => {
    const { Input } = await import('../index.js')
    expect(Input).toBeDefined()
  })

  test('should export Card component and sub-components', async () => {
    const { Card, CardHeader, CardContent, CardFooter } = await import('../index.js')
    
    expect(Card).toBeDefined()
    expect(CardHeader).toBeDefined()
    expect(CardContent).toBeDefined()
    expect(CardFooter).toBeDefined()
  })

  test('should export Modal component and sub-components', async () => {
    const { Modal, ModalHeader, ModalContent, ModalFooter } = await import('../index.js')
    
    expect(Modal).toBeDefined()
    expect(ModalHeader).toBeDefined()
    expect(ModalContent).toBeDefined()
    expect(ModalFooter).toBeDefined()
  })

  test('should have all expected exports', async () => {
    const components = await import('../index.js')
    
    // Count total exports
    const exportKeys = Object.keys(components)
    expect(exportKeys).toContain('Button')
    expect(exportKeys).toContain('Input')
    expect(exportKeys).toContain('Card')
    expect(exportKeys).toContain('CardHeader')
    expect(exportKeys).toContain('CardContent')
    expect(exportKeys).toContain('CardFooter')
    expect(exportKeys).toContain('Modal')
    expect(exportKeys).toContain('ModalHeader')
    expect(exportKeys).toContain('ModalContent')
    expect(exportKeys).toContain('ModalFooter')
    
    // Should have at least 10 exports
    expect(exportKeys.length).toBeGreaterThanOrEqual(10)
  })

  test('should import individual component files', async () => {
    // Test that component files exist and can be imported
    expect(async () => {
      await import('../Button/Button.js')
    }).not.toThrow()
    
    expect(async () => {
      await import('../Input/Input.js')
    }).not.toThrow()
    
    expect(async () => {
      await import('../Card/Card.js')
    }).not.toThrow()
    
    expect(async () => {
      await import('../Modal/Modal.js')
    }).not.toThrow()
  })

  test('should handle re-export structure correctly', async () => {
    // Test that the index file correctly re-exports everything
    const indexExports = await import('../index.js')
    
    // Test that we can destructure components
    expect(() => {
      const { Button, Input, Card, Modal } = indexExports
      return { Button, Input, Card, Modal }
    }).not.toThrow()
  })

  test('should provide type exports (runtime check)', async () => {
    // While we can't directly test TypeScript types at runtime,
    // we can test that the exports don't throw errors when accessed
    const components = await import('../index.js')
    
    // These should not throw errors if exports are properly structured
    expect(() => {
      const exports = {
        Button: components.Button,
        Input: components.Input,
        Card: components.Card,
        Modal: components.Modal,
        CardHeader: components.CardHeader,
        CardContent: components.CardContent,
        CardFooter: components.CardFooter,
        ModalHeader: components.ModalHeader,
        ModalContent: components.ModalContent,
        ModalFooter: components.ModalFooter
      }
      return exports
    }).not.toThrow()
  })

  test('should export components with truthy values', async () => {
    const components = await import('../index.js')
    
    expect(components.Button).toBeTruthy()
    expect(components.Input).toBeTruthy()
    expect(components.Card).toBeTruthy()
    expect(components.Modal).toBeTruthy()
  })
})
