// src/server/middleware.ts
import { z } from 'zod';
import { 
  MCPError, 
  MCPErrorCode, 
  errorHandler,
  ToolExecutionError,
  ValidationError,
  ToolNotFoundError,
  createValidationError,
  toMCPError
} from './errors.js';
import { ToolRegistry, ToolExecutionContext } from './tools.js';
import { getLogger, Logger } from '../utils/logger.js';
import { defaultValidationPipeline, ValidationContext } from './validation.js';

// =====================
// Middleware Types
// =====================

export interface MiddlewareContext {
  requestId: string;
  timestamp: Date;
  toolName?: string;
  args?: any;
  metadata?: Record<string, any>;
}

export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<any>
) => Promise<any>;

export type ErrorMiddlewareFunction = (
  error: unknown,
  context: MiddlewareContext,
  next: (error?: unknown) => Promise<any>
) => Promise<any>;

// =====================
// Request Middleware
// =====================

/**
 * Request ID generation middleware
 */
export function requestIdMiddleware(): MiddlewareFunction {
  return async (context: MiddlewareContext, next: () => Promise<any>) => {
    if (!context.requestId) {
      context.requestId = `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    return next();
  };
}

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(): MiddlewareFunction {
  const logger = getLogger();
  
  return async (context: MiddlewareContext, next: () => Promise<any>) => {
    const startTime = Date.now();
    
    logger.debug('📥 MCP Request started', {
      requestId: context.requestId,
      toolName: context.toolName,
      timestamp: context.timestamp.toISOString(),
    });

    try {
      const result = await next();
      const duration = Date.now() - startTime;
      
      logger.debug('📤 MCP Request completed', {
        requestId: context.requestId,
        toolName: context.toolName,
        duration,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.warn('📤 MCP Request failed', {
        requestId: context.requestId,
        toolName: context.toolName,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  };
}

/**
 * Request validation middleware
 */
export function requestValidationMiddleware(schema?: z.ZodSchema): MiddlewareFunction {
  return async (context: MiddlewareContext, next: () => Promise<any>) => {
    if (schema && context.args) {
      try {
        context.args = schema.parse(context.args);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createValidationError(error, {
            requestId: context.requestId,
            toolName: context.toolName,
          });
        }
        throw error;
      }
    }
    return next();
  };
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): MiddlewareFunction {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return async (context: MiddlewareContext, next: () => Promise<any>) => {
    const now = Date.now();
    const key = context.toolName || 'global';
    
    // Clean up expired entries
    for (const [k, v] of requests.entries()) {
      if (v.resetTime <= now) {
        requests.delete(k);
      }
    }
    
    // Check current tool's rate limit
    const current = requests.get(key);
    if (current) {
      if (current.count >= maxRequests) {
        const retryAfter = Math.ceil((current.resetTime - now) / 1000);
        throw new MCPError(
          MCPErrorCode.RateLimitExceeded,
          `Rate limit exceeded for ${key}. Try again in ${retryAfter} seconds.`,
          { retryAfter },
          { requestId: context.requestId, toolName: context.toolName }
        );
      }
      current.count++;
    } else {
      requests.set(key, { count: 1, resetTime: now + windowMs });
    }
    
    return next();
  };
}

/**
 * Tool execution timeout middleware
 */
export function timeoutMiddleware(timeoutMs: number = 30000): MiddlewareFunction {
  return async (context: MiddlewareContext, next: () => Promise<any>) => {
    return Promise.race([
      next(),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new MCPError(
            MCPErrorCode.TimeoutError,
            `Request timed out after ${timeoutMs}ms`,
            { timeout: timeoutMs },
            { requestId: context.requestId, toolName: context.toolName }
          ));
        }, timeoutMs);
      })
    ]);
  };
}

/**
 * MCP protocol validation middleware
 */
export function mcpValidationMiddleware(
  options: {
    validateRequest?: boolean;
    validateParameters?: boolean;
    validateResponse?: boolean;
    continueOnWarnings?: boolean;
  } = {}
): MiddlewareFunction {
  const { 
    validateRequest = true,
    validateParameters = true,
    validateResponse = false,
    continueOnWarnings = true
  } = options;
  
  return async (context: MiddlewareContext, next: () => Promise<any>) => {
    const validationContext: ValidationContext = {
      requestId: context.requestId,
      timestamp: context.timestamp.toISOString(),
      toolName: context.toolName,
    };

    // Validate request structure if enabled
    if (validateRequest && context.args) {
      try {
        const result = await defaultValidationPipeline.validateMCPRequest(context.args, validationContext);
        if (!result.isValid) {
          const errors = result.errors.map((e: ValidationError) => e.message).join(', ');
          throw new ValidationError(
            `MCP request validation failed: ${errors}`,
            result.errors,
            validationContext
          );
        }
        if (result.warnings.length > 0 && !continueOnWarnings) {
          const warnings = result.warnings.join(', ');
          throw new ValidationError(
            `MCP request validation warnings: ${warnings}`,
            result.warnings,
            validationContext
          );
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(
          `MCP request validation error: ${error instanceof Error ? error.message : String(error)}`,
          error,
          validationContext
        );
      }
    }

    // Validate tool parameters if enabled
    if (validateParameters && context.args) {
      try {
        const result = await defaultValidationPipeline.validateToolCall(context.args, validationContext);
        if (!result.isValid) {
          const errors = result.errors.map((e: ValidationError) => e.message).join(', ');
          throw new ValidationError(
            `Tool parameter validation failed: ${errors}`,
            result.errors,
            validationContext
          );
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(
          `Tool parameter validation error: ${error instanceof Error ? error.message : String(error)}`,
          error,
          validationContext
        );
      }
    }

    // Execute the next middleware/handler
    const result = await next();

    // Validate response if enabled
    if (validateResponse && result) {
      try {
        const validationResult = await defaultValidationPipeline.validateResponse(result, validationContext);
        if (!validationResult.isValid) {
          const errors = validationResult.errors.map((e: ValidationError) => e.message).join(', ');
          throw new ValidationError(
            `Response validation failed: ${errors}`,
            validationResult.errors,
            validationContext
          );
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(
          `Response validation error: ${error instanceof Error ? error.message : String(error)}`,
          error,
          validationContext
        );
      }
    }

    return result;
  };
}

// =====================
// Error Middleware
// =====================

/**
 * Global error handling middleware
 */
export function errorHandlingMiddleware(): ErrorMiddlewareFunction {
  return async (
    error: unknown,
    context: MiddlewareContext,
    next: (error?: unknown) => Promise<any>
  ) => {
    // Handle specific error types
    if (error instanceof z.ZodError) {
      const validationError = createValidationError(error, {
        requestId: context.requestId,
        toolName: context.toolName,
      });
      return next(validationError);
    }
    
    if (error instanceof MCPError) {
      return next(error);
    }
    
    // Convert unknown errors to MCPError
    const mcpError = toMCPError(error, {
      requestId: context.requestId,
      toolName: context.toolName,
    });
    
    return next(mcpError);
  };
}

/**
 * Tool execution error handling middleware
 */
export function toolErrorHandlingMiddleware(): ErrorMiddlewareFunction {
  return async (
    error: unknown,
    context: MiddlewareContext,
    next: (error?: unknown) => Promise<any>
  ) => {
    if (!context.toolName) {
      return next(error);
    }
    
    // Convert to tool execution error if not already an MCPError
    if (!(error instanceof MCPError)) {
      const toolError = new ToolExecutionError(
        error instanceof Error ? error.message : String(error),
        context.toolName,
        error instanceof Error ? { stack: error.stack } : undefined,
        { requestId: context.requestId }
      );
      return next(toolError);
    }
    
    return next(error);
  };
}

/**
 * Error recovery middleware
 */
export function errorRecoveryMiddleware(): ErrorMiddlewareFunction {
  const logger = getLogger();
  
  return async (
    error: unknown,
    context: MiddlewareContext,
    next: (error?: unknown) => Promise<any>
  ) => {
    const mcpError = toMCPError(error);
    
    // Log error with context
    logger.error('🚨 Error in middleware chain', {
      error: mcpError.getLogDetails(),
      context: {
        requestId: context.requestId,
        toolName: context.toolName,
        timestamp: context.timestamp.toISOString(),
      },
    });
    
    // Don't propagate the error further - it's been handled
    throw mcpError;
  };
}

// =====================
// Middleware Composer
// =====================

/**
 * Compose multiple middleware functions into a single execution chain
 */
export class MiddlewareComposer {
  private middleware: MiddlewareFunction[] = [];
  private errorMiddleware: ErrorMiddlewareFunction[] = [];
  private logger: Logger;

  constructor() {
    this.logger = getLogger();
  }

  /**
   * Add request middleware
   */
  public use(middleware: MiddlewareFunction): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Add error middleware
   */
  public useError(errorMiddleware: ErrorMiddlewareFunction): this {
    this.errorMiddleware.push(errorMiddleware);
    return this;
  }

  /**
   * Execute middleware chain
   */
  public async execute(
    context: MiddlewareContext,
    finalHandler: () => Promise<any>
  ): Promise<any> {
    let index = 0;

    const next = async (): Promise<any> => {
      if (index >= this.middleware.length) {
        return finalHandler();
      }

      const middleware = this.middleware[index++];
      return middleware(context, next);
    };

    try {
      return await next();
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  /**
   * Handle errors through error middleware chain
   */
  private async handleError(error: unknown, context: MiddlewareContext): Promise<any> {
    let index = 0;
    let currentError = error;

    const nextError = async (err?: unknown): Promise<any> => {
      if (err) {
        currentError = err;
      }

      if (index >= this.errorMiddleware.length) {
        throw currentError;
      }

      const errorMiddleware = this.errorMiddleware[index++];
      return errorMiddleware(currentError, context, nextError);
    };

    return nextError();
  }

  /**
   * Create a tool execution wrapper with middleware
   */
  public createToolWrapper(toolRegistry: ToolRegistry) {
    return async (toolName: string, args: any, executionContext?: Partial<ToolExecutionContext>) => {
      const context: MiddlewareContext = {
        requestId: executionContext?.requestId || `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
        toolName,
        args,
        metadata: executionContext?.metadata,
      };

      const finalHandler = async () => {
        const tool = toolRegistry.getTool(toolName);
        if (!tool) {
          throw new ToolNotFoundError(toolName, toolRegistry.getAllTools().map(t => t.name));
        }

        if (!tool.metadata.enabled) {
          throw new MCPError(
            MCPErrorCode.ToolNotFound,
            `Tool '${toolName}' is disabled`,
            undefined,
            { toolName, requestId: context.requestId }
          );
        }

        return toolRegistry.execute(toolName, context.args, {
          ...executionContext,
          requestId: context.requestId,
          timestamp: context.timestamp,
        });
      };

      return this.execute(context, finalHandler);
    };
  }
}

// =====================
// Default Middleware Stack
// =====================

/**
 * Create default middleware stack for MCP server
 */
export function createDefaultMiddleware(): MiddlewareComposer {
  const composer = new MiddlewareComposer();

  // Request middleware (order matters)
  composer
    .use(requestIdMiddleware())
    .use(requestLoggingMiddleware())
    .use(mcpValidationMiddleware({
      validateRequest: true,
      validateParameters: true,
      validateResponse: false, // Response validation is optional
      continueOnWarnings: true,
    }))
    .use(timeoutMiddleware(30000)) // 30 second timeout
    .use(rateLimitMiddleware(100, 60000)); // 100 requests per minute

  // Error middleware (reverse order of execution)
  composer
    .useError(errorRecoveryMiddleware())
    .useError(toolErrorHandlingMiddleware())
    .useError(errorHandlingMiddleware());

  return composer;
}

// =====================
// Exports
// =====================

export {
  MCPError,
  MCPErrorCode,
  errorHandler,
  ToolExecutionError,
  ValidationError,
  ToolNotFoundError,
} from './errors.js'; 