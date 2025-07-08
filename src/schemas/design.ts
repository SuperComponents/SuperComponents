// src/schemas/design.ts
import { z } from "zod";

// Design token schema for capturing design system tokens
export const TokenSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.object({})]), // Allow objects for complex values like box-shadows
  type: z.enum([
    'color', 
    'spacing', 
    'typography', 
    'shadow', 
    'border', 
    'radius',
    'elevation',
    'opacity',
    'durations',
    'zIndex',
    'easing',
    'size',
    'breakpoint',
    'animation',
    'transition',
    'other'
  ]),
  category: z.string().optional(),
  description: z.string().optional(),
});

// Individual component within a design - recursive type
export const DesignComponentSchema: z.ZodType<{
  id: string;
  name: string;
  type: string;
  props: Record<string, any>;
  children?: DesignComponent[];
  tokens?: string[];
}> = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.any()),
  children: z.array(z.lazy(() => DesignComponentSchema)).optional(),
  tokens: z.array(z.string()).optional(), // Token references used by this component
});

// Main Design schema as specified in the task
export const DesignSchema = z.object({
  id: z.string(),
  tokens: z.array(TokenSchema),
  components: z.array(DesignComponentSchema),
  metadata: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }).optional(),
});

// Export inferred TypeScript types
export type Token = z.infer<typeof TokenSchema>;
export type DesignComponent = z.infer<typeof DesignComponentSchema>;
export type Design = z.infer<typeof DesignSchema>;

// Legacy schemas for backward compatibility (can be removed later)
export const designSchema = DesignSchema;
export const designJsonSchema = DesignSchema; 