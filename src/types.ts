// src/types.ts
// Core schema types and utilities for SuperComponents

import { z } from 'zod';
import { 
  DesignSchema,
  ComponentSchema,
  InstructionSchema 
} from './schemas/index.js';
import type { 
  Design, 
  Component, 
  Instruction
} from './schemas/index.js';

// =====================
// Utility Types for Schema Operations
// =====================

// Partial update types for each main schema
export type PartialDesign = Partial<Design>;
export type PartialComponent = Partial<Component>;
export type PartialInstruction = Partial<Instruction>;

// Creation payload types (required fields only)
export type CreateDesignPayload = Pick<Design, 'id'> & Partial<Omit<Design, 'id'>>;
export type CreateComponentPayload = Pick<Component, 'name' | 'path'> & Partial<Omit<Component, 'name' | 'path'>>;
export type CreateInstructionPayload = Pick<Instruction, 'steps' | 'files'> & Partial<Omit<Instruction, 'steps' | 'files'>>;

// Update payload types (all fields optional except id for tracking)
export type UpdateDesignPayload = { id: string } & Partial<Omit<Design, 'id'>>;
export type UpdateComponentPayload = { name: string } & Partial<Omit<Component, 'name'>>;
export type UpdateInstructionPayload = Partial<Instruction>;

// =====================
// API Response Types
// =====================

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: string;
}

// Collection response with pagination
export interface CollectionResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

// Specific API response types
export type DesignResponse = ApiResponse<Design>;
export type ComponentResponse = ApiResponse<Component>;
export type InstructionResponse = ApiResponse<Instruction>;

export type DesignListResponse = ApiResponse<CollectionResponse<Design>>;
export type ComponentListResponse = ApiResponse<CollectionResponse<Component>>;
export type InstructionListResponse = ApiResponse<CollectionResponse<Instruction>>;

// =====================
// Validation Result Types
// =====================

// Schema validation result
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  fieldErrors?: Record<string, string[]>;
}

// Helper type for schema inference validation
export type InferSchemaType<T extends z.ZodType> = z.infer<T>;

// Schema types for runtime validation
export type DesignSchemaType = typeof DesignSchema;
export type ComponentSchemaType = typeof ComponentSchema;
export type InstructionSchemaType = typeof InstructionSchema;

// =====================
// MCP Tool Types
// =====================

// Tool schema type (can be Zod schema or JSON schema)
export type ToolSchema = z.ZodType<any> | Record<string, any>;

// Tool handler function type
export type ToolHandler = (args: any, context?: any) => Promise<any>;

// Tool capability types
export type ToolCapability = 
  | 'read-only'
  | 'write'
  | 'async'
  | 'batch'
  | 'streaming'
  | 'cached'
  | 'rate-limited';

// Tool metadata interface
export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  registeredAt: Date;
  lastUsed: Date | null;
  usageCount: number;
  enabled: boolean;
  author?: string;
  documentation?: string;
  examples?: Record<string, any>[];
}

// New Tool interface for registration system
export interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: ToolSchema;
  outputSchema?: ToolSchema;
  metadata: ToolMetadata;
  capabilities: ToolCapability[];
}

// Legacy Tool interface for backward compatibility (existing tools)
export interface Tool {
  definition: {
    name: string;
    description: string;
    inputSchema: any;
  };
  handler: (args: any) => Promise<any>;
}

// MCP tool request/response types
export interface MCPToolRequest<T = any> {
  tool: string;
  params: T;
  requestId?: string;
}

export interface MCPToolResponse<T = any> {
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  requestId?: string;
}

// Specific MCP tool types
export interface ParseDesignRequest {
  markdown: string;
  options?: {
    strict?: boolean;
    includeMetadata?: boolean;
  };
}

export interface AnalyzeComponentRequest {
  paths?: string[];
  includeProps?: boolean;
  includePatterns?: boolean;
}

export interface GenerateInstructionRequest {
  design: Design;
  components: Component[];
  options?: {
    framework?: string;
    styleSystem?: string;
    generateTests?: boolean;
  };
}

// =====================
// Error Types
// =====================

export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public zodError: z.ZodError,
    public fieldErrors: Record<string, string[]>
  ) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

export class MCPToolError extends Error {
  constructor(
    message: string,
    public code: number,
    public tool: string,
    public data?: any
  ) {
    super(message);
    this.name = 'MCPToolError';
  }
}

// =====================
// Type Guards
// =====================

// Helper functions to check if objects match our schemas
export const isDesign = (obj: any): obj is Design => {
  try {
    DesignSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
};

export const isComponent = (obj: any): obj is Component => {
  try {
    ComponentSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
};

export const isInstruction = (obj: any): obj is Instruction => {
  try {
    InstructionSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
};

// =====================
// Utility Functions for Type Inference
// =====================

// Create typed validation function
export function createValidator<T extends z.ZodType>(schema: T) {
  return (data: unknown): ValidationResult<z.infer<T>> => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });
        
        return {
          success: false,
          errors: error,
          fieldErrors,
        };
      }
      throw error;
    }
  };
}

// Validators for our main schemas
export const validateDesign = createValidator(DesignSchema);
export const validateComponent = createValidator(ComponentSchema);
export const validateInstruction = createValidator(InstructionSchema); 