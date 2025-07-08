// tests/schemas/design.test.ts
import { describe, it, expect } from '@jest/globals';
import { ZodError } from 'zod';
import { 
  DesignSchema, 
  TokenSchema, 
  DesignComponentSchema
} from '../../src/schemas';
import type { Design, Token, DesignComponent } from '../../src/schemas';
import { validateDesign } from '../../src/types';

describe('DesignSchema', () => {
  describe('TokenSchema', () => {
    it('should validate a valid token', () => {
      const validToken: Token = {
        name: 'primary-color',
        value: '#007bff',
        type: 'color',
        category: 'primary',
        description: 'Primary brand color'
      };

      expect(() => TokenSchema.parse(validToken)).not.toThrow();
      const result = TokenSchema.parse(validToken);
      expect(result).toEqual(validToken);
    });

    it('should validate token with minimal required fields', () => {
      const minimalToken: Token = {
        name: 'spacing-1',
        value: 8,
        type: 'spacing'
      };

      expect(() => TokenSchema.parse(minimalToken)).not.toThrow();
    });

    it('should reject token with invalid type', () => {
      const invalidToken = {
        name: 'test-token',
        value: 'test-value',
        type: 'invalid-type'
      };

      expect(() => TokenSchema.parse(invalidToken)).toThrow(ZodError);
    });

    it('should reject token without required fields', () => {
      const incompleteToken = {
        name: 'test-token'
        // missing value and type
      };

      expect(() => TokenSchema.parse(incompleteToken)).toThrow(ZodError);
    });
  });

  describe('DesignComponentSchema', () => {
    it('should validate a simple component', () => {
      const validComponent: DesignComponent = {
        id: 'button-1',
        name: 'Primary Button',
        type: 'button',
        props: {
          variant: 'primary',
          size: 'medium'
        }
      };

      expect(() => DesignComponentSchema.parse(validComponent)).not.toThrow();
    });

    it('should validate component with children (recursive)', () => {
      const componentWithChildren: DesignComponent = {
        id: 'card-1',
        name: 'Card Component',
        type: 'card',
        props: {
          padding: '16px'
        },
        children: [
          {
            id: 'card-header',
            name: 'Card Header',
            type: 'header',
            props: { title: 'Test Card' }
          },
          {
            id: 'card-body',
            name: 'Card Body',
            type: 'div',
            props: { content: 'Test content' },
            children: [
              {
                id: 'inner-button',
                name: 'Action Button',
                type: 'button',
                props: { text: 'Click me' }
              }
            ]
          }
        ]
      };

      expect(() => DesignComponentSchema.parse(componentWithChildren)).not.toThrow();
    });

    it('should validate component with token references', () => {
      const componentWithTokens: DesignComponent = {
        id: 'styled-button',
        name: 'Styled Button',
        type: 'button',
        props: {
          backgroundColor: 'var(--primary-color)',
          padding: 'var(--spacing-2)'
        },
        tokens: ['primary-color', 'spacing-2']
      };

      expect(() => DesignComponentSchema.parse(componentWithTokens)).not.toThrow();
    });

    it('should reject component without required fields', () => {
      const incompleteComponent = {
        name: 'Test Component'
        // missing id, type, and props
      };

      expect(() => DesignComponentSchema.parse(incompleteComponent)).toThrow(ZodError);
    });
  });

  describe('DesignSchema', () => {
    const validDesign: Design = {
      id: 'design-1',
      tokens: [
        {
          name: 'primary-color',
          value: '#007bff',
          type: 'color'
        },
        {
          name: 'spacing-base',
          value: 16,
          type: 'spacing'
        }
      ],
      components: [
        {
          id: 'button-1',
          name: 'Primary Button',
          type: 'button',
          props: {
            variant: 'primary'
          }
        }
      ],
      metadata: {
        name: 'Test Design System',
        description: 'A test design system',
        version: '1.0.0'
      }
    };

    it('should validate a complete design', () => {
      expect(() => DesignSchema.parse(validDesign)).not.toThrow();
      const result = DesignSchema.parse(validDesign);
      expect(result.id).toBe('design-1');
      expect(result.tokens).toHaveLength(2);
      expect(result.components).toHaveLength(1);
    });

    it('should validate design with minimal required fields', () => {
      const minimalDesign: Design = {
        id: 'minimal-design',
        tokens: [],
        components: []
      };

      expect(() => DesignSchema.parse(minimalDesign)).not.toThrow();
    });

    it('should validate design without metadata', () => {
      const designWithoutMetadata = {
        id: 'design-2',
        tokens: [],
        components: []
      };

      expect(() => DesignSchema.parse(designWithoutMetadata)).not.toThrow();
    });

    it('should reject design without required fields', () => {
      const incompleteDesign = {
        tokens: [],
        components: []
        // missing id
      };

      expect(() => DesignSchema.parse(incompleteDesign)).toThrow(ZodError);
    });

    it('should reject design with invalid tokens array', () => {
      const designWithInvalidTokens = {
        id: 'design-3',
        tokens: [
          {
            name: 'invalid-token'
            // missing required fields
          }
        ],
        components: []
      };

      expect(() => DesignSchema.parse(designWithInvalidTokens)).toThrow(ZodError);
    });

    it('should handle complex nested design structure', () => {
      const complexDesign: Design = {
        id: 'complex-design',
        tokens: Array.from({ length: 50 }, (_, i) => ({
          name: `token-${i}`,
          value: i % 2 === 0 ? `#${i.toString(16).padStart(6, '0')}` : i * 4,
          type: i % 2 === 0 ? 'color' as const : 'spacing' as const
        })),
        components: [
          {
            id: 'root-component',
            name: 'Root',
            type: 'container',
            props: {},
            children: Array.from({ length: 10 }, (_, i) => ({
              id: `child-${i}`,
              name: `Child ${i}`,
              type: 'element',
              props: { index: i }
            }))
          }
        ],
        metadata: {
          name: 'Complex Design System',
          description: 'A complex design with many tokens and nested components',
          version: '2.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      expect(() => DesignSchema.parse(complexDesign)).not.toThrow();
    });
  });

  describe('validateDesign utility function', () => {
    it('should return success for valid design', () => {
      const validDesign: Design = {
        id: 'test-design',
        tokens: [],
        components: []
      };

      const result = validateDesign(validDesign);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validDesign);
      expect(result.errors).toBeUndefined();
    });

    it('should return error details for invalid design', () => {
      const invalidDesign = {
        tokens: [],
        components: []
        // missing id
      };

      const result = validateDesign(invalidDesign);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeInstanceOf(ZodError);
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!['id']).toContain('Required');
    });

    it('should handle deeply nested validation errors', () => {
      const designWithNestedError = {
        id: 'test-design',
        tokens: [
          {
            name: 'valid-token',
            value: '#fff',
            type: 'color'
          },
          {
            name: 'invalid-token'
            // missing required fields
          }
        ],
        components: []
      };

      const result = validateDesign(designWithNestedError);
      expect(result.success).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(Object.keys(result.fieldErrors!)).toContain('tokens.1.value');
      expect(Object.keys(result.fieldErrors!)).toContain('tokens.1.type');
    });
  });

  describe('Error message quality', () => {
    it('should provide clear error messages for missing required fields', () => {
      try {
        DesignSchema.parse({});
      } catch (error) {
        const zodError = error as ZodError;
        const issues = zodError.issues;
        
        expect(issues).toHaveLength(3); // id, tokens, components
        expect(issues.find(i => i.path.includes('id'))?.message).toBe('Required');
        expect(issues.find(i => i.path.includes('tokens'))?.message).toBe('Required');
        expect(issues.find(i => i.path.includes('components'))?.message).toBe('Required');
      }
    });

    it('should provide clear error messages for invalid enum values', () => {
      try {
        TokenSchema.parse({
          name: 'test',
          value: 'test',
          type: 'invalid-type'
        });
      } catch (error) {
        const zodError = error as ZodError;
        const typeIssue = zodError.issues.find(i => i.path.includes('type'));
        
        expect(typeIssue?.message).toContain('Invalid enum value');
        expect(typeIssue?.message).toContain('color');
        expect(typeIssue?.message).toContain('spacing');
      }
    });
  });
}); 