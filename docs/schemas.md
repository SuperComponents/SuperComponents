# Schema Documentation

This document provides comprehensive documentation for all Zod schemas used in the SuperComponents Server project, including validation rules, usage examples, and integration guidelines.

## Table of Contents

- [Overview](#overview)
- [Design Schemas](#design-schemas)
- [Component Schemas](#component-schemas)
- [Instruction Schemas](#instruction-schemas)
- [Type Inference](#type-inference)
- [Validation Utilities](#validation-utilities)
- [Integration Examples](#integration-examples)
- [Error Handling](#error-handling)
- [Migration Guide](#migration-guide)

## Overview

SuperComponents Server uses [Zod](https://zod.dev/) for runtime schema validation and TypeScript type inference. All schemas are designed to validate data at API boundaries, ensuring type safety throughout the application.

### Key Features

- **Runtime Validation**: Catch invalid data at runtime before it causes issues
- **Type Inference**: Automatically generate TypeScript types from schemas
- **Clear Error Messages**: Detailed validation errors with field-specific messages
- **Composable**: Schemas can be combined and extended as needed
- **Performance**: Optimized for validation of complex nested structures

## Design Schemas

### TokenSchema

Validates design system tokens (colors, spacing, typography, etc.).

```typescript
import { TokenSchema } from '../src/schemas';

// Validation
const token = {
  name: 'primary-color',
  value: '#007bff',
  type: 'color',
  category: 'primary',
  description: 'Primary brand color'
};

const result = TokenSchema.parse(token);
```

#### Schema Definition

```typescript
export const TokenSchema = z.object({
  name: z.string(),                    // Required: Token identifier
  value: z.union([z.string(), z.number()]), // Required: Token value
  type: z.enum(['color', 'spacing', 'typography', 'shadow', 'border', 'other']), // Required
  category: z.string().optional(),     // Optional: Grouping category
  description: z.string().optional(),  // Optional: Human-readable description
});
```

#### Valid Examples

```typescript
// Color token
{
  name: 'primary-500',
  value: '#3b82f6',
  type: 'color'
}

// Spacing token
{
  name: 'spacing-lg',
  value: 24,
  type: 'spacing',
  category: 'layout'
}

// Typography token
{
  name: 'font-heading',
  value: 'Inter, sans-serif',
  type: 'typography',
  description: 'Primary heading font'
}
```

### DesignComponentSchema

Validates individual components within a design with support for recursive nesting.

```typescript
import { DesignComponentSchema } from '../src/schemas';

const component = {
  id: 'button-primary',
  name: 'Primary Button',
  type: 'button',
  props: {
    variant: 'primary',
    size: 'medium'
  },
  tokens: ['primary-color', 'spacing-md']
};

const result = DesignComponentSchema.parse(component);
```

#### Schema Definition

```typescript
export const DesignComponentSchema = z.object({
  id: z.string(),                      // Required: Unique component identifier
  name: z.string(),                    // Required: Human-readable name
  type: z.string(),                    // Required: Component type/category
  props: z.record(z.string(), z.any()), // Required: Component properties
  children: z.array(z.lazy(() => DesignComponentSchema)).optional(), // Recursive nesting
  tokens: z.array(z.string()).optional(), // Token references
});
```

#### Nested Component Example

```typescript
{
  id: 'card-product',
  name: 'Product Card',
  type: 'card',
  props: {
    padding: 'lg',
    shadow: 'md'
  },
  children: [
    {
      id: 'card-header',
      name: 'Card Header',
      type: 'header',
      props: { title: 'Product Name' }
    },
    {
      id: 'card-body',
      name: 'Card Body',
      type: 'div',
      props: { content: 'Product description...' },
      children: [
        {
          id: 'cta-button',
          name: 'Call to Action',
          type: 'button',
          props: { text: 'Buy Now', variant: 'primary' }
        }
      ]
    }
  ],
  tokens: ['shadow-md', 'spacing-lg', 'primary-color']
}
```

### DesignSchema

Top-level schema for complete design systems containing tokens and components.

```typescript
import { DesignSchema } from '../src/schemas';

const design = {
  id: 'mobile-app-v1',
  tokens: [/* array of tokens */],
  components: [/* array of components */],
  metadata: {
    name: 'Mobile App Design System',
    version: '1.0.0',
    description: 'Complete design system for mobile application'
  }
};

const result = DesignSchema.parse(design);
```

#### Schema Definition

```typescript
export const DesignSchema = z.object({
  id: z.string(),                      // Required: Unique design identifier
  tokens: z.array(TokenSchema),        // Required: Design tokens array
  components: z.array(DesignComponentSchema), // Required: Components array
  metadata: z.object({                 // Optional: Additional metadata
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }).optional(),
});
```

## Component Schemas

### PropSchema

Validates component prop definitions for documentation and type generation.

```typescript
import { PropSchema } from '../src/schemas';

const prop = {
  name: 'variant',
  type: 'string',
  required: false,
  defaultValue: 'primary',
  description: 'Button styling variant'
};

const result = PropSchema.parse(prop);
```

#### Schema Definition

```typescript
export const PropSchema = z.object({
  name: z.string(),                    // Required: Prop name
  type: z.string(),                    // Required: TypeScript type
  required: z.boolean().default(false), // Optional: Required flag
  defaultValue: z.any().optional(),    // Optional: Default value
  description: z.string().optional(),  // Optional: Documentation
});
```

### ComponentSchema

Validates analyzed React/Vue components with their props and metadata.

```typescript
import { ComponentSchema } from '../src/schemas';

const component = {
  name: 'Button',
  props: {
    variant: 'primary',
    size: 'medium',
    disabled: false
  },
  path: '/components/Button.tsx',
  description: 'Reusable button component',
  dependencies: ['react', 'clsx'],
  exports: ['Button', 'ButtonProps']
};

const result = ComponentSchema.parse(component);
```

#### Schema Definition

```typescript
export const ComponentSchema = z.object({
  name: z.string(),                    // Required: Component name
  props: z.record(z.string(), z.any()), // Required: Component props
  path: z.string(),                    // Required: File path
  description: z.string().optional(),  // Optional: Component description
  version: z.string().optional(),      // Optional: Version number
  dependencies: z.array(z.string()).optional(), // Optional: NPM dependencies
  exports: z.array(z.string()).optional(), // Optional: Exported names
  propTypes: z.array(PropSchema).optional(), // Optional: Prop definitions
});
```

### ComponentAnalysisSchema

Validates the result of component library analysis.

```typescript
import { ComponentAnalysisSchema } from '../src/schemas';

const analysis = {
  components: [/* array of ComponentSchema */],
  patterns: [
    'Components use TypeScript',
    'Consistent prop naming',
    'Default exports preferred'
  ]
};

const result = ComponentAnalysisSchema.parse(analysis);
```

## Instruction Schemas

### StepSchema

Validates individual implementation steps.

```typescript
import { StepSchema } from '../src/schemas';

const step = {
  id: 'step-1',
  title: 'Create Button Component',
  description: 'Implement a reusable button with variants',
  order: 1,
  type: 'create',
  dependencies: ['step-0']
};

const result = StepSchema.parse(step);
```

### InstructionSchema

Validates complete implementation instructions.

```typescript
import { InstructionSchema } from '../src/schemas';

const instruction = {
  steps: [
    {
      description: 'Create the button component file',
      type: 'create'
    },
    {
      description: 'Add TypeScript interfaces',
      type: 'modify'
    }
  ],
  files: {
    '/components/Button.tsx': '/* component code */',
    '/types/Button.ts': '/* type definitions */'
  }
};

const result = InstructionSchema.parse(instruction);
```

## Type Inference

All schemas provide automatic TypeScript type inference using `z.infer<>`.

```typescript
import { z } from 'zod';
import { DesignSchema, ComponentSchema, InstructionSchema } from '../src/schemas';

// Inferred types
type Design = z.infer<typeof DesignSchema>;
type Component = z.infer<typeof ComponentSchema>;
type Instruction = z.infer<typeof InstructionSchema>;

// Use in functions
function processDesign(design: Design) {
  // TypeScript knows the exact shape of design
  console.log(design.id);        // string
  console.log(design.tokens);    // Token[]
  console.log(design.components); // DesignComponent[]
}
```

## Validation Utilities

The project provides utility functions for common validation patterns.

### Basic Validation

```typescript
import { validateDesign, validateComponent, validateInstruction } from '../src/types';

// Validate with detailed error reporting
const result = validateDesign(potentiallyInvalidData);

if (result.success) {
  // Data is valid and typed
  const design = result.data; // Design type
} else {
  // Handle validation errors
  console.error(result.errors); // ZodError
  console.log(result.fieldErrors); // { field: string[] }
}
```

### Custom Validator Creation

```typescript
import { createValidator } from '../src/types';
import { TokenSchema } from '../src/schemas';

// Create a reusable validator
const validateToken = createValidator(TokenSchema);

// Use the validator
const result = validateToken(unknownData);
```

### Type Guards

```typescript
import { isDesign, isComponent, isInstruction } from '../src/types';

// Runtime type checking
if (isDesign(unknownObject)) {
  // TypeScript knows this is a Design
  console.log(unknownObject.tokens);
}
```

## Integration Examples

### API Route Validation

```typescript
import { DesignSchema } from '../src/schemas';
import { validateDesign } from '../src/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate incoming data
    const validation = validateDesign(body);
    
    if (!validation.success) {
      return Response.json(
        { 
          error: 'Validation failed',
          details: validation.fieldErrors 
        },
        { status: 400 }
      );
    }
    
    // Use validated data
    const design = validation.data;
    // ... process design
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
```

### Form Validation

```typescript
import { ComponentSchema } from '../src/schemas';
import { validateComponent } from '../src/types';

function validateComponentForm(formData: FormData) {
  const componentData = {
    name: formData.get('name'),
    props: JSON.parse(formData.get('props') || '{}'),
    path: formData.get('path'),
  };
  
  const result = validateComponent(componentData);
  
  if (!result.success) {
    // Show field-specific errors
    Object.entries(result.fieldErrors || {}).forEach(([field, errors]) => {
      showFieldError(field, errors[0]);
    });
    return false;
  }
  
  return result.data;
}
```

### MCP Tool Integration

```typescript
import { DesignSchema } from '../src/schemas';

export const parseDesignTool = {
  definition: {
    name: 'parseDesign',
    description: 'Parse design from markdown',
    inputSchema: {
      type: 'object',
      properties: {
        markdown: { type: 'string' }
      }
    }
  },
  handler: async (args: { markdown: string }) => {
    try {
      // Parse markdown to design object
      const designData = parseMarkdownToDesign(args.markdown);
      
      // Validate with schema
      const design = DesignSchema.parse(designData);
      
      return { success: true, design };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: 'Validation failed',
          details: error.format()
        };
      }
      throw error;
    }
  }
};
```

## Error Handling

### Validation Error Structure

```typescript
try {
  DesignSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Structured error information
    error.issues.forEach(issue => {
      console.log(`Field: ${issue.path.join('.')}`);
      console.log(`Error: ${issue.message}`);
      console.log(`Value: ${issue.received}`);
    });
  }
}
```

### Custom Error Messages

```typescript
const CustomTokenSchema = z.object({
  name: z.string().min(1, 'Token name cannot be empty'),
  value: z.union([z.string(), z.number()], {
    errorMap: () => ({ message: 'Token value must be string or number' })
  }),
  type: z.enum(['color', 'spacing'], {
    errorMap: () => ({ message: 'Token type must be color or spacing' })
  })
});
```

### Error Response Helpers

```typescript
import { z } from 'zod';

export function formatValidationError(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  
  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  });
  
  return {
    message: 'Validation failed',
    fieldErrors,
    totalErrors: error.issues.length
  };
}
```

## Migration Guide

### Updating Schemas

When schemas need to be updated, follow these guidelines:

1. **Additive Changes** (safe):
   ```typescript
   // Adding optional fields
   const UpdatedSchema = OriginalSchema.extend({
     newField: z.string().optional()
   });
   ```

2. **Breaking Changes** (requires migration):
   ```typescript
   // Renaming fields, changing types, adding required fields
   const V2Schema = z.object({
     // ... new structure
   });
   
   // Provide migration function
   function migrateV1ToV2(v1Data: V1Type): V2Type {
     return {
       // ... transformation logic
     };
   }
   ```

3. **Versioned Schemas**:
   ```typescript
   export const DesignSchemaV1 = z.object({
     // v1 definition
   });
   
   export const DesignSchemaV2 = z.object({
     // v2 definition
   });
   
   // Union for backward compatibility
   export const DesignSchema = z.union([DesignSchemaV2, DesignSchemaV1])
     .transform(data => {
       if (isV1(data)) {
         return migrateV1ToV2(data);
       }
       return data;
     });
   ```

### Best Practices

- **Always validate at boundaries**: API endpoints, file I/O, external integrations
- **Use type inference**: Let Zod generate TypeScript types automatically
- **Provide clear error messages**: Help users understand what went wrong
- **Test edge cases**: Include tests for invalid data, large datasets, deep nesting
- **Document breaking changes**: Maintain clear migration paths for schema updates
- **Performance considerations**: For large datasets, consider streaming validation

### Common Patterns

```typescript
// Optional fields with defaults
const SchemaWithDefaults = z.object({
  name: z.string(),
  active: z.boolean().default(true),
  priority: z.number().default(0)
});

// Conditional validation
const ConditionalSchema = z.object({
  type: z.enum(['user', 'admin']),
  permissions: z.array(z.string())
}).refine(data => {
  if (data.type === 'admin') {
    return data.permissions.length > 0;
  }
  return true;
}, {
  message: 'Admin users must have at least one permission'
});

// Transform and preprocess
const ProcessedSchema = z.string()
  .transform(val => val.trim().toLowerCase())
  .pipe(z.string().min(1, 'Cannot be empty after trimming'));
```

This documentation should be kept updated as schemas evolve and new patterns emerge in the codebase. 