// src/schemas/design.ts
import { z } from "zod";

export const designSchema = z.object({
  // Design schema placeholder
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  code: z.string().optional(),
});

export type Design = z.infer<typeof designSchema>;

export const designJsonSchema = z.object({
  // Design JSON schema placeholder
  components: z.array(designSchema).optional(),
  tokens: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type DesignJson = z.infer<typeof designJsonSchema>; 