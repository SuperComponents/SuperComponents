// tests/server/errors.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { initializeLogger } from '../../src/utils/logger.js';
import {
  MCPError,
  MCPErrorCode,
  MCPErrorResponseSchema,
  ToolExecutionError,
  ValidationError,
  ToolNotFoundError,
  RateLimitError,
  AuthenticationError,
  AuthorizationError,
  ConfigurationError,
  TimeoutError,
  ErrorHandler,
  errorHandler,
  isMCPError,
  toMCPError,
  createValidationError,
  getErrorMessage,
  getErrorCode,
} from '../../src/server/errors.js';

describe('MCP Error System', () => {
  beforeEach(() => {
    initializeLogger({ logLevel: 'error', nodeEnv: 'test' });
  });

  describe('MCPError', () => {
    it('should create an MCPError with correct properties', () => {
      const error = new MCPError(
        MCPErrorCode.InternalError,
        'Test error message',
        { testData: 'value' },
        { testContext: 'context' }
      );

      expect(error.name).toBe('MCPError');
      expect(error.code).toBe(MCPErrorCode.InternalError);
      expect(error.message).toBe('MCP Error -32603: Test error message');
      expect(error.data).toEqual({ testData: 'value' });
      expect(error.context).toEqual({ testContext: 'context' });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should convert to JSON-RPC error response format', () => {
      const error = new MCPError(
        MCPErrorCode.ValidationError,
        'Validation failed',
        { field: 'username' }
      );

      const jsonRpcError = error.toJSONRPCError('test-request-123');
      
      expect(jsonRpcError).toEqual({
        jsonrpc: '2.0',
        id: 'test-request-123',
        error: {
          code: MCPErrorCode.ValidationError,
          message: 'Validation failed',
          data: { field: 'username' },
        },
      });

      // Validate against schema
      expect(MCPErrorResponseSchema.safeParse(jsonRpcError).success).toBe(true);
    });

    it('should convert to MCP tool result format', () => {
      const error = new MCPError(
        MCPErrorCode.ToolExecutionFailed,
        'Tool execution failed'
      );

      const toolResult = error.toToolResult();
      
      expect(toolResult).toEqual({
        content: [
          {
            type: 'text',
            text: 'Error: Tool execution failed',
          },
        ],
        isError: true,
      });
    });

    it('should provide log details', () => {
      const error = new MCPError(
        MCPErrorCode.NetworkError,
        'Network error',
        { url: 'https://example.com' },
        { requestId: 'req-123' }
      );

      const logDetails = error.getLogDetails();
      
      expect(logDetails).toEqual({
        code: MCPErrorCode.NetworkError,
        message: 'Network error',
        data: { url: 'https://example.com' },
        context: { requestId: 'req-123' },
        timestamp: error.timestamp.toISOString(),
        stack: error.stack,
      });
    });
  });

  describe('Specific Error Classes', () => {
    it('should create ToolExecutionError correctly', () => {
      const error = new ToolExecutionError(
        'Failed to execute tool',
        'test-tool',
        { reason: 'timeout' },
        { requestId: 'req-123' }
      );

      expect(error.name).toBe('ToolExecutionError');
      expect(error.code).toBe(MCPErrorCode.ToolExecutionFailed);
      expect(error.toolName).toBe('test-tool');
      expect(error.data).toEqual({ reason: 'timeout' });
      expect(error.context).toEqual({ toolName: 'test-tool', requestId: 'req-123' });
      expect(error instanceof ToolExecutionError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create ValidationError correctly', () => {
      const validationErrors = [
        { path: ['username'], message: 'Required' },
        { path: ['email'], message: 'Invalid email' },
      ];

      const error = new ValidationError(
        'Validation failed',
        validationErrors,
        { requestId: 'req-123' }
      );

      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe(MCPErrorCode.ValidationError);
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.context).toEqual({ requestId: 'req-123' });
      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create ToolNotFoundError correctly', () => {
      const error = new ToolNotFoundError('missing-tool', ['tool1', 'tool2']);

      expect(error.name).toBe('ToolNotFoundError');
      expect(error.code).toBe(MCPErrorCode.ToolNotFound);
      expect(error.toolName).toBe('missing-tool');
      expect(error.message).toBe("MCP Error -32100: Tool 'missing-tool' not found");
      expect(error.data).toEqual({ availableTools: ['tool1', 'tool2'] });
      expect(error.context).toEqual({ toolName: 'missing-tool' });
      expect(error instanceof ToolNotFoundError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create RateLimitError correctly', () => {
      const error = new RateLimitError('Rate limit exceeded', 60, { clientId: 'client-123' });

      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe(MCPErrorCode.RateLimitExceeded);
      expect(error.retryAfter).toBe(60);
      expect(error.data).toEqual({ retryAfter: 60 });
      expect(error.context).toEqual({ clientId: 'client-123' });
      expect(error instanceof RateLimitError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create AuthenticationError correctly', () => {
      const error = new AuthenticationError('Invalid credentials', { userId: 'user-123' });

      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe(MCPErrorCode.AuthenticationError);
      expect(error.context).toEqual({ userId: 'user-123' });
      expect(error instanceof AuthenticationError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create AuthorizationError correctly', () => {
      const error = new AuthorizationError('Access denied', { resource: 'admin-panel' });

      expect(error.name).toBe('AuthorizationError');
      expect(error.code).toBe(MCPErrorCode.AuthorizationError);
      expect(error.context).toEqual({ resource: 'admin-panel' });
      expect(error instanceof AuthorizationError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create ConfigurationError correctly', () => {
      const error = new ConfigurationError('Invalid configuration', { setting: 'api_key' });

      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe(MCPErrorCode.ConfigurationError);
      expect(error.context).toEqual({ setting: 'api_key' });
      expect(error instanceof ConfigurationError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create TimeoutError correctly', () => {
      const error = new TimeoutError('Request timeout', 5000, { operation: 'api-call' });

      expect(error.name).toBe('TimeoutError');
      expect(error.code).toBe(MCPErrorCode.TimeoutError);
      expect(error.timeout).toBe(5000);
      expect(error.data).toEqual({ timeout: 5000 });
      expect(error.context).toEqual({ operation: 'api-call' });
      expect(error instanceof TimeoutError).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });
  });

  describe('Error Utility Functions', () => {
    it('should identify MCPError instances', () => {
      const mcpError = new MCPError(MCPErrorCode.InternalError, 'Test error');
      const regularError = new Error('Regular error');
      const nonError = 'not an error';

      expect(isMCPError(mcpError)).toBe(true);
      expect(isMCPError(regularError)).toBe(false);
      expect(isMCPError(nonError)).toBe(false);
    });

    it('should convert MCPError to MCPError (no change)', () => {
      const originalError = new MCPError(MCPErrorCode.ValidationError, 'Test error');
      const convertedError = toMCPError(originalError);

      expect(convertedError).toBe(originalError);
    });

    it('should convert regular Error to MCPError', () => {
      const originalError = new Error('Regular error');
      const convertedError = toMCPError(originalError, { source: 'test' });

      expect(convertedError).toBeInstanceOf(MCPError);
      expect(convertedError.code).toBe(MCPErrorCode.InternalError);
      expect(convertedError.message).toBe('MCP Error -32603: Regular error');
      expect(convertedError.data).toEqual({ 
        originalError: 'Error', 
        stack: originalError.stack 
      });
      expect(convertedError.context).toEqual({ source: 'test' });
    });

    it('should convert unknown error to MCPError', () => {
      const originalError = 'string error';
      const convertedError = toMCPError(originalError, { source: 'test' });

      expect(convertedError).toBeInstanceOf(MCPError);
      expect(convertedError.code).toBe(MCPErrorCode.UnknownError);
      expect(convertedError.message).toBe('MCP Error -32199: An unknown error occurred');
      expect(convertedError.data).toEqual({ originalError: 'string error' });
      expect(convertedError.context).toEqual({ source: 'test' });
    });

    it('should create validation error from Zod error', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number().min(18),
      });

      const result = schema.safeParse({
        name: '',
        email: 'invalid-email',
        age: 15,
      });

      expect(result.success).toBe(false);
      
      if (!result.success) {
        const validationError = createValidationError(result.error, { requestId: 'req-123' });

        expect(validationError).toBeInstanceOf(ValidationError);
        expect(validationError.code).toBe(MCPErrorCode.ValidationError);
        expect(validationError.message).toBe('Validation failed');
        expect(validationError.context).toEqual({ requestId: 'req-123' });
        expect(validationError.validationErrors.errors).toHaveLength(3);
        expect(validationError.validationErrors.fieldErrors).toHaveProperty('name');
        expect(validationError.validationErrors.fieldErrors).toHaveProperty('email');
        expect(validationError.validationErrors.fieldErrors).toHaveProperty('age');
      }
    });

    it('should get error message from various types', () => {
      expect(getErrorMessage(new Error('Error message'))).toBe('Error message');
      expect(getErrorMessage(new MCPError(MCPErrorCode.InternalError, 'MCP error'))).toBe('MCP Error -32603: MCP error');
      expect(getErrorMessage('string error')).toBe('string error');
      expect(getErrorMessage(42)).toBe('42');
      expect(getErrorMessage(null)).toBe('null');
    });

    it('should get error code from various types', () => {
      expect(getErrorCode(new MCPError(MCPErrorCode.ValidationError, 'Test'))).toBe(MCPErrorCode.ValidationError);
      expect(getErrorCode(new Error('Regular error'))).toBe(MCPErrorCode.InternalError);
      expect(getErrorCode('string error')).toBe(MCPErrorCode.InternalError);
    });
  });

  describe('ErrorHandler', () => {
    let testErrorHandler: ErrorHandler;

    beforeEach(() => {
      testErrorHandler = new ErrorHandler();
    });

    it('should handle MCPError and return it unchanged', () => {
      const originalError = new MCPError(MCPErrorCode.ValidationError, 'Test error');
      const handledError = testErrorHandler.handle(originalError);

      expect(handledError).toBe(originalError);
    });

    it('should handle regular error and convert to MCPError', () => {
      const originalError = new Error('Regular error');
      const handledError = testErrorHandler.handle(originalError, { source: 'test' });

      expect(handledError).toBeInstanceOf(MCPError);
      expect(handledError.code).toBe(MCPErrorCode.InternalError);
      expect(handledError.context).toEqual({ source: 'test' });
    });

    it('should handle error and convert to JSON-RPC response', () => {
      const originalError = new Error('Test error');
      const response = testErrorHandler.handleToResponse(originalError, 'req-123', { toolName: 'test-tool' });

      expect(response).toEqual({
        jsonrpc: '2.0',
        id: 'req-123',
        error: {
          code: MCPErrorCode.InternalError,
          message: 'Test error',
          data: { 
            originalError: 'Error', 
            stack: originalError.stack 
          },
        },
      });
    });

    it('should handle error and convert to tool result', () => {
      const originalError = new Error('Test error');
      const toolResult = testErrorHandler.handleToToolResult(originalError, { toolName: 'test-tool' });

      expect(toolResult).toEqual({
        content: [
          {
            type: 'text',
            text: 'Error: Test error',
          },
        ],
        isError: true,
      });
    });
  });

  describe('Global Error Handler', () => {
    it('should export global error handler instance', () => {
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
    });

    it('should be reusable across different contexts', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');

      const handled1 = errorHandler.handle(error1, { context: 'first' });
      const handled2 = errorHandler.handle(error2, { context: 'second' });

      expect(handled1).toBeInstanceOf(MCPError);
      expect(handled2).toBeInstanceOf(MCPError);
      expect(handled1.context).toEqual({ context: 'first' });
      expect(handled2.context).toEqual({ context: 'second' });
    });
  });

  describe('Error Code Validation', () => {
    it('should have valid error codes in proper ranges', () => {
      // SDK-specific codes
      expect(MCPErrorCode.ConnectionClosed).toBe(-32000);
      expect(MCPErrorCode.RequestTimeout).toBe(-32001);

      // Standard JSON-RPC codes
      expect(MCPErrorCode.ParseError).toBe(-32700);
      expect(MCPErrorCode.InvalidRequest).toBe(-32600);
      expect(MCPErrorCode.MethodNotFound).toBe(-32601);
      expect(MCPErrorCode.InvalidParams).toBe(-32602);
      expect(MCPErrorCode.InternalError).toBe(-32603);

      // Application-specific codes (custom range)
      expect(MCPErrorCode.ToolNotFound).toBe(-32100);
      expect(MCPErrorCode.ToolExecutionFailed).toBe(-32101);
      expect(MCPErrorCode.ValidationError).toBe(-32102);
      expect(MCPErrorCode.UnknownError).toBe(-32199);
    });

    it('should create valid JSON-RPC error responses', () => {
      const errorCodes = [
        MCPErrorCode.ParseError,
        MCPErrorCode.InvalidRequest,
        MCPErrorCode.MethodNotFound,
        MCPErrorCode.InvalidParams,
        MCPErrorCode.InternalError,
        MCPErrorCode.ToolNotFound,
        MCPErrorCode.ValidationError,
      ];

      errorCodes.forEach(code => {
        const error = new MCPError(code, 'Test message');
        const response = error.toJSONRPCError('test-id');
        
        expect(MCPErrorResponseSchema.safeParse(response).success).toBe(true);
      });
    });
  });
}); 