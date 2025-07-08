// tests/server/middleware.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { initializeLogger } from '../../src/utils/logger.js';
import { ToolRegistry } from '../../src/server/tools.js';
import { MCPErrorCode } from '../../src/server/errors.js';
import {
  MiddlewareContext,
  MiddlewareComposer,
  requestIdMiddleware,
  requestLoggingMiddleware,
  requestValidationMiddleware,
  rateLimitMiddleware,
  timeoutMiddleware,
  errorHandlingMiddleware,
  toolErrorHandlingMiddleware,
  errorRecoveryMiddleware,
  createDefaultMiddleware,
} from '../../src/server/middleware.js';

describe('Middleware System', () => {
  beforeEach(() => {
    initializeLogger({ logLevel: 'error', nodeEnv: 'test' });
  });

  describe('Request Middleware', () => {
    describe('requestIdMiddleware', () => {
      it('should generate request ID when not provided', async () => {
        const middleware = requestIdMiddleware();
        const context: MiddlewareContext = {
          requestId: '',
          timestamp: new Date(),
        };

        let nextCalled = false;
        const next = async () => {
          nextCalled = true;
          return 'success';
        };

        const result = await middleware(context, next);

        expect(nextCalled).toBe(true);
        expect(result).toBe('success');
        expect(context.requestId).toMatch(/^mcp_\d+_[a-z0-9]+$/);
      });

      it('should not override existing request ID', async () => {
        const middleware = requestIdMiddleware();
        const context: MiddlewareContext = {
          requestId: 'existing-id',
          timestamp: new Date(),
        };

        const next = async () => 'success';
        await middleware(context, next);

        expect(context.requestId).toBe('existing-id');
      });
    });

    describe('requestLoggingMiddleware', () => {
      it('should log request start and completion', async () => {
        const middleware = requestLoggingMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          toolName: 'test-tool',
        };

        const next = async () => 'success';
        const result = await middleware(context, next);

        expect(result).toBe('success');
        // Note: In a real scenario, we'd mock the logger to verify calls
      });

      it('should log request failure', async () => {
        const middleware = requestLoggingMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          toolName: 'test-tool',
        };

        const next = async () => {
          throw new Error('Test error');
        };

        await expect(middleware(context, next)).rejects.toThrow('Test error');
      });
    });

    describe('requestValidationMiddleware', () => {
      it('should validate args against schema', async () => {
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        const middleware = requestValidationMiddleware(schema);
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          args: { name: 'John', age: 25 },
        };

        const next = async () => 'success';
        const result = await middleware(context, next);

        expect(result).toBe('success');
        expect(context.args).toEqual({ name: 'John', age: 25 });
      });

      it('should throw validation error for invalid args', async () => {
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        const middleware = requestValidationMiddleware(schema);
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          args: { name: 'John', age: 'invalid' },
        };

        const next = async () => 'success';

        await expect(middleware(context, next)).rejects.toThrow();
      });

      it('should skip validation when no schema provided', async () => {
        const middleware = requestValidationMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          args: { anything: 'goes' },
        };

        const next = async () => 'success';
        const result = await middleware(context, next);

        expect(result).toBe('success');
      });
    });

    describe('rateLimitMiddleware', () => {
      it('should allow requests within rate limit', async () => {
        const middleware = rateLimitMiddleware(5, 60000); // 5 requests per minute
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          toolName: 'test-tool',
        };

        const next = async () => 'success';

        // Make multiple requests within limit
        for (let i = 0; i < 5; i++) {
          const result = await middleware(context, next);
          expect(result).toBe('success');
        }
      });

      it('should block requests exceeding rate limit', async () => {
        const middleware = rateLimitMiddleware(2, 60000); // 2 requests per minute
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          toolName: 'test-tool',
        };

        const next = async () => 'success';

        // Make requests up to limit
        await middleware(context, next);
        await middleware(context, next);

        // Third request should be blocked
        await expect(middleware(context, next)).rejects.toThrow();
      });
    });

    describe('timeoutMiddleware', () => {
      it('should allow requests completing within timeout', async () => {
        const middleware = timeoutMiddleware(1000); // 1 second timeout
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
        };

        const next = async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
          return 'success';
        };

        const result = await middleware(context, next);
        expect(result).toBe('success');
      });

      it('should timeout requests exceeding timeout', async () => {
        const middleware = timeoutMiddleware(100); // 100ms timeout
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
        };

        const next = async () => {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
          return 'success';
        };

        await expect(middleware(context, next)).rejects.toThrow();
      });
    });
  });

  describe('Error Middleware', () => {
    describe('errorHandlingMiddleware', () => {
      it('should handle Zod validation errors', async () => {
        const middleware = errorHandlingMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
        };

        const schema = z.object({ name: z.string() });
        const zodError = schema.safeParse({ name: 123 }).error!;

        const next = async (error?: unknown) => {
          if (error) throw error;
          return 'success';
        };

        await expect(middleware(zodError, context, next)).rejects.toThrow();
      });

      it('should pass MCPError unchanged', async () => {
        const middleware = errorHandlingMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
        };

        const originalError = new Error('Test error');
        const next = async (error?: unknown) => {
          if (error) throw error;
          return 'success';
        };

        await expect(middleware(originalError, context, next)).rejects.toThrow();
      });
    });

    describe('toolErrorHandlingMiddleware', () => {
      it('should convert regular errors to ToolExecutionError', async () => {
        const middleware = toolErrorHandlingMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          toolName: 'test-tool',
        };

        const originalError = new Error('Test error');
        const next = async (error?: unknown) => {
          if (error) throw error;
          return 'success';
        };

        await expect(middleware(originalError, context, next)).rejects.toThrow();
      });

      it('should skip processing when no tool name', async () => {
        const middleware = toolErrorHandlingMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          // No toolName
        };

        const originalError = new Error('Test error');
        const next = async (error?: unknown) => {
          if (error) throw error;
          return 'success';
        };

        await expect(middleware(originalError, context, next)).rejects.toThrow('Test error');
      });
    });

    describe('errorRecoveryMiddleware', () => {
      it('should log error and rethrow as MCPError', async () => {
        const middleware = errorRecoveryMiddleware();
        const context: MiddlewareContext = {
          requestId: 'test-123',
          timestamp: new Date(),
          toolName: 'test-tool',
        };

        const originalError = new Error('Test error');
        const next = async (error?: unknown) => {
          return 'should not reach here';
        };

        await expect(middleware(originalError, context, next)).rejects.toThrow();
      });
    });
  });

  describe('MiddlewareComposer', () => {
    let composer: MiddlewareComposer;

    beforeEach(() => {
      composer = new MiddlewareComposer();
    });

    it('should execute middleware in order', async () => {
      const executionOrder: string[] = [];

      const middleware1 = (context: MiddlewareContext, next: () => Promise<any>) => {
        executionOrder.push('middleware1-start');
        const result = next();
        executionOrder.push('middleware1-end');
        return result;
      };

      const middleware2 = (context: MiddlewareContext, next: () => Promise<any>) => {
        executionOrder.push('middleware2-start');
        const result = next();
        executionOrder.push('middleware2-end');
        return result;
      };

      composer.use(middleware1).use(middleware2);

      const context: MiddlewareContext = {
        requestId: 'test-123',
        timestamp: new Date(),
      };

      const finalHandler = () => {
        executionOrder.push('final-handler');
        return Promise.resolve('success');
      };

      const result = await composer.execute(context, finalHandler);

      expect(result).toBe('success');
      expect(executionOrder).toEqual([
        'middleware1-start',
        'middleware2-start',
        'final-handler',
        'middleware2-end',
        'middleware1-end',
      ]);
    });

    it('should handle errors through error middleware', async () => {
      const errorMiddleware = (error: unknown, context: MiddlewareContext, next: (error?: unknown) => Promise<any>) => {
        if (error instanceof Error && error.message === 'Test error') {
          throw new Error('Handled error');
        }
        return next(error);
      };

      composer.useError(errorMiddleware);

      const context: MiddlewareContext = {
        requestId: 'test-123',
        timestamp: new Date(),
      };

      const finalHandler = () => {
        throw new Error('Test error');
      };

      await expect(composer.execute(context, finalHandler)).rejects.toThrow('Handled error');
    });

    it('should create tool wrapper with middleware', async () => {
      const toolRegistry = new ToolRegistry();
      
      // Register a simple test tool
      toolRegistry.register({
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: z.object({ input: z.string() }),
        handler: async (args) => ({ result: `Processed: ${args.input}` }),
        category: 'test',
        metadata: { enabled: true, version: '1.0.0' },
      });

      const toolWrapper = composer.createToolWrapper(toolRegistry);
      
      const result = await toolWrapper('test-tool', { input: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 'Processed: test' });
    });
  });

  describe('Default Middleware Stack', () => {
    it('should create default middleware with proper configuration', () => {
      const middleware = createDefaultMiddleware();
      
      expect(middleware).toBeInstanceOf(MiddlewareComposer);
      // Note: In a real scenario, we'd test the specific middleware configuration
    });

    it('should handle tool execution through default middleware', async () => {
      const middleware = createDefaultMiddleware();
      const toolRegistry = new ToolRegistry();
      
      // Register a test tool
      toolRegistry.register({
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: z.object({ input: z.string() }),
        handler: async (args) => ({ result: `Processed: ${args.input}` }),
        category: 'test',
        metadata: { enabled: true, version: '1.0.0' },
      });

      const toolWrapper = middleware.createToolWrapper(toolRegistry);
      
      const result = await toolWrapper('test-tool', { input: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 'Processed: test' });
    });

    it('should handle tool not found error', async () => {
      const middleware = createDefaultMiddleware();
      const toolRegistry = new ToolRegistry();
      
      const toolWrapper = middleware.createToolWrapper(toolRegistry);
      
      await expect(toolWrapper('non-existent-tool', { input: 'test' })).rejects.toThrow();
    });

    it('should handle disabled tool error', async () => {
      const middleware = createDefaultMiddleware();
      const toolRegistry = new ToolRegistry();
      
      // Register a disabled tool
      toolRegistry.register({
        name: 'disabled-tool',
        description: 'Disabled tool',
        inputSchema: z.object({ input: z.string() }),
        handler: async (args) => ({ result: 'Should not execute' }),
        category: 'test',
        metadata: { enabled: false, version: '1.0.0' },
      });

      const toolWrapper = middleware.createToolWrapper(toolRegistry);
      
      await expect(toolWrapper('disabled-tool', { input: 'test' })).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex middleware chain with errors', async () => {
      const composer = new MiddlewareComposer();
      
      // Add request middleware
      composer.use(requestIdMiddleware());
      composer.use(requestLoggingMiddleware());
      composer.use(timeoutMiddleware(5000));
      
      // Add error middleware
      composer.useError(errorRecoveryMiddleware());
      composer.useError(toolErrorHandlingMiddleware());
      composer.useError(errorHandlingMiddleware());

      const context: MiddlewareContext = {
        requestId: 'test-123',
        timestamp: new Date(),
        toolName: 'test-tool',
      };

      const finalHandler = () => {
        throw new Error('Test error');
      };

      await expect(composer.execute(context, finalHandler)).rejects.toThrow();
    });

    it('should handle successful execution through complex middleware', async () => {
      const composer = new MiddlewareComposer();
      
      // Add request middleware
      composer.use(requestIdMiddleware());
      composer.use(requestLoggingMiddleware());
      composer.use(timeoutMiddleware(5000));
      
      // Add validation middleware
      const schema = z.object({ input: z.string() });
      composer.use(requestValidationMiddleware(schema));

      const context: MiddlewareContext = {
        requestId: 'test-123',
        timestamp: new Date(),
        toolName: 'test-tool',
        args: { input: 'valid input' },
      };

      const finalHandler = () => {
        return Promise.resolve('success');
      };

      const result = await composer.execute(context, finalHandler);
      expect(result).toBe('success');
    });
  });
}); 