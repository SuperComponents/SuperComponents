// src/schemas/components.ts
import { z } from "zod";

export const componentSchema = z.object({
  // Component schema placeholder
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  components: z.array(z.string()).optional(),
});

export type Component = z.infer<typeof componentSchema>;

export const componentAnalysisSchema = z.object({
  // Component analysis schema placeholder
  components: z.array(z.string()).optional(),
  patterns: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

export type ComponentAnalysis = z.infer<typeof componentAnalysisSchema>; 