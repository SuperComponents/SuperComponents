// src/schemas/instruction.ts
import { z } from "zod";

// Individual instruction step schema
export const StepSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string(),
  order: z.number().optional(),
  type: z.enum(['create', 'modify', 'delete', 'configure', 'install', 'other']).optional(),
  dependencies: z.array(z.string()).optional(),
});

// File content schema for generated files
export const FileContentSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: z.enum(['component', 'style', 'config', 'test', 'documentation', 'other']).optional(),
  language: z.string().optional(),
  encoding: z.string().default('utf-8'),
});

// Instruction schema as specified in the task
export const InstructionSchema = z.object({
  steps: z.array(StepSchema),
  files: z.record(z.string(), z.string()),
  // Additional useful fields for implementation guidance
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    estimatedTime: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    prerequisites: z.array(z.string()).optional(),
  }).optional(),
  detailedSteps: z.array(StepSchema).optional(),
  fileContents: z.array(FileContentSchema).optional(),
  validation: z.object({
    commands: z.array(z.string()).optional(),
    expectedOutputs: z.array(z.string()).optional(),
    testCases: z.array(z.string()).optional(),
  }).optional(),
  context: z.object({
    framework: z.string().optional(),
    styleSystem: z.string().optional(),
    testFramework: z.string().optional(),
    buildTool: z.string().optional(),
    packageManager: z.string().optional(),
    typescript: z.boolean().optional(),
    additionalLibraries: z.array(z.string()).optional(),
    targetDirectory: z.string().optional(),
    customInstructions: z.string().optional(),
  }).optional(),
});

// Instruction generation context schema
export const InstructionContextSchema = z.object({
  design: z.any().optional(), // Will reference DesignSchema when imported
  components: z.array(z.any()).optional(), // Will reference ComponentSchema when imported
  framework: z.string().optional(),
  styleSystem: z.string().optional(),
  testFramework: z.string().optional(),
  buildTool: z.string().optional(),
  packageManager: z.string().optional(),
  typescript: z.boolean().optional(),
  additionalLibraries: z.array(z.string()).optional(),
  targetDirectory: z.string().optional(),
  customInstructions: z.string().optional(),
  targetFramework: z.string().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

// Export inferred TypeScript types
export type Step = z.infer<typeof StepSchema>;
export type FileContent = z.infer<typeof FileContentSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;
export type InstructionContext = z.infer<typeof InstructionContextSchema>; 