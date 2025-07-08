// src/server/tools.ts
import { z } from 'zod';
import { getLogger, Logger } from '../utils/logger.js';
import type { 
  RegisteredTool, 
  ToolSchema, 
  ToolHandler, 
  ToolMetadata, 
  ToolCapability 
} from '../types.js';

/**
 * Tool registration options
 */
export interface ToolRegistrationOptions {
  name: string;
  description: string;
  inputSchema: ToolSchema;
  outputSchema?: ToolSchema;
  handler: ToolHandler;
  metadata?: Partial<ToolMetadata>;
  capabilities?: ToolCapability[];
  enabled?: boolean;
  version?: string;
  category?: string;
  tags?: string[];
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  toolName: string;
  requestId: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
  duration: number;
  timestamp: Date;
}

/**
 * Tool registration system for MCP server
 */
export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();
  private categories: Map<string, string[]> = new Map();
  private tags: Map<string, string[]> = new Map();
  private _logger: Logger | null = null;

  /**
   * Get logger instance (lazy initialization)
   */
  private get logger(): Logger {
    if (!this._logger) {
      this._logger = getLogger();
    }
    return this._logger;
  }

  /**
   * Register a new tool
   */
  public register(options: ToolRegistrationOptions): void {
    const { name, description, inputSchema, outputSchema, handler, metadata, capabilities, enabled = true, version = '1.0.0', category = 'general', tags = [] } = options;

    // Validate tool name
    if (!name || typeof name !== 'string') {
      throw new Error('Tool name must be a non-empty string');
    }

    if (this.tools.has(name)) {
      throw new Error(`Tool '${name}' is already registered`);
    }

    // Validate input schema
    if (!inputSchema) {
      throw new Error(`Tool '${name}' must have an input schema`);
    }

    // Validate handler
    if (!handler || typeof handler !== 'function') {
      throw new Error(`Tool '${name}' must have a valid handler function`);
    }

    // Create tool metadata
    const toolMetadata: ToolMetadata = {
      name,
      description,
      version,
      category,
      tags,
      registeredAt: new Date(),
      lastUsed: null,
      usageCount: 0,
      enabled,
      ...metadata
    };

    // Create tool definition
    const tool: RegisteredTool = {
      name,
      description,
      inputSchema,
      outputSchema,
      metadata: toolMetadata,
      capabilities: capabilities || []
    };

    // Register the tool
    this.tools.set(name, tool);
    this.handlers.set(name, handler);

    // Update category index
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(name);

    // Update tags index
    tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, []);
      }
      this.tags.get(tag)!.push(name);
    });

    this.logger.logToolRegistered(name, this.tools.size);
  }

  /**
   * Unregister a tool
   */
  public unregister(name: string): boolean {
    if (!this.tools.has(name)) {
      return false;
    }

    const tool = this.tools.get(name)!;
    
    // Remove from main registry
    this.tools.delete(name);
    this.handlers.delete(name);

    // Remove from category index
    if (tool.metadata.category) {
      const categoryTools = this.categories.get(tool.metadata.category);
      if (categoryTools) {
        const index = categoryTools.indexOf(name);
        if (index > -1) {
          categoryTools.splice(index, 1);
          if (categoryTools.length === 0) {
            this.categories.delete(tool.metadata.category);
          }
        }
      }
    }

    // Remove from tags index
    if (tool.metadata.tags) {
      tool.metadata.tags.forEach(tag => {
        const tagTools = this.tags.get(tag);
        if (tagTools) {
          const index = tagTools.indexOf(name);
          if (index > -1) {
            tagTools.splice(index, 1);
            if (tagTools.length === 0) {
              this.tags.delete(tag);
            }
          }
        }
      });
    }

    this.logger.debug(`🔧 Unregistered tool: ${name}`);
    return true;
  }

  /**
   * Get tool by name
   */
  public getTool(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get tool handler by name
   */
  public getHandler(name: string): ToolHandler | undefined {
    return this.handlers.get(name);
  }

  /**
   * Get all registered tools
   */
  public getAllTools(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get enabled tools only
   */
  public getEnabledTools(): RegisteredTool[] {
    return this.getAllTools().filter(tool => tool.metadata.enabled);
  }

  /**
   * Get tools by category
   */
  public getToolsByCategory(category: string): RegisteredTool[] {
    const toolNames = this.categories.get(category) || [];
    return toolNames.map(name => this.tools.get(name)!);
  }

  /**
   * Get tools by tag
   */
  public getToolsByTag(tag: string): RegisteredTool[] {
    const toolNames = this.tags.get(tag) || [];
    return toolNames.map(name => this.tools.get(name)!);
  }

  /**
   * Get all categories
   */
  public getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get all tags
   */
  public getTags(): string[] {
    return Array.from(this.tags.keys());
  }

  /**
   * Check if tool exists
   */
  public hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Enable/disable a tool
   */
  public setToolEnabled(name: string, enabled: boolean): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      return false;
    }

    tool.metadata.enabled = enabled;
    this.logger.debug(`🔧 Tool ${name} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Execute a tool with context
   */
  public async execute(
    name: string, 
    args: any, 
    context: Partial<ToolExecutionContext> = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const executionContext: ToolExecutionContext = {
      toolName: name,
      requestId: context.requestId || Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
      userId: context.userId,
      metadata: context.metadata
    };

    try {
      const tool = this.tools.get(name);
      const handler = this.handlers.get(name);

      if (!tool || !handler) {
        throw new Error(`Tool '${name}' not found`);
      }

      if (!tool.metadata.enabled) {
        throw new Error(`Tool '${name}' is disabled`);
      }

      // Validate input against schema
      if (tool.inputSchema) {
        try {
          const validationResult = tool.inputSchema.safeParse(args);
          if (!validationResult.success) {
            throw new Error(`Invalid input for tool '${name}': ${validationResult.error.message}`);
          }
        } catch (error) {
          throw new Error(`Input validation failed for tool '${name}': ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Execute the tool
      const result = await handler(args, executionContext);

      // Validate output against schema if provided
      if (tool.outputSchema) {
        try {
          const validationResult = tool.outputSchema.safeParse(result);
          if (!validationResult.success) {
            throw new Error(`Invalid output from tool '${name}': ${validationResult.error.message}`);
          }
        } catch (error) {
          this.logger.warn(`Output validation failed for tool '${name}'`, { error: error instanceof Error ? error.message : String(error) });
        }
      }

      // Update tool usage statistics
      tool.metadata.usageCount++;
      tool.metadata.lastUsed = new Date();

      const duration = Date.now() - startTime;
      this.logger.logToolExecution(name, duration, true);

      return {
        success: true,
        data: result,
        duration,
        timestamp: new Date(),
        metadata: {
          toolName: name,
          requestId: executionContext.requestId
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.logger.logToolExecution(name, duration, false);
      this.logger.error(`❌ Tool execution failed: ${name}`, { error: errorMessage });

      return {
        success: false,
        error: errorMessage,
        duration,
        timestamp: new Date(),
        metadata: {
          toolName: name,
          requestId: executionContext.requestId
        }
      };
    }
  }

  /**
   * Get tool capabilities for MCP discovery
   */
  public getCapabilities(): Record<string, any> {
    const enabledTools = this.getEnabledTools();
    
    return {
      tools: enabledTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        capabilities: tool.capabilities
      }))
    };
  }

  /**
   * Get tool registry statistics
   */
  public getStatistics(): {
    totalTools: number;
    enabledTools: number;
    disabledTools: number;
    categories: number;
    tags: number;
    totalUsage: number;
    mostUsedTool: string | null;
  } {
    const allTools = this.getAllTools();
    const enabledTools = allTools.filter(tool => tool.metadata.enabled);
    const disabledTools = allTools.filter(tool => !tool.metadata.enabled);
    
    const totalUsage = allTools.reduce((sum, tool) => sum + tool.metadata.usageCount, 0);
    
    let mostUsedTool: string | null = null;
    let maxUsage = 0;
    
    allTools.forEach(tool => {
      if (tool.metadata.usageCount > maxUsage) {
        maxUsage = tool.metadata.usageCount;
        mostUsedTool = tool.name;
      }
    });

    return {
      totalTools: allTools.length,
      enabledTools: enabledTools.length,
      disabledTools: disabledTools.length,
      categories: this.categories.size,
      tags: this.tags.size,
      totalUsage,
      mostUsedTool
    };
  }

  /**
   * Clear all registered tools
   */
  public clear(): void {
    this.tools.clear();
    this.handlers.clear();
    this.categories.clear();
    this.tags.clear();
    this.logger.debug('🔧 Cleared all registered tools');
  }
}

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry(); 