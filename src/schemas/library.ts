// src/schemas/library.ts
import { z } from "zod";

export const librarySchema = z.object({
  // Library schema placeholder
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  components: z.array(z.string()).optional(),
});

export type Library = z.infer<typeof librarySchema>;

export const libraryAnalysisSchema = z.object({
  // Library analysis schema placeholder
  library: librarySchema,
  patterns: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

export type LibraryAnalysis = z.infer<typeof libraryAnalysisSchema>; 