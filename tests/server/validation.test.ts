import {
  MCPProtocolValidator,
  ToolParameterValidator,
  ResponseValidator,
  ValidationPipeline,
  createValidationMiddleware,
  MCPRequestSchema,
  ToolResultSchema,
  ValidationContext,
  defaultValidationPipeline,
} from '../../src/server/validation.js';
import { ValidationError } from '../../src/server/errors.js';
import { z } from 'zod';

describe('Validation System', () => {
  describe('MCPProtocolValidator', () => {
    let validator: MCPProtocolValidator;

    beforeEach(() => {
      validator = new MCPProtocolValidator();
    });

    it('should validate valid MCP requests', () => {
      const validRequest = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 'test-123',
      };

      const result = validator.validate(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validRequest);
    });

    it('should validate requests without ID', () => {
      const validRequest = {
        jsonrpc: '2.0',
        method: 'ping',
      };

      const result = validator.validate(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate requests with parameters', () => {
      const validRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 1,
        params: {
          name: 'test-tool',
          arguments: { key: 'value' },
        },
      };

      const result = validator.validate(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid JSON-RPC version', () => {
      const invalidRequest = {
        jsonrpc: '1.0',
        method: 'test',
      };

      const result = validator.validate(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid JSON-RPC version');
    });

    it('should reject missing method', () => {
      const invalidRequest = {
        jsonrpc: '2.0',
        id: 'test',
      };

      const result = validator.validate(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should warn about unknown methods', () => {
      const requestWithUnknownMethod = {
        jsonrpc: '2.0',
        method: 'unknown/method',
      };

      const result = validator.validate(requestWithUnknownMethod);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Unknown method');
    });

    it('should include context in results', () => {
      const context: ValidationContext = {
        requestId: 'test-request-123',
        timestamp: new Date().toISOString(),
      };

      const validRequest = {
        jsonrpc: '2.0',
        method: 'ping',
      };

      const result = validator.validate(validRequest, context);
      expect(result.context).toEqual(context);
    });
  });

  describe('ToolParameterValidator', () => {
    let validator: ToolParameterValidator;

    beforeEach(() => {
      validator = new ToolParameterValidator();
    });

    it('should validate generic parameters', () => {
      const params = {
        name: 'test-tool',
        arguments: { key: 'value' },
      };

      const result = validator.validate(params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should work with custom schema', () => {
      const customSchema = z.object({
        name: z.string(),
        count: z.number().positive(),
      });

      const customValidator = new ToolParameterValidator(customSchema);
      
      const validParams = { name: 'test', count: 5 };
      const result = customValidator.validate(validParams);
      expect(result.isValid).toBe(true);

      const invalidParams = { name: 'test', count: -1 };
      const invalidResult = customValidator.validate(invalidParams);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should warn about sensitive parameters', () => {
      const sensitiveParams = {
        name: 'test',
        password: 'secret123',
        apiKey: 'key123',
      };

      const result = validator.validate(sensitiveParams);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('sensitive'))).toBe(true);
    });

    it('should handle non-object parameters', () => {
      const result = validator.validate('string-param');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Parameters should be an object');
    });

    it('should include tool context in validation', () => {
      const context: ValidationContext = {
        toolName: 'test-tool',
        requestId: 'req-123',
      };

      const params = { key: 'value' };
      const result = validator.validate(params, context);
      expect(result.context).toEqual(context);
    });
  });

  describe('ResponseValidator', () => {
    let validator: ResponseValidator;

    beforeEach(() => {
      validator = new ResponseValidator();
    });

    it('should validate valid tool results', () => {
      const validResponse = {
        content: [
          {
            type: 'text',
            text: 'Hello, world!',
          },
        ],
      };

      const result = validator.validate(validResponse);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate responses with multiple content items', () => {
      const validResponse = {
        content: [
          {
            type: 'text',
            text: 'Some text',
          },
          {
            type: 'image',
            data: 'base64-image-data',
            mimeType: 'image/png',
          },
        ],
      };

      const result = validator.validate(validResponse);
      expect(result.isValid).toBe(true);
    });

    it('should validate error responses', () => {
      const errorResponse = {
        content: [
          {
            type: 'text',
            text: 'An error occurred',
          },
        ],
        isError: true,
      };

      const result = validator.validate(errorResponse);
      expect(result.isValid).toBe(true);
    });

    it('should warn about empty content', () => {
      const emptyResponse = {
        content: [],
      };

      const result = validator.validate(emptyResponse);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Response contains no content');
    });

    it('should warn about mismatched content types', () => {
      const invalidResponse = {
        content: [
          {
            type: 'text',
            // Missing text property
          },
          {
            type: 'image',
            // Missing data property
          },
        ],
      };

      const result = validator.validate(invalidResponse);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should reject invalid response structure', () => {
      const invalidResponse = {
        // Missing content array
        isError: false,
      };

      const result = validator.validate(invalidResponse);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('ValidationPipeline', () => {
    let pipeline: ValidationPipeline;

    beforeEach(() => {
      pipeline = new ValidationPipeline();
    });

    it('should register default validators', () => {
      const stats = pipeline.getStatistics();
      expect(stats.validatorCount).toBe(3);
      expect(stats.registeredValidators).toContain('mcp-protocol');
      expect(stats.registeredValidators).toContain('tool-parameters');
      expect(stats.registeredValidators).toContain('response');
    });

    it('should register custom validators', () => {
      const customValidator = new ToolParameterValidator();
      pipeline.registerValidator('custom', customValidator);

      const stats = pipeline.getStatistics();
      expect(stats.validatorCount).toBe(4);
      expect(stats.registeredValidators).toContain('custom');
    });

    it('should unregister validators', () => {
      const removed = pipeline.unregisterValidator('response');
      expect(removed).toBe(true);

      const stats = pipeline.getStatistics();
      expect(stats.validatorCount).toBe(2);
      expect(stats.registeredValidators).not.toContain('response');
    });

    it('should validate with multiple validators', async () => {
      const data = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'test' },
      };

      const result = await pipeline.validate(data, ['mcp-protocol', 'tool-parameters']);
      expect(result.isValid).toBe(true);
    });

    it('should aggregate validation results', async () => {
      const invalidData = {
        jsonrpc: '1.0', // Invalid version
        method: 'test',
        params: { password: 'secret' }, // Sensitive parameter
      };

      const result = await pipeline.validate(invalidData, ['mcp-protocol', 'tool-parameters']);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn about unknown validators', async () => {
      const data = { test: 'data' };
      const result = await pipeline.validate(data, ['unknown-validator']);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Unknown validator: unknown-validator');
    });

    it('should provide convenience methods', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        method: 'ping',
      };

      const result = await pipeline.validateMCPRequest(mcpRequest);
      expect(result.isValid).toBe(true);
    });

    it('should handle validator exceptions', async () => {
      // Create a validator that throws
      const throwingValidator = {
        validate: () => {
          throw new Error('Validator error');
        },
        schema: z.any(),
      };

      pipeline.registerValidator('throwing', throwingValidator);
      
      const result = await pipeline.validate({}, ['throwing']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Validator throwing failed');
    });
  });

  describe('Validation Middleware', () => {
    let pipeline: ValidationPipeline;

    beforeEach(() => {
      pipeline = new ValidationPipeline();
    });

    it('should create validation middleware', () => {
      const middleware = createValidationMiddleware(pipeline);
      expect(typeof middleware).toBe('function');
    });

    it('should skip validation when configured', async () => {
      const middleware = createValidationMiddleware(pipeline, { skipValidation: true });
      const mockNext = jest.fn().mockResolvedValue('result');

      const result = await middleware('invalid-data', {}, mockNext);
      expect(result).toBe('result');
      expect(mockNext).toHaveBeenCalledWith('invalid-data', {});
    });

    it('should validate data before calling next', async () => {
      const middleware = createValidationMiddleware(pipeline);
      const mockNext = jest.fn().mockResolvedValue('result');

      const validData = {
        jsonrpc: '2.0',
        method: 'ping',
      };

      const result = await middleware(validData, { requestId: 'test' }, mockNext);
      expect(result).toBe('result');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw validation errors', async () => {
      const middleware = createValidationMiddleware(pipeline);
      const mockNext = jest.fn();

      const invalidData = {
        jsonrpc: '1.0', // Invalid version
        method: 'test',
      };

      await expect(
        middleware(invalidData, { requestId: 'test' }, mockNext)
      ).rejects.toThrow();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should continue on warnings when configured', async () => {
      const middleware = createValidationMiddleware(pipeline, {
        continueOnWarnings: true,
      });
      const mockNext = jest.fn().mockResolvedValue('result');

      // This will generate warnings but not errors
      const dataWithWarnings = {
        jsonrpc: '2.0',
        method: 'unknown/method', // Unknown method -> warning
      };

      const result = await middleware(dataWithWarnings, { requestId: 'test' }, mockNext);
      expect(result).toBe('result');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Default Validation Pipeline', () => {
    it('should be available as singleton', () => {
      expect(defaultValidationPipeline).toBeInstanceOf(ValidationPipeline);
    });

    it('should have default validators registered', () => {
      const stats = defaultValidationPipeline.getStatistics();
      expect(stats.validatorCount).toBe(3);
    });
  });

  describe('Schema Exports', () => {
    it('should export MCP request schema', () => {
      const validRequest = {
        jsonrpc: '2.0',
        method: 'test',
      };

      const result = MCPRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should export tool result schema', () => {
      const validResult = {
        content: [
          {
            type: 'text',
            text: 'Hello',
          },
        ],
      };

      const result = ToolResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });
  });
}); 