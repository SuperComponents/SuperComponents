// src/schemas/index.ts
// Aggregate and re-export all schemas as specified in the task
import { z } from 'zod';

// Design schemas and types
export {
  TokenSchema,
  DesignComponentSchema,
  DesignSchema,
  // Legacy exports for backward compatibility
  designSchema,
  designJsonSchema,
} from './design.js';

export type {
  Token,
  DesignComponent,
  Design,
} from './design.js';

// Component schemas and types
export {
  PropSchema,
  ComponentSchema,
  ComponentAnalysisSchema,
  // Legacy exports for backward compatibility
  componentSchema,
  componentAnalysisSchema,
} from './component.js';

export type {
  Prop,
  Component,
  ComponentAnalysis,
} from './component.js';

// Instruction schemas and types
export {
  StepSchema,
  FileContentSchema,
  InstructionSchema,
  InstructionContextSchema,
} from './instruction.js';

export type {
  Step,
  FileContent,
  Instruction,
  InstructionContext,
} from './instruction.js';

// Type inference examples for TypeScript usage (using z.infer)
import { DesignSchema } from './design.js';
import { ComponentSchema } from './component.js';
import { InstructionSchema } from './instruction.js';

export type DesignType = z.infer<typeof DesignSchema>;
export type ComponentType = z.infer<typeof ComponentSchema>;
export type InstructionType = z.infer<typeof InstructionSchema>; 