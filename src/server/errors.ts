// src/server/errors.ts
import { z } from 'zod';
import { getLogger, Logger } from '../utils/logger.js';

// =====================
// MCP Error Codes (Based on JSON-RPC 2.0 and MCP SDK)
// =====================

/**
 * Error codes following JSON-RPC 2.0 specification and MCP SDK extensions
 */
export enum MCPErrorCode {
  // SDK-specific error codes
  ConnectionClosed = -32000,
  RequestTimeout = -32001,
  
  // Standard JSON-RPC error codes
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  
  // Application-specific error codes (custom range)
  ToolNotFound = -32100,
  ToolExecutionFailed = -32101,
  ValidationError = -32102,
  AuthenticationError = -32103,
  AuthorizationError = -32104,
  RateLimitExceeded = -32105,
  ResourceNotFound = -32106,
  ConfigurationError = -32107,
  NetworkError = -32108,
  TimeoutError = -32109,
  CacheError = -32110,
  UnknownError = -32199,
}

// =====================
// MCP Error Response Schema
// =====================

/**
 * Schema for MCP error responses following JSON-RPC 2.0 specification
 */
export const MCPErrorResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]),
  error: z.object({
    code: z.number().int(),
    message: z.string(),
    data: z.unknown().optional(),
  }),
}).strict();

export type MCPErrorResponse = z.infer<typeof MCPErrorResponseSchema>;

// =====================
// Custom Error Classes
// =====================

/**
 * Base MCP Error class extending native Error
 */
export class MCPError extends Error {
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    public readonly code: MCPErrorCode,
    message: string,
    public readonly data?: unknown,
    context?: Record<string, any>
  ) {
    super(`MCP Error ${code}: ${message}`);
    this.name = 'MCPError';
    this.timestamp = new Date();
    this.context = context;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, MCPError.prototype);
  }

  /**
   * Convert error to MCP-compliant JSON-RPC error response
   */
  public toJSONRPCError(requestId?: string | number | null): MCPErrorResponse {
    return {
      jsonrpc: '2.0',
      id: requestId ?? null,
      error: {
        code: this.code,
        message: this.message,
        data: this.data,
      },
    };
  }

  /**
   * Convert error to MCP tool result format (for tool execution errors)
   */
  public toToolResult() {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${this.message}`,
        },
      ],
      isError: true,
    };
  }

  /**
   * Get error details for logging
   */
  public getLogDetails() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Tool-specific error
 */
export class ToolExecutionError extends MCPError {
  constructor(
    message: string,
    public readonly toolName: string,
    data?: unknown,
    context?: Record<string, any>
  ) {
    super(MCPErrorCode.ToolExecutionFailed, message, data, { toolName, ...context });
    this.name = 'ToolExecutionError';
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}

/**
 * Validation error for schema validation failures
 */
export class ValidationError extends MCPError {
  constructor(
    message: string,
    public readonly validationErrors: any,
    context?: Record<string, any>
  ) {
    super(MCPErrorCode.ValidationError, message, validationErrors, context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Tool not found error
 */
export class ToolNotFoundError extends MCPError {
  constructor(
    public readonly toolName: string,
    availableTools?: string[]
  ) {
    super(
      MCPErrorCode.ToolNotFound,
      `Tool '${toolName}' not found`,
      { availableTools },
      { toolName }
    );
    this.name = 'ToolNotFoundError';
    Object.setPrototypeOf(this, ToolNotFoundError.prototype);
  }
}

/**
 * Rate limiting error
 */
export class RateLimitError extends MCPError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(MCPErrorCode.RateLimitExceeded, message, { retryAfter }, context);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends MCPError {
  constructor(message: string, context?: Record<string, any>) {
    super(MCPErrorCode.AuthenticationError, message, undefined, context);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends MCPError {
  constructor(message: string, context?: Record<string, any>) {
    super(MCPErrorCode.AuthorizationError, message, undefined, context);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends MCPError {
  constructor(message: string, context?: Record<string, any>) {
    super(MCPErrorCode.ConfigurationError, message, undefined, context);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends MCPError {
  constructor(
    message: string,
    public readonly timeout: number,
    context?: Record<string, any>
  ) {
    super(MCPErrorCode.TimeoutError, message, { timeout }, context);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

// =====================
// Error Utility Functions
// =====================

/**
 * Check if an error is an instance of MCPError
 */
export function isMCPError(error: unknown): error is MCPError {
  return error instanceof MCPError;
}

/**
 * Convert any error to MCPError
 */
export function toMCPError(error: unknown, context?: Record<string, any>): MCPError {
  if (isMCPError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new MCPError(
      MCPErrorCode.InternalError,
      error.message,
      { originalError: error.name, stack: error.stack },
      context
    );
  }

  return new MCPError(
    MCPErrorCode.UnknownError,
    'An unknown error occurred',
    { originalError: String(error) },
    context
  );
}

/**
 * Create error from Zod validation error
 */
export function createValidationError(
  zodError: z.ZodError,
  context?: Record<string, any>
): ValidationError {
  const fieldErrors: Record<string, string[]> = {};
  
  zodError.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return new ValidationError(
    'Validation failed',
    { errors: zodError.errors, fieldErrors },
    context
  );
}

/**
 * Get error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Get error code from any error type
 */
export function getErrorCode(error: unknown): MCPErrorCode {
  if (isMCPError(error)) {
    return error.code;
  }
  return MCPErrorCode.InternalError;
}

// =====================
// Error Handler Class
// =====================

/**
 * Centralized error handler for the MCP server
 */
export class ErrorHandler {
  private logger: Logger;

  constructor() {
    this.logger = getLogger();
  }

  /**
   * Handle and log an error
   */
  public handle(error: unknown, context?: Record<string, any>): MCPError {
    const mcpError = toMCPError(error, context);
    
    // Log the error with appropriate level
    const logLevel = this.getLogLevel(mcpError.code);
    const logDetails = mcpError.getLogDetails();
    
    switch (logLevel) {
      case 'error':
        this.logger.error('🚨 MCP Error occurred', logDetails);
        break;
      case 'warn':
        this.logger.warn('⚠️ MCP Warning', logDetails);
        break;
      case 'debug':
        this.logger.debug('🔍 MCP Debug error', logDetails);
        break;
    }

    return mcpError;
  }

  /**
   * Handle error and convert to JSON-RPC response
   */
  public handleToResponse(
    error: unknown, 
    requestId?: string | number | null,
    context?: Record<string, any>
  ): MCPErrorResponse {
    const mcpError = this.handle(error, context);
    return mcpError.toJSONRPCError(requestId);
  }

  /**
   * Handle error and convert to tool result
   */
  public handleToToolResult(error: unknown, context?: Record<string, any>) {
    const mcpError = this.handle(error, context);
    return mcpError.toToolResult();
  }

  /**
   * Determine log level based on error code
   */
  private getLogLevel(code: MCPErrorCode): 'error' | 'warn' | 'debug' {
    switch (code) {
      case MCPErrorCode.InternalError:
      case MCPErrorCode.NetworkError:
      case MCPErrorCode.ConfigurationError:
        return 'error';
      
      case MCPErrorCode.ValidationError:
      case MCPErrorCode.ToolNotFound:
      case MCPErrorCode.AuthenticationError:
      case MCPErrorCode.AuthorizationError:
      case MCPErrorCode.RateLimitExceeded:
        return 'warn';
      
      case MCPErrorCode.InvalidParams:
      case MCPErrorCode.MethodNotFound:
      case MCPErrorCode.TimeoutError:
        return 'debug';
      
      default:
        return 'warn';
    }
  }
}

// =====================
// Global Error Handler Instance
// =====================

let _globalErrorHandler: ErrorHandler | null = null;

export const errorHandler = {
  get instance(): ErrorHandler {
    if (!_globalErrorHandler) {
      _globalErrorHandler = new ErrorHandler();
    }
    return _globalErrorHandler;
  },
  
  // Delegate all ErrorHandler methods
  handle: (error: unknown, context?: Record<string, any>) => {
    return errorHandler.instance.handle(error, context);
  },
  
  handleToResponse: (
    error: unknown, 
    requestId?: string | number | null,
    context?: Record<string, any>
  ) => {
    return errorHandler.instance.handleToResponse(error, requestId, context);
  },
  
  handleToToolResult: (error: unknown, context?: Record<string, any>) => {
    return errorHandler.instance.handleToToolResult(error, context);
  }
}; 