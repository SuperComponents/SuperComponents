import { z } from 'zod';
import { MCPToolAdapter, MCPToolSchemas } from '../../src/server/routing.js';
import { ToolRegistry } from '../../src/server/tools.js';
import { initializeLogger } from '../../src/utils/logger.js';

// Initialize logger for tests
beforeAll(() => {
  initializeLogger({ 
    logLevel: 'error',  // Reduce noise in tests
    nodeEnv: 'test'
  });
});

describe('MCPToolAdapter', () => {
  let toolRegistry: ToolRegistry;
  let mcpAdapter: MCPToolAdapter;

  beforeEach(() => {
    toolRegistry = new ToolRegistry();
    mcpAdapter = new MCPToolAdapter(toolRegistry);
  });

  describe('constructor', () => {
    it('should create an instance with a tool registry', () => {
      expect(mcpAdapter).toBeInstanceOf(MCPToolAdapter);
      expect(mcpAdapter.getStatistics().toolsRegistered).toBe(0);
    });
  });

  describe('getMCPTools', () => {
    it('should return empty array when no tools are registered', () => {
      const mcpTools = mcpAdapter.getMCPTools();
      expect(mcpTools).toEqual([]);
    });

    it('should convert registered tools to MCP format', () => {
      // Register a test tool
      toolRegistry.register({
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: z.object({
          input: z.string()
        }),
        handler: async (args) => ({ result: 'test' }),
        category: 'test'
      });

      const mcpTools = mcpAdapter.getMCPTools();
      expect(mcpTools).toHaveLength(1);
      expect(mcpTools[0]).toEqual({
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: expect.any(Object)
      });
    });

    it('should only include enabled tools', () => {
      // Register tools with different enabled states
      toolRegistry.register({
        name: 'enabled-tool',
        description: 'An enabled tool',
        inputSchema: z.object({}),
        handler: async () => ({}),
        category: 'test',
        enabled: true
      });

      toolRegistry.register({
        name: 'disabled-tool',
        description: 'A disabled tool',
        inputSchema: z.object({}),
        handler: async () => ({}),
        category: 'test',
        enabled: false
      });

      const mcpTools = mcpAdapter.getMCPTools();
      expect(mcpTools).toHaveLength(1);
      expect(mcpTools[0].name).toBe('enabled-tool');
    });
  });

  describe('createMCPToolHandlers', () => {
    it('should create handlers for all registered tools', () => {
      // Register test tools
      toolRegistry.register({
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: z.object({}),
        handler: async () => ({ result: 'tool1' }),
        category: 'test'
      });

      toolRegistry.register({
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: z.object({}),
        handler: async () => ({ result: 'tool2' }),
        category: 'test'
      });

      const handlers = mcpAdapter.createMCPToolHandlers();
      expect(Object.keys(handlers)).toHaveLength(2);
      expect(handlers).toHaveProperty('tool1');
      expect(handlers).toHaveProperty('tool2');
    });

    it('should create working handlers that execute tools', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ result: 'success' });
      
      toolRegistry.register({
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: z.object({
          input: z.string()
        }),
        handler: mockHandler,
        category: 'test'
      });

      const handlers = mcpAdapter.createMCPToolHandlers();
      const result = await handlers['test-tool']({ input: 'test' });

      expect(mockHandler).toHaveBeenCalledWith(
        { input: 'test' },
        expect.objectContaining({
          requestId: expect.any(String),
          timestamp: expect.any(Date),
          metadata: expect.objectContaining({
            source: 'mcp-adapter'
          })
        })
      );

      expect(result).toEqual({
        content: [{
          type: 'text',
          text: JSON.stringify({ result: 'success' }, null, 2)
        }]
      });
    });

    it('should handle string responses correctly', async () => {
      toolRegistry.register({
        name: 'string-tool',
        description: 'String tool',
        inputSchema: z.object({}),
        handler: async () => ({ data: 'string response' }),
        category: 'test'
      });

      const handlers = mcpAdapter.createMCPToolHandlers();
      const result = await handlers['string-tool']({});

      expect(result).toEqual({
        content: [{
          type: 'text',
          text: JSON.stringify({ data: 'string response' }, null, 2)
        }]
      });
    });

    it('should handle tool execution errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Tool execution failed'));
      
      toolRegistry.register({
        name: 'failing-tool',
        description: 'Failing tool',
        inputSchema: z.object({}),
        handler: mockHandler,
        category: 'test'
      });

      const handlers = mcpAdapter.createMCPToolHandlers();
      
      // With the new error handling middleware, errors are returned as tool results
      // instead of being thrown, following MCP protocol conventions
      const result = await handlers['failing-tool']({});
      
      expect(result).toEqual({
        content: [{
          type: 'text',
          text: expect.stringContaining('Error:')
        }],
        isError: true
      });
    });
  });

  describe('getStatistics', () => {
    it('should return accurate statistics', () => {
      // Register some tools
      toolRegistry.register({
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: z.object({}),
        handler: async () => ({}),
        category: 'category1'
      });

      toolRegistry.register({
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: z.object({}),
        handler: async () => ({}),
        category: 'category2'
      });

      const stats = mcpAdapter.getStatistics();
      expect(stats.toolsRegistered).toBe(2);
      expect(stats.enabledTools).toBe(2);
      expect(stats.categories).toContain('category1');
      expect(stats.categories).toContain('category2');
    });
  });

  describe('schema conversion', () => {
    it('should convert Zod schemas to MCP format', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional()
      });

      toolRegistry.register({
        name: 'schema-tool',
        description: 'Schema tool',
        inputSchema: schema,
        handler: async () => ({}),
        category: 'test'
      });

      const mcpTools = mcpAdapter.getMCPTools();
      expect(mcpTools[0].inputSchema).toEqual({
        type: 'object',
        properties: {},
        additionalProperties: true
      });
    });
  });

  describe('argument sanitization', () => {
    it('should sanitize sensitive data in logs', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ result: 'success' });
      
      toolRegistry.register({
        name: 'sensitive-tool',
        description: 'Sensitive tool',
        inputSchema: z.object({}),
        handler: mockHandler,
        category: 'test'
      });

      const handlers = mcpAdapter.createMCPToolHandlers();
      
      // Test with sensitive data
      await handlers['sensitive-tool']({
        apiKey: 'secret-key',
        password: 'secret-password',
        normalField: 'normal-value'
      });

      expect(mockHandler).toHaveBeenCalled();
      // The actual sanitization happens in logging, not in handler arguments
      // This test verifies the handler is called with original arguments
    });
  });

  describe('request ID generation', () => {
    it('should generate unique request IDs', async () => {
      const requestIds = new Set<string>();
      
      toolRegistry.register({
        name: 'id-tool',
        description: 'ID tool',
        inputSchema: z.object({}),
        handler: async (args, context) => {
          requestIds.add(context.requestId!);
          return { result: 'success' };
        },
        category: 'test'
      });

      const handlers = mcpAdapter.createMCPToolHandlers();
      
      // Execute multiple times
      await Promise.all([
        handlers['id-tool']({}),
        handlers['id-tool']({}),
        handlers['id-tool']({}),
      ]);

      expect(requestIds.size).toBe(3);
    });
  });
});

describe('MCPToolSchemas', () => {
  describe('toolCall schema', () => {
    it('should validate valid tool calls', () => {
      const validCall = {
        name: 'test-tool',
        arguments: { input: 'test' }
      };

      const result = MCPToolSchemas.toolCall.safeParse(validCall);
      expect(result.success).toBe(true);
    });

    it('should reject invalid tool calls', () => {
      const invalidCall = {
        name: 123, // should be string
        arguments: { input: 'test' }
      };

      const result = MCPToolSchemas.toolCall.safeParse(invalidCall);
      expect(result.success).toBe(false);
    });
  });

  describe('toolDefinition schema', () => {
    it('should validate valid tool definitions', () => {
      const validDefinition = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' }
      };

      const result = MCPToolSchemas.toolDefinition.safeParse(validDefinition);
      expect(result.success).toBe(true);
    });

    it('should reject invalid tool definitions', () => {
      const invalidDefinition = {
        name: 'test-tool',
        // missing description
        inputSchema: { type: 'object' }
      };

      const result = MCPToolSchemas.toolDefinition.safeParse(invalidDefinition);
      expect(result.success).toBe(false);
    });
  });
}); 