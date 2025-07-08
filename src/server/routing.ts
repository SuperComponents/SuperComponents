// src/server/routing.ts
import { z } from 'zod';
import { Tool } from "@modelcontextprotocol/sdk/types.js";

import { ToolRegistry, ToolExecutionContext } from './tools.js';
import { getLogger, Logger } from '../utils/logger.js';
import { 
  MCPError, 
  MCPErrorCode, 
  errorHandler,
  ToolExecutionError,
  ToolNotFoundError,
  toMCPError 
} from './errors.js';
import { 
  MiddlewareComposer, 
  createDefaultMiddleware,
  MiddlewareContext
} from './middleware.js';
import type { 
  MCPToolRequest, 
  MCPToolResponse, 
  MCPToolError
} from '../types.js';

/**
 * MCP Tool Adapter - bridges our ToolRegistry with MCP SDK tool specifications
 */
export class MCPToolAdapter {
  private logger: Logger;
  private middleware: MiddlewareComposer;
  
  constructor(private toolRegistry: ToolRegistry, middleware?: MiddlewareComposer) {
    this.logger = getLogger();
    this.middleware = middleware || createDefaultMiddleware();
    this.logger.info('🔧 MCPToolAdapter initialized with error handling middleware');
  }

  /**
   * Convert our ToolRegistry tools to MCP Tool specifications
   */
  public getMCPTools(): Tool[] {
    const registeredTools = this.toolRegistry.getEnabledTools();
    
    return registeredTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: this.convertZodSchemaToMCPSchema(tool.inputSchema)
    }));
  }

  /**
   * Create MCP tool handlers for our registered tools
   */
  public createMCPToolHandlers(): Record<string, (args: any) => Promise<any>> {
    const handlers: Record<string, (args: any) => Promise<any>> = {};
    const registeredTools = this.toolRegistry.getEnabledTools();

    for (const tool of registeredTools) {
      handlers[tool.name] = async (args: any) => {
        return this.executeTool(tool.name, args);
      };
    }

    return handlers;
  }

  /**
   * Execute a tool through our ToolRegistry and format the result for MCP
   */
  private async executeTool(toolName: string, args: any): Promise<any> {
    try {
      // Create middleware context
      const context: MiddlewareContext = {
        requestId: this.generateRequestId(),
        timestamp: new Date(),
        toolName,
        args,
        metadata: {
          source: 'mcp-adapter',
          timestamp: new Date().toISOString()
        }
      };

      // Execute through middleware stack
      const result = await this.middleware.execute(context, async () => {
        // Check if tool exists
        const tool = this.toolRegistry.getTool(toolName);
        if (!tool) {
          throw new ToolNotFoundError(toolName, this.toolRegistry.getAllTools().map(t => t.name));
        }

        if (!tool.metadata.enabled) {
          throw new MCPError(
            MCPErrorCode.ToolNotFound,
            `Tool '${toolName}' is disabled`,
            undefined,
            { toolName, requestId: context.requestId }
          );
        }

        // Create execution context for tool registry
        const executionContext: Partial<ToolExecutionContext> = {
          requestId: context.requestId,
          timestamp: context.timestamp,
          metadata: context.metadata
        };

        // Execute the tool through our registry
        const toolResult = await this.toolRegistry.execute(toolName, args, executionContext);

        // Check if the tool execution failed
        if (!toolResult.success) {
          throw new ToolExecutionError(
            toolResult.error || 'Tool execution failed',
            toolName,
            { originalResult: toolResult },
            { requestId: context.requestId }
          );
        }

        return toolResult;
      });

      // Format successful response for MCP protocol
      const mcpResponse = {
        content: [
          {
            type: "text",
            text: typeof result.data === 'string' 
              ? result.data 
              : JSON.stringify(result.data, null, 2)
          }
        ]
      };

      return mcpResponse;

    } catch (error) {
      // Handle errors through the error handler and convert to MCP format
      return errorHandler.handleToToolResult(error, { toolName });
    }
  }

  /**
   * Convert Zod schema to MCP JSON schema format
   */
  private convertZodSchemaToMCPSchema(zodSchema: any): any {
    // For now, return a basic object schema
    // TODO: Implement proper Zod to JSON Schema conversion
    if (zodSchema && typeof zodSchema === 'object') {
      return {
        type: "object",
        properties: {},
        additionalProperties: true
      };
    }

    // Default fallback schema
    return {
      type: "object",
      properties: {},
      additionalProperties: true
    };
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sanitize arguments for logging (remove sensitive data)
   */
  private sanitizeArgsForLogging(args: any): any {
    if (!args || typeof args !== 'object') {
      return args;
    }

    const sanitized = { ...args };
    const sensitiveKeys = ['apiKey', 'token', 'password', 'secret', 'key'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get adapter statistics
   */
  public getStatistics() {
    return {
      toolsRegistered: this.toolRegistry.getAllTools().length,
      enabledTools: this.toolRegistry.getEnabledTools().length,
      categories: this.toolRegistry.getCategories(),
      capabilities: this.toolRegistry.getCapabilities()
    };
  }
}

/**
 * Validation schemas for MCP tool parameters
 */
export const MCPToolSchemas = {
  /**
   * Basic tool call validation
   */
  toolCall: z.object({
    name: z.string(),
    arguments: z.any()
  }),

  /**
   * Tool definition validation
   */
  toolDefinition: z.object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.any()
  })
}; 