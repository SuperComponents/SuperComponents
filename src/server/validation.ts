import { z } from 'zod';
import { getLogger } from '../utils/logger.js';
import { MCPError, MCPErrorCode, ValidationError } from './errors.js';

const logger = getLogger();

// MCP Protocol Schemas
export const MCPRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

export const MCPResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).optional(),
  result: z.unknown().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }).optional(),
});

// Tool-specific validation schemas
export const ToolParameterSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  schema: z.record(z.unknown()).optional(),
  required: z.boolean().optional(),
});

export const ToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.unknown()).optional(),
  parameters: z.array(ToolParameterSchema).optional(),
});

export const ToolCallSchema = z.object({
  name: z.string(),
  arguments: z.record(z.unknown()).optional(),
});

// Response validation schemas
export const ToolResultSchema = z.object({
  content: z.array(z.object({
    type: z.enum(['text', 'image', 'resource']),
    text: z.string().optional(),
    data: z.string().optional(),
    mimeType: z.string().optional(),
  })),
  isError: z.boolean().optional(),
});

// Validation context interface
export interface ValidationContext {
  requestId?: string;
  toolName?: string;
  timestamp?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  data?: unknown;
  context?: ValidationContext;
}

// Base validator interface
export interface Validator<T = unknown> {
  validate(data: unknown, context?: ValidationContext): ValidationResult;
  validateAsync?(data: unknown, context?: ValidationContext): Promise<ValidationResult>;
  schema: z.ZodSchema<T>;
}

// MCP Protocol Validator
export class MCPProtocolValidator implements Validator {
  public readonly schema = MCPRequestSchema;

  validate(data: unknown, context?: ValidationContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      context,
    };

    try {
      // Validate basic MCP structure
      const validated = this.schema.parse(data);
      result.data = validated;

      // Additional protocol-specific validations
      this.validateMethod(validated, result);
      this.validateJsonRpc(validated, result);
      this.validateId(validated, result);

      logger.debug('MCP protocol validation passed', {
        method: validated.method,
        requestId: context?.requestId,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => 
          new ValidationError(
            `Protocol validation failed: ${err.message} at path: ${err.path.join('.')}`,
            { path: err.path, code: err.code },
            { requestId: context?.requestId }
          )
        );
      } else {
        result.isValid = false;
        result.errors = [new ValidationError(
          `Unexpected validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {},
          { requestId: context?.requestId }
        )];
      }
    }

    return result;
  }

  private validateMethod(data: z.infer<typeof MCPRequestSchema>, result: ValidationResult): void {
    const validMethods = [
      'initialize',
      'tools/list',
      'tools/call',
      'resources/list',
      'resources/read',
      'prompts/list',
      'prompts/get',
      'sampling/createMessage',
      'ping',
    ];

    if (!validMethods.includes(data.method)) {
      result.warnings.push(`Unknown method: ${data.method}. This may not be supported.`);
    }
  }

  private validateJsonRpc(data: z.infer<typeof MCPRequestSchema>, result: ValidationResult): void {
    if (data.jsonrpc !== '2.0') {
             result.errors.push(new ValidationError(
         'Invalid JSON-RPC version. Expected "2.0"',
         {},
         { errorCode: MCPErrorCode.InvalidRequest }
       ));
       result.isValid = false;
    }
  }

  private validateId(data: z.infer<typeof MCPRequestSchema>, result: ValidationResult): void {
         if (data.id !== undefined && typeof data.id !== 'string' && typeof data.id !== 'number') {
       result.errors.push(new ValidationError(
         'Invalid request ID. Must be string or number',
         {},
         { errorCode: MCPErrorCode.InvalidRequest }
       ));
       result.isValid = false;
     }
  }
}

// Tool Parameter Validator
export class ToolParameterValidator implements Validator {
  public readonly schema = z.record(z.unknown());

  constructor(private toolSchema?: z.ZodSchema) {}

  validate(data: unknown, context?: ValidationContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      context,
    };

    try {
      // Use tool-specific schema if available, otherwise use generic schema
      const schema = this.toolSchema || this.schema;
      const validated = schema.parse(data);
      result.data = validated;

      // Additional tool-specific validations
      this.validateParameterTypes(validated, result, context);
      this.validateRequiredParameters(validated, result, context);

      logger.debug('Tool parameter validation passed', {
        toolName: context?.toolName,
        requestId: context?.requestId,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => 
          new ValidationError(
            `Parameter validation failed for ${context?.toolName || 'unknown tool'}: ${err.message}`,
            { path: err.path, code: err.code },
            { toolName: context?.toolName, requestId: context?.requestId }
          )
        );
      } else {
        result.isValid = false;
        result.errors = [new ValidationError(
          `Unexpected parameter validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {},
          { requestId: context?.requestId }
        )];
      }
    }

    return result;
  }

  private validateParameterTypes(data: unknown, result: ValidationResult, context?: ValidationContext): void {
    if (typeof data !== 'object' || data === null) {
      result.warnings.push('Parameters should be an object');
      return;
    }

    const params = data as Record<string, unknown>;
    
    // Check for potentially sensitive parameters
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    Object.keys(params).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        result.warnings.push(`Potentially sensitive parameter detected: ${key}`);
      }
    });
  }

  private validateRequiredParameters(data: unknown, result: ValidationResult, context?: ValidationContext): void {
    // This would be enhanced with actual tool schema requirements
    // For now, just log the validation
    logger.debug('Required parameter validation completed', {
      toolName: context?.toolName,
      paramCount: typeof data === 'object' && data ? Object.keys(data).length : 0,
    });
  }
}

// Response Validator
export class ResponseValidator implements Validator {
  public readonly schema = ToolResultSchema;

  validate(data: unknown, context?: ValidationContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      context,
    };

    try {
      // Validate response structure
      const validated = this.schema.parse(data);
      result.data = validated;

      // Additional response validations
      this.validateContentIntegrity(validated, result);
      this.validateErrorStatus(validated, result);

      logger.debug('Response validation passed', {
        contentCount: validated.content.length,
        isError: validated.isError,
        requestId: context?.requestId,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false;
        result.errors = error.errors.map(err => 
          new ValidationError(
            `Response validation failed: ${err.message} at path: ${err.path.join('.')}`,
            MCPErrorCode.INTERNAL_ERROR,
            { path: err.path, received: err.received }
          )
        );
      } else {
        result.isValid = false;
        result.errors = [new ValidationError(
          `Unexpected response validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          MCPErrorCode.INTERNAL_ERROR
        )];
      }
    }

    return result;
  }

  private validateContentIntegrity(data: z.infer<typeof ToolResultSchema>, result: ValidationResult): void {
    if (data.content.length === 0) {
      result.warnings.push('Response contains no content');
    }

    // Validate content types and data
    data.content.forEach((content, index) => {
      if (content.type === 'text' && !content.text) {
        result.warnings.push(`Content item ${index} has type 'text' but no text content`);
      }
      if (content.type === 'image' && !content.data) {
        result.warnings.push(`Content item ${index} has type 'image' but no data`);
      }
      if (content.type === 'resource' && !content.data) {
        result.warnings.push(`Content item ${index} has type 'resource' but no data`);
      }
    });
  }

  private validateErrorStatus(data: z.infer<typeof ToolResultSchema>, result: ValidationResult): void {
    if (data.isError && data.content.every(c => c.type !== 'text')) {
      result.warnings.push('Error response should contain text content explaining the error');
    }
  }
}

// Validation Pipeline
export class ValidationPipeline {
  private validators: Map<string, Validator> = new Map();

  constructor() {
    // Register default validators
    this.registerValidator('mcp-protocol', new MCPProtocolValidator());
    this.registerValidator('tool-parameters', new ToolParameterValidator());
    this.registerValidator('response', new ResponseValidator());
  }

  registerValidator(name: string, validator: Validator): void {
    this.validators.set(name, validator);
    logger.debug(`Registered validator: ${name}`);
  }

  unregisterValidator(name: string): boolean {
    const removed = this.validators.delete(name);
    if (removed) {
      logger.debug(`Unregistered validator: ${name}`);
    }
    return removed;
  }

  async validate(
    data: unknown,
    validatorNames: string[],
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const aggregatedResult: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      context,
    };

    for (const validatorName of validatorNames) {
      const validator = this.validators.get(validatorName);
      if (!validator) {
        aggregatedResult.warnings.push(`Unknown validator: ${validatorName}`);
        continue;
      }

      try {
        const result = validator.validateAsync
          ? await validator.validateAsync(data, context)
          : validator.validate(data, context);

        // Aggregate results
        if (!result.isValid) {
          aggregatedResult.isValid = false;
        }
        aggregatedResult.errors.push(...result.errors);
        aggregatedResult.warnings.push(...result.warnings);

        // Use the last successful validation's data
        if (result.isValid && result.data) {
          aggregatedResult.data = result.data;
        }

      } catch (error) {
        aggregatedResult.isValid = false;
        aggregatedResult.errors.push(new ValidationError(
          `Validator ${validatorName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          MCPErrorCode.INTERNAL_ERROR
        ));
      }
    }

    // Log validation results
    if (aggregatedResult.isValid) {
      logger.debug('Validation pipeline completed successfully', {
        validators: validatorNames,
        warnings: aggregatedResult.warnings.length,
        requestId: context?.requestId,
      });
    } else {
      logger.warn('Validation pipeline failed', {
        validators: validatorNames,
        errors: aggregatedResult.errors.length,
        warnings: aggregatedResult.warnings.length,
        requestId: context?.requestId,
      });
    }

    return aggregatedResult;
  }

  // Convenience methods for common validation scenarios
  async validateMCPRequest(data: unknown, context?: ValidationContext): Promise<ValidationResult> {
    return this.validate(data, ['mcp-protocol'], context);
  }

  async validateToolCall(data: unknown, context?: ValidationContext): Promise<ValidationResult> {
    return this.validate(data, ['tool-parameters'], context);
  }

  async validateResponse(data: unknown, context?: ValidationContext): Promise<ValidationResult> {
    return this.validate(data, ['response'], context);
  }

  async validateComplete(data: unknown, context?: ValidationContext): Promise<ValidationResult> {
    return this.validate(data, ['mcp-protocol', 'tool-parameters', 'response'], context);
  }

  // Get validation statistics
  getStatistics(): {
    registeredValidators: string[];
    validatorCount: number;
  } {
    return {
      registeredValidators: Array.from(this.validators.keys()),
      validatorCount: this.validators.size,
    };
  }
}

// Validation middleware factory
export interface ValidationMiddlewareOptions {
  skipValidation?: boolean;
  validatorNames?: string[];
  continueOnWarnings?: boolean;
  continueOnNonCriticalErrors?: boolean;
}

export function createValidationMiddleware(
  pipeline: ValidationPipeline,
  options: ValidationMiddlewareOptions = {}
) {
  return async (
    data: unknown,
    context: ValidationContext,
    next: (data: unknown, context: ValidationContext) => Promise<unknown>
  ): Promise<unknown> => {
    if (options.skipValidation) {
      return next(data, context);
    }

    const validatorNames = options.validatorNames || ['mcp-protocol'];
    const result = await pipeline.validate(data, validatorNames, context);

    // Handle validation warnings
    if (result.warnings.length > 0) {
      logger.warn('Validation warnings detected', {
        warnings: result.warnings,
        requestId: context.requestId,
      });

      if (!options.continueOnWarnings) {
        // Could choose to fail here if warnings are critical
        logger.debug('Continuing despite warnings');
      }
    }

    // Handle validation errors
    if (!result.isValid) {
      const criticalErrors = result.errors.filter(err => 
        err.code === MCPErrorCode.INVALID_REQUEST ||
        err.code === MCPErrorCode.INVALID_PARAMS
      );

      if (criticalErrors.length > 0 || !options.continueOnNonCriticalErrors) {
        throw result.errors[0]; // Throw the first error
      }
    }

    // Continue with validated data
    return next(result.data || data, context);
  };
}

// Default validation pipeline instance
export const defaultValidationPipeline = new ValidationPipeline();

// Export utility functions
export function createValidationError(
  message: string,
  code: MCPErrorCode = MCPErrorCode.INVALID_PARAMS,
  data?: unknown
): ValidationError {
  return new ValidationError(message, code, data);
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
} 