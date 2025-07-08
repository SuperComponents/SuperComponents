// tests/schemas/component.test.ts
import { describe, it, expect } from '@jest/globals';
import { ZodError } from 'zod';
import { 
  ComponentSchema, 
  PropSchema, 
  ComponentAnalysisSchema
} from '../../src/schemas';
import type { Component, Prop, ComponentAnalysis } from '../../src/schemas';
import { validateComponent } from '../../src/types';

describe('ComponentSchema', () => {
  describe('PropSchema', () => {
    it('should validate a complete prop definition', () => {
      const validProp: Prop = {
        name: 'variant',
        type: 'string',
        required: true,
        defaultValue: 'primary',
        description: 'Button variant style'
      };

      expect(() => PropSchema.parse(validProp)).not.toThrow();
      const result = PropSchema.parse(validProp);
      expect(result).toEqual(validProp);
    });

    it('should validate prop with minimal required fields', () => {
      const minimalProp = {
        name: 'size',
        type: 'string'
      };

      expect(() => PropSchema.parse(minimalProp)).not.toThrow();
      const result = PropSchema.parse(minimalProp);
      expect(result.required).toBe(false); // default value
    });

    it('should reject prop without required fields', () => {
      const incompleteProp = {
        type: 'string'
        // missing name
      };

      expect(() => PropSchema.parse(incompleteProp)).toThrow(ZodError);
    });
  });

  describe('ComponentSchema', () => {
    it('should validate a complete component', () => {
      const validComponent: Component = {
        name: 'Button',
        props: {
          variant: 'primary',
          size: 'medium',
          disabled: false
        },
        path: '/components/Button.tsx',
        description: 'A reusable button component',
        version: '1.0.0',
        dependencies: ['react', 'clsx'],
        exports: ['Button', 'ButtonProps'],
        propTypes: [
          {
            name: 'variant',
            type: 'string',
            required: false,
            defaultValue: 'primary'
          },
          {
            name: 'size',
            type: 'string',
            required: false,
            defaultValue: 'medium'
          }
        ]
      };

      expect(() => ComponentSchema.parse(validComponent)).not.toThrow();
      const result = ComponentSchema.parse(validComponent);
      expect(result.name).toBe('Button');
      expect(result.path).toBe('/components/Button.tsx');
    });

    it('should validate component with minimal required fields', () => {
      const minimalComponent: Component = {
        name: 'SimpleButton',
        props: {},
        path: '/components/SimpleButton.tsx'
      };

      expect(() => ComponentSchema.parse(minimalComponent)).not.toThrow();
    });

    it('should validate component with complex props', () => {
      const componentWithComplexProps: Component = {
        name: 'DataTable',
        props: {
          data: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ],
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' }
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 100
          },
          onRowClick: null,
          sortable: true
        },
        path: '/components/DataTable.tsx'
      };

      expect(() => ComponentSchema.parse(componentWithComplexProps)).not.toThrow();
    });

    it('should reject component without required fields', () => {
      const incompleteComponent = {
        name: 'IncompleteComponent'
        // missing props and path
      };

      expect(() => ComponentSchema.parse(incompleteComponent)).toThrow(ZodError);
    });

    it('should validate component with empty arrays', () => {
      const componentWithEmptyArrays: Component = {
        name: 'EmptyComponent',
        props: {},
        path: '/components/EmptyComponent.tsx',
        dependencies: [],
        exports: [],
        propTypes: []
      };

      expect(() => ComponentSchema.parse(componentWithEmptyArrays)).not.toThrow();
    });

    it('should validate component with nested propTypes', () => {
      const componentWithNestedPropTypes: Component = {
        name: 'FormField',
        props: {
          label: 'Email',
          type: 'email',
          required: true
        },
        path: '/components/FormField.tsx',
        propTypes: [
          {
            name: 'label',
            type: 'string',
            required: true,
            description: 'Field label'
          },
          {
            name: 'type',
            type: 'string',
            required: false,
            defaultValue: 'text',
            description: 'Input type'
          },
          {
            name: 'validation',
            type: 'object',
            required: false,
            description: 'Validation rules'
          }
        ]
      };

      expect(() => ComponentSchema.parse(componentWithNestedPropTypes)).not.toThrow();
    });
  });

  describe('ComponentAnalysisSchema', () => {
    it('should validate a complete component analysis', () => {
      const validAnalysis: ComponentAnalysis = {
        components: [
          {
            name: 'Button',
            props: { variant: 'primary' },
            path: '/components/Button.tsx'
          },
          {
            name: 'Card',
            props: { padding: 'medium' },
            path: '/components/Card.tsx'
          }
        ],
        patterns: [
          'Component uses TypeScript',
          'Component exports PropTypes',
          'Component has default props'
        ]
      };

      expect(() => ComponentAnalysisSchema.parse(validAnalysis)).not.toThrow();
      const result = ComponentAnalysisSchema.parse(validAnalysis);
      expect(result.components).toHaveLength(2);
      expect(result.patterns).toHaveLength(3);
    });

    it('should validate analysis with minimal data', () => {
      const minimalAnalysis: ComponentAnalysis = {
        components: []
      };

      expect(() => ComponentAnalysisSchema.parse(minimalAnalysis)).not.toThrow();
    });

    it('should reject analysis with invalid components', () => {
      const invalidAnalysis = {
        components: [
          {
            name: 'InvalidComponent'
            // missing props and path
          }
        ]
      };

      expect(() => ComponentAnalysisSchema.parse(invalidAnalysis)).toThrow(ZodError);
    });
  });

  describe('validateComponent utility function', () => {
    it('should return success for valid component', () => {
      const validComponent: Component = {
        name: 'TestComponent',
        props: { test: true },
        path: '/components/TestComponent.tsx'
      };

      const result = validateComponent(validComponent);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validComponent);
      expect(result.errors).toBeUndefined();
    });

    it('should return error details for invalid component', () => {
      const invalidComponent = {
        name: 'InvalidComponent'
        // missing props and path
      };

      const result = validateComponent(invalidComponent);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeInstanceOf(ZodError);
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!['props']).toContain('Required');
      expect(result.fieldErrors!['path']).toContain('Required');
    });

    it('should handle nested validation errors in propTypes', () => {
      const componentWithInvalidPropTypes = {
        name: 'ComponentWithInvalidPropTypes',
        props: {},
        path: '/components/Test.tsx',
        propTypes: [
          {
            name: 'validProp',
            type: 'string'
          },
          {
            // missing name and type
            required: true
          }
        ]
      };

      const result = validateComponent(componentWithInvalidPropTypes);
      expect(result.success).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(Object.keys(result.fieldErrors!)).toContain('propTypes.1.name');
      expect(Object.keys(result.fieldErrors!)).toContain('propTypes.1.type');
    });
  });

  describe('Edge cases and performance', () => {
    it('should handle component with many props', () => {
      const componentWithManyProps: Component = {
        name: 'ComponentWithManyProps',
        props: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`prop${i}`, `value${i}`])
        ),
        path: '/components/ComponentWithManyProps.tsx'
      };

      expect(() => ComponentSchema.parse(componentWithManyProps)).not.toThrow();
    });

    it('should handle component with deeply nested props', () => {
      const componentWithDeepProps: Component = {
        name: 'ComponentWithDeepProps',
        props: {
          level1: {
            level2: {
              level3: {
                level4: {
                  deepValue: 'test'
                }
              }
            }
          }
        },
        path: '/components/ComponentWithDeepProps.tsx'
      };

      expect(() => ComponentSchema.parse(componentWithDeepProps)).not.toThrow();
    });

    it('should handle special characters in component names and paths', () => {
      const componentWithSpecialChars: Component = {
        name: 'Component-With_Special$Characters',
        props: {
          'prop-with-dashes': 'value',
          'prop_with_underscores': 'value',
          'prop.with.dots': 'value'
        },
        path: '/components/special-chars/Component-With_Special$Characters.tsx'
      };

      expect(() => ComponentSchema.parse(componentWithSpecialChars)).not.toThrow();
    });
  });

  describe('Error message quality', () => {
    it('should provide clear error messages for missing required fields', () => {
      try {
        ComponentSchema.parse({});
      } catch (error) {
        const zodError = error as ZodError;
        const issues = zodError.issues;
        
        expect(issues).toHaveLength(3); // name, props, path
        expect(issues.find(i => i.path.includes('name'))?.message).toBe('Required');
        expect(issues.find(i => i.path.includes('props'))?.message).toBe('Required');
        expect(issues.find(i => i.path.includes('path'))?.message).toBe('Required');
      }
    });

    it('should provide clear error messages for invalid propTypes', () => {
      try {
        ComponentSchema.parse({
          name: 'TestComponent',
          props: {},
          path: '/test.tsx',
          propTypes: [
            {
              name: 'validProp',
              type: 'string'
            },
            {
              name: 123 // invalid type
            }
          ]
        });
      } catch (error) {
        const zodError = error as ZodError;
        const nameIssue = zodError.issues.find(i => 
          i.path.includes('propTypes') && i.path.includes('name')
        );
        
        expect(nameIssue?.message).toContain('Expected string');
      }
    });
  });
}); 