// tests/schemas/instruction.test.ts
import { describe, it, expect } from '@jest/globals';
import { ZodError } from 'zod';
import { 
  InstructionSchema, 
  StepSchema, 
  FileContentSchema,
  InstructionContextSchema
} from '../../src/schemas';
import type { Instruction, Step, FileContent, InstructionContext } from '../../src/schemas';
import { validateInstruction } from '../../src/types';

describe('InstructionSchema', () => {
  describe('StepSchema', () => {
    it('should validate a complete step', () => {
      const validStep: Step = {
        id: 'step-1',
        title: 'Create Button Component',
        description: 'Create a reusable button component with multiple variants',
        order: 1,
        type: 'create',
        dependencies: ['step-0']
      };

      expect(() => StepSchema.parse(validStep)).not.toThrow();
      const result = StepSchema.parse(validStep);
      expect(result).toEqual(validStep);
    });

    it('should validate step with minimal required fields', () => {
      const minimalStep = {
        description: 'Simple step description'
      };

      expect(() => StepSchema.parse(minimalStep)).not.toThrow();
      const result = StepSchema.parse(minimalStep);
      expect(result.description).toBe('Simple step description');
    });

    it('should validate step with different types', () => {
      const stepTypes = ['create', 'modify', 'delete', 'configure', 'install', 'other'] as const;
      
      stepTypes.forEach(type => {
        const step = {
          description: `Step with ${type} type`,
          type: type
        };

        expect(() => StepSchema.parse(step)).not.toThrow();
      });
    });

    it('should reject step with invalid type', () => {
      const invalidStep = {
        description: 'Step with invalid type',
        type: 'invalid-type'
      };

      expect(() => StepSchema.parse(invalidStep)).toThrow(ZodError);
    });

    it('should reject step without description', () => {
      const incompleteStep = {
        title: 'Step without description'
      };

      expect(() => StepSchema.parse(incompleteStep)).toThrow(ZodError);
    });
  });

  describe('FileContentSchema', () => {
    it('should validate complete file content', () => {
      const validFileContent: FileContent = {
        path: '/components/Button.tsx',
        content: 'export const Button = () => <button>Click me</button>;',
        type: 'component',
        language: 'typescript',
        encoding: 'utf-8'
      };

      expect(() => FileContentSchema.parse(validFileContent)).not.toThrow();
      const result = FileContentSchema.parse(validFileContent);
      expect(result).toEqual(validFileContent);
    });

    it('should validate file content with minimal required fields', () => {
      const minimalFileContent = {
        path: '/test.txt',
        content: 'Hello world'
      };

      expect(() => FileContentSchema.parse(minimalFileContent)).not.toThrow();
      const result = FileContentSchema.parse(minimalFileContent);
      expect(result.encoding).toBe('utf-8'); // default value
    });

    it('should validate file content with different types', () => {
      const fileTypes = ['component', 'style', 'config', 'test', 'documentation', 'other'] as const;
      
      fileTypes.forEach(type => {
        const fileContent = {
          path: `/files/${type}.txt`,
          content: `Content for ${type}`,
          type: type
        };

        expect(() => FileContentSchema.parse(fileContent)).not.toThrow();
      });
    });

    it('should reject file content without required fields', () => {
      const incompleteFileContent = {
        path: '/test.txt'
        // missing content
      };

      expect(() => FileContentSchema.parse(incompleteFileContent)).toThrow(ZodError);
    });
  });

  describe('InstructionContextSchema', () => {
    it('should validate complete instruction context', () => {
      const validContext: InstructionContext = {
        framework: 'react',
        styleSystem: 'tailwind',
        testFramework: 'jest',
        buildTool: 'vite',
        packageManager: 'npm',
        typescript: true,
        additionalLibraries: ['framer-motion', 'react-hook-form'],
        targetDirectory: '/src/components',
        customInstructions: 'Use functional components and hooks'
      };

      expect(() => InstructionContextSchema.parse(validContext)).not.toThrow();
      const result = InstructionContextSchema.parse(validContext);
      expect(result).toEqual(validContext);
    });

    it('should validate context with minimal fields', () => {
      const minimalContext = {};

      expect(() => InstructionContextSchema.parse(minimalContext)).not.toThrow();
    });

    it('should validate context with some fields', () => {
      const partialContext = {
        framework: 'vue',
        typescript: false,
        additionalLibraries: ['vuex']
      };

      expect(() => InstructionContextSchema.parse(partialContext)).not.toThrow();
    });
  });

  describe('InstructionSchema', () => {
    it('should validate complete instruction', () => {
      const validInstruction: Instruction = {
        steps: [
          {
            id: 'step-1',
            title: 'Setup',
            description: 'Initialize the project structure',
            order: 1,
            type: 'create'
          },
          {
            id: 'step-2', 
            title: 'Implementation',
            description: 'Implement the main functionality',
            order: 2,
            type: 'create',
            dependencies: ['step-1']
          }
        ],
        files: {
          '/components/Button.tsx': 'export const Button = () => <button>Click me</button>;',
          '/styles/button.css': '.button { padding: 10px; }'
        },
        context: {
          framework: 'react',
          styleSystem: 'css',
          typescript: true
        }
      };

      expect(() => InstructionSchema.parse(validInstruction)).not.toThrow();
      const result = InstructionSchema.parse(validInstruction);
      expect(result.steps).toHaveLength(2);
      expect(Object.keys(result.files)).toHaveLength(2);
    });

    it('should validate instruction with minimal required fields', () => {
      const minimalInstruction: Instruction = {
        steps: [
          {
            description: 'Single step instruction'
          }
        ],
        files: {
          '/output.txt': 'Hello world'
        }
      };

      expect(() => InstructionSchema.parse(minimalInstruction)).not.toThrow();
    });

    it('should validate instruction with empty files', () => {
      const instructionWithEmptyFiles: Instruction = {
        steps: [
          {
            description: 'Step with no files'
          }
        ],
        files: {}
      };

      expect(() => InstructionSchema.parse(instructionWithEmptyFiles)).not.toThrow();
    });

    it('should reject instruction without required fields', () => {
      const incompleteInstruction = {
        steps: [
          {
            description: 'Test step'
          }
        ]
        // missing files
      };

      expect(() => InstructionSchema.parse(incompleteInstruction)).toThrow(ZodError);
    });

    it('should reject instruction with invalid steps', () => {
      const instructionWithInvalidSteps = {
        steps: [
          {
            // missing description
            title: 'Invalid step'
          }
        ],
        files: {}
      };

      expect(() => InstructionSchema.parse(instructionWithInvalidSteps)).toThrow(ZodError);
    });

    it('should handle complex instruction with many steps and files', () => {
      const complexInstruction: Instruction = {
        steps: Array.from({ length: 20 }, (_, i) => ({
          id: `step-${i + 1}`,
          title: `Step ${i + 1}`,
          description: `Description for step ${i + 1}`,
          order: i + 1,
          type: i % 2 === 0 ? 'create' : 'modify',
          dependencies: i > 0 ? [`step-${i}`] : []
        })),
        files: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [
            `/files/file-${i + 1}.tsx`,
            `// File ${i + 1} content\nexport const Component${i + 1} = () => <div>Content ${i + 1}</div>;`
          ])
        ),
        context: {
          framework: 'react',
          styleSystem: 'styled-components',
          testFramework: 'jest',
          buildTool: 'webpack',
          packageManager: 'yarn',
          typescript: true,
          additionalLibraries: ['react-router-dom', 'axios', 'lodash'],
          targetDirectory: '/src/components',
          customInstructions: 'Follow company coding standards and include comprehensive tests'
        }
      };

      expect(() => InstructionSchema.parse(complexInstruction)).not.toThrow();
    });
  });

  describe('validateInstruction utility function', () => {
    it('should return success for valid instruction', () => {
      const validInstruction: Instruction = {
        steps: [
          {
            description: 'Test step'
          }
        ],
        files: {
          '/test.txt': 'test content'
        }
      };

      const result = validateInstruction(validInstruction);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInstruction);
      expect(result.errors).toBeUndefined();
    });

    it('should return error details for invalid instruction', () => {
      const invalidInstruction = {
        steps: [
          {
            description: 'Valid step'
          }
        ]
        // missing files
      };

      const result = validateInstruction(invalidInstruction);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeInstanceOf(ZodError);
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!['files']).toContain('Required');
    });

    it('should handle nested validation errors in steps', () => {
      const instructionWithNestedErrors = {
        steps: [
          {
            description: 'Valid step'
          },
          {
            title: 'Invalid step'
            // missing description
          }
        ],
        files: {
          '/test.txt': 'content'
        }
      };

      const result = validateInstruction(instructionWithNestedErrors);
      expect(result.success).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(Object.keys(result.fieldErrors!)).toContain('steps.1.description');
    });
  });

  describe('Edge cases and performance', () => {
    it('should handle instruction with many files', () => {
      const instructionWithManyFiles: Instruction = {
        steps: [
          {
            description: 'Generate many files'
          }
        ],
        files: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [
            `/files/file-${i}.tsx`,
            `// File ${i}\nexport const Component${i} = () => <div>Component ${i}</div>;`
          ])
        )
      };

      expect(() => InstructionSchema.parse(instructionWithManyFiles)).not.toThrow();
    });

    it('should handle instruction with complex step dependencies', () => {
      const instructionWithComplexDependencies: Instruction = {
        steps: [
          {
            id: 'setup',
            description: 'Setup project',
            order: 1
          },
          {
            id: 'install-deps',
            description: 'Install dependencies',
            order: 2,
            dependencies: ['setup']
          },
          {
            id: 'create-components',
            description: 'Create components',
            order: 3,
            dependencies: ['setup', 'install-deps']
          },
          {
            id: 'add-styles',
            description: 'Add styles',
            order: 4,
            dependencies: ['create-components']
          },
          {
            id: 'add-tests',
            description: 'Add tests',
            order: 5,
            dependencies: ['create-components', 'add-styles']
          }
        ],
        files: {
          '/output.txt': 'final output'
        }
      };

      expect(() => InstructionSchema.parse(instructionWithComplexDependencies)).not.toThrow();
    });
  });

  describe('Error message quality', () => {
    it('should provide clear error messages for missing required fields', () => {
      try {
        InstructionSchema.parse({});
      } catch (error) {
        const zodError = error as ZodError;
        const issues = zodError.issues;
        
        expect(issues).toHaveLength(2); // steps, files
        expect(issues.find(i => i.path.includes('steps'))?.message).toBe('Required');
        expect(issues.find(i => i.path.includes('files'))?.message).toBe('Required');
      }
    });

    it('should provide clear error messages for invalid step types', () => {
      try {
        InstructionSchema.parse({
          steps: [
            {
              description: 'Valid step'
            },
            {
              description: 'Invalid step type',
              type: 'invalid-type'
            }
          ],
          files: {}
        });
      } catch (error) {
        const zodError = error as ZodError;
        const typeIssue = zodError.issues.find(i => 
          i.path.includes('steps') && i.path.includes('type')
        );
        
        expect(typeIssue?.message).toContain('Invalid enum value');
        expect(typeIssue?.message).toContain('create');
        expect(typeIssue?.message).toContain('modify');
      }
    });

    it('should provide clear error messages for invalid file encoding', () => {
      try {
        FileContentSchema.parse({
          path: '/test.txt',
          content: 'test content',
          encoding: 'invalid-encoding'
        });
      } catch (error) {
        const zodError = error as ZodError;
        const encodingIssue = zodError.issues.find(i => i.path.includes('encoding'));
        
        expect(encodingIssue?.message).toContain('Expected string');
      }
    });
  });
}); 