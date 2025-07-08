// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { 
  initializeServer, 
  setupShutdownHandlers, 
  performHealthChecks, 
  createServerState,
  type ServerState 
} from './server/initialization.js';
import { getLogger } from './utils/logger.js';
import type { ServerConfig } from './config/server.js';
import { ToolRegistry, type ToolRegistrationOptions } from './server/tools.js';

export class SuperComponentsServer {
  private mcpServer: McpServer;
  private serverState: ServerState;
  private config: ServerConfig;
  private toolRegistry: ToolRegistry;

  constructor(config: ServerConfig) {
    this.config = config;
    this.serverState = createServerState();
    this.toolRegistry = new ToolRegistry();
    
    // Initialize MCP server
    this.mcpServer = new McpServer({
      name: config.name,
      version: config.version,
      capabilities: {
        tools: {},
      },
    });
    
    this.setupMcpHandlers();
  }

  /**
   * Setup MCP protocol handlers - placeholder for now
   * TODO: Implement proper MCP protocol handling once we determine the correct SDK API
   */
  private setupMcpHandlers(): void {
    const logger = getLogger();
    
    // For now, we'll set up the tool registration internally
    // The actual MCP protocol handling will be added in subsequent subtasks
    
    logger.debug('🔧 MCP protocol handlers setup (placeholder)');
  }

  /**
   * Register a tool with the new registration system
   */
  public registerTool(options: ToolRegistrationOptions): void;
  public registerTool(name: string, handler: (args: any) => Promise<any>): void;
  public registerTool(
    nameOrOptions: string | ToolRegistrationOptions, 
    handler?: (args: any) => Promise<any>
  ): void {
    const logger = getLogger();
    
    if (typeof nameOrOptions === 'string' && handler) {
      // Legacy API - convert to new format
      const options: ToolRegistrationOptions = {
        name: nameOrOptions,
        description: `Tool: ${nameOrOptions}`,
        inputSchema: { type: "object", additionalProperties: true },
        handler,
        category: 'legacy'
      };
      this.toolRegistry.register(options);
    } else if (typeof nameOrOptions === 'object') {
      // New API
      this.toolRegistry.register(nameOrOptions);
    } else {
      throw new Error('Invalid tool registration arguments');
    }
    
    logger.logToolRegistered(
      typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name, 
      this.toolRegistry.getAllTools().length
    );
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    const logger = getLogger();
    
    try {
      this.serverState.setStatus('starting');
      
      // Perform health checks
      await performHealthChecks(this.config);
      
      // Setup shutdown handlers
      setupShutdownHandlers(async (signal) => {
        await this.shutdown(signal);
      });
      
      // TODO: Connect to MCP transport once we implement proper protocol handling
      // For now, we'll just mark the server as running
      
      this.serverState.setStatus('running');
      logger.logServerReady(this.config.transport);
      
      // Keep the process alive
      process.stdin.resume();
      
    } catch (error) {
      this.serverState.setStatus('stopped');
      const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
      logger.error('❌ Failed to start server', {}, error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Shutdown the server gracefully
   */
  public async shutdown(reason: string = 'Manual shutdown'): Promise<void> {
    const logger = getLogger();
    
    this.serverState.setStatus('stopping');
    logger.logServerShutdown(reason);
    
    try {
      // TODO: Close MCP server connection when SDK provides the method
      // await this.mcpServer.close();
      
      // Log final statistics
      const stats = this.serverState.getStats();
      logger.info('📊 Final server statistics', stats);
      
      this.serverState.setStatus('stopped');
      
    } catch (error) {
      logger.error('❌ Error during shutdown', {}, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get server statistics
   */
  public getStats() {
    const baseStats = this.serverState.getStats();
    const toolStats = this.toolRegistry.getStatistics();
    
    return {
      ...baseStats,
      tools: toolStats
    };
  }

  /**
   * Get server status
   */
  public getStatus() {
    return this.serverState.status;
  }

  /**
   * Get the tool registry instance
   */
  public getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Get all registered tools
   */
  public getTools() {
    return this.toolRegistry.getAllTools();
  }

  /**
   * Get tool capabilities for MCP discovery
   */
  public getCapabilities() {
    return this.toolRegistry.getCapabilities();
  }
}

/**
 * Main server entry point
 */
async function main(): Promise<void> {
  try {
    // Initialize configuration and logging
    const { config } = await initializeServer();
    
    // Create and configure server
    const server = new SuperComponentsServer(config);
    
    // Register placeholder tools (will be replaced with real implementations)
    server.registerTool('parse.design', async (args) => {
      return {
        content: [{
          type: 'text',
          text: 'Design parsing not yet implemented',
        }],
      };
    });
    
    server.registerTool('analyze.components', async (args) => {
      return {
        content: [{
          type: 'text',
          text: 'Component analysis not yet implemented',
        }],
      };
    });
    
    server.registerTool('generate.instruction', async (args) => {
      return {
        content: [{
          type: 'text',
          text: 'Instruction generation not yet implemented',
        }],
      };
    });
    
    // Start the server
    await server.start();
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Server failed to start: ${errorMessage}`);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js')) {
  main().catch((error) => {
    console.error('❌ Unhandled error in main:', error);
    process.exit(1);
  });
}

export { main }; 