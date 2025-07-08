// src/utils/validation.ts
import { z } from "zod";

export function zodToJsonSchema(schema: z.ZodSchema): any {
  // Basic implementation - returns a simple schema object
  // In a real implementation, you'd convert Zod schema to JSON Schema
  return {
    type: "object",
    properties: {},
    additionalProperties: true
  };
}

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  // Implementation placeholder
  return schema.parse(input);
}

export function createValidationError(message: string): Error {
  // Implementation placeholder
  return new Error(message);
} 