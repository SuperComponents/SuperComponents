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
} from './design';

export type {
  Token,
  DesignComponent,
  Design,
} from './design';

// Component schemas and types
export {
  PropSchema,
  ComponentSchema,
  ComponentAnalysisSchema,
  // Legacy exports for backward compatibility
  componentSchema,
  componentAnalysisSchema,
} from './component';

export type {
  Prop,
  Component,
  ComponentAnalysis,
} from './component';

// Instruction schemas and types
export {
  StepSchema,
  FileContentSchema,
  InstructionSchema,
  InstructionContextSchema,
} from './instruction';

export type {
  Step,
  FileContent,
  Instruction,
  InstructionContext,
} from './instruction';

// Type inference examples for TypeScript usage (using z.infer)
import { DesignSchema } from './design';
import { ComponentSchema } from './component';
import { InstructionSchema } from './instruction';

export type DesignType = z.infer<typeof DesignSchema>;
export type ComponentType = z.infer<typeof ComponentSchema>;
export type InstructionType = z.infer<typeof InstructionSchema>; 