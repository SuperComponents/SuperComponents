// src/schemas/component.ts
import { z } from "zod";

// Prop definition schema
export const PropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
});

// Component schema as specified in the task
export const ComponentSchema = z.object({
  name: z.string(),
  props: z.record(z.string(), z.any()),
  path: z.string(),
  // Additional useful fields for component analysis
  description: z.string().optional(),
  version: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  exports: z.array(z.string()).optional(),
  propTypes: z.array(PropSchema).optional(),
});

// Component analysis result schema
export const ComponentAnalysisSchema = z.object({
  components: z.array(ComponentSchema),
  patterns: z.array(z.string()).optional(),
  conventions: z.object({
    naming: z.array(z.string()).optional(),
    structure: z.array(z.string()).optional(),
    props: z.array(z.string()).optional(),
  }).optional(),
  recommendations: z.array(z.string()).optional(),
  errors: z.array(z.string()).optional(),
});

// Export inferred TypeScript types
export type Prop = z.infer<typeof PropSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type ComponentAnalysis = z.infer<typeof ComponentAnalysisSchema>;

// Legacy exports for backward compatibility
export const componentSchema = ComponentSchema;
export const componentAnalysisSchema = ComponentAnalysisSchema; 