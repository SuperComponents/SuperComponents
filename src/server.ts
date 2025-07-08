import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { initProjectTool } from "./tools/init-project.js";
import { extractDesignTokensTool } from "./tools/extract-design-tokens.js";
import { generateStyleShowcaseTool } from "./tools/generate-style-showcase.js";
import { defineDesignPrinciplesTool } from "./tools/define-design-principles.js";
import { planComponentLibraryTool } from "./tools/plan-component-library.js";
import { generateComponentPromptTool } from "./tools/generate-component-prompt.js";
import { defineDesignPrinciplesPrompt } from "./prompts/define-design-principles.js";
import { planComponentLibraryPrompt } from "./prompts/plan-component-library.js";
import { generateComponentPrompt } from "./prompts/generate-component-prompt.js";

// Import dev architecture components for potential future use
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

export class DesignSystemMCPServer {
  private server: Server;
  private serverState: ServerState;
  protected toolRegistry: ToolRegistry;

  constructor() {
    this.server = new Server(
      {
        name: "supercomp-design-system",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    // Initialize enhanced server state tracking from dev
    this.serverState = createServerState();
    this.toolRegistry = new ToolRegistry();

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "init_project",
          description: "Initialize a new design system project with React, Storybook, TypeScript, and Tailwind v4",
          inputSchema: {
            type: "object",
            properties: {
              projectName: {
                type: "string",
                description: "Name of the project",
              },
              projectPath: {
                type: "string",
                description: "Path where to create the project",
              },
            },
            required: ["projectName", "projectPath"],
          },
        },
        {
          name: "extract_design_tokens",
          description: "Extract design tokens from a URL, image, or description",
          inputSchema: {
            type: "object",
            properties: {
              source: {
                type: "string",
                description: "URL, image path, or text description to extract tokens from",
              },
              sourceType: {
                type: "string",
                enum: ["url", "image", "text"],
                description: "Type of the source",
              },
            },
            required: ["source", "sourceType"],
          },
        },
        {
          name: "generate_style_showcase",
          description: "Generate a style showcase page displaying all design tokens",
          inputSchema: {
            type: "object",
            properties: {
              outputPath: {
                type: "string",
                description: "Path where to generate the showcase",
              },
              format: {
                type: "string",
                enum: ["html", "react"],
                description: "Format of the showcase page",
              },
            },
            required: ["outputPath"],
          },
        },
        {
          name: "define_design_principles",
          description: "Guide the user in establishing north-star design principles",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "plan_component_library",
          description: "Analyze design principles and suggest a component library structure",
          inputSchema: {
            type: "object",
            properties: {
              principles: {
                type: "string",
                description: "Design principles context (optional)",
              },
              tokens: {
                type: "string",
                description: "Design tokens context (optional)",
              },
            },
          },
        },
        {
          name: "generate_component_implementation",
          description: "Generate a detailed implementation prompt for a specific component",
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description: "Name of the component to generate a prompt for",
              },
              principles: {
                type: "string",
                description: "Design principles context (optional)",
              },
              tokens: {
                type: "string",
                description: "Design tokens context (optional)",
              },
            },
            required: ["componentName"],
          },
        },
      ],
    }));

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "define_design_principles",
          description: "Guide the user in establishing north-star design principles",
        },
        {
          name: "plan_component_library",
          description: "Analyze design principles and suggest a component library structure",
        },
        {
          name: "generate_component_implementation",
          description: "Generate a detailed implementation prompt for a specific component",
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const args = request.params.arguments || {};
      
      switch (request.params.name) {
        case "init_project":
          return await initProjectTool(args as any);
        case "extract_design_tokens":
          return await extractDesignTokensTool(args as any);
        case "generate_style_showcase":
          return await generateStyleShowcaseTool(args as any);
        case "define_design_principles":
          return await defineDesignPrinciplesTool(args as any);
        case "plan_component_library":
          return await planComponentLibraryTool(args as any);
        case "generate_component_implementation":
          return await generateComponentPromptTool(args as any);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const args = request.params.arguments || {};
      
      switch (request.params.name) {
        case "define_design_principles":
          return defineDesignPrinciplesPrompt(args);
        case "plan_component_library":
          return planComponentLibraryPrompt(args as any);
        case "generate_component_implementation":
          return generateComponentPrompt(args as any);
        default:
          throw new Error(`Unknown prompt: ${request.params.name}`);
      }
    });
  }

  async start() {
    const logger = getLogger();
    
    try {
      this.serverState.setStatus('starting');
      
      // Setup shutdown handlers from dev architecture
      setupShutdownHandlers(async (signal) => {
        await this.shutdown(signal);
      });
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.serverState.setStatus('running');
      logger.logServerReady('stdio');
      console.error("Design System MCP Server started");
      
    } catch (error) {
      this.serverState.setStatus('stopped');
      const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
      logger.error('❌ Failed to start server', {}, error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }

  async shutdown(reason: string = 'Manual shutdown'): Promise<void> {
    const logger = getLogger();
    
    this.serverState.setStatus('stopping');
    logger.logServerShutdown(reason);
    
    try {
      // Log final statistics
      const stats = this.serverState.getStats();
      logger.info('📊 Final server statistics', stats);
      
      this.serverState.setStatus('stopped');
      
    } catch (error) {
      logger.error('❌ Error during shutdown', {}, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  public getStats() {
    const baseStats = this.serverState.getStats();
    const toolStats = this.toolRegistry.getStatistics();
    
    return {
      ...baseStats,
      tools: toolStats
    };
  }

  public getStatus() {
    return this.serverState.status;
  }
}

// Export SuperComponentsServer for compatibility with dev architecture
export class SuperComponentsServer extends DesignSystemMCPServer {
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    super();
    this.config = config;
  }

  public registerTool(options: ToolRegistrationOptions): void;
  public registerTool(name: string, handler: (args: any) => Promise<any>): void;
  public registerTool(
    nameOrOptions: string | ToolRegistrationOptions, 
    handler?: (args: any) => Promise<any>
  ): void {
    const logger = getLogger();
    
    if (typeof nameOrOptions === 'string' && handler) {
      const options: ToolRegistrationOptions = {
        name: nameOrOptions,
        description: `Tool: ${nameOrOptions}`,
        inputSchema: { type: "object", additionalProperties: true },
        handler,
        category: 'legacy'
      };
      this.toolRegistry.register(options);
    } else if (typeof nameOrOptions === 'object') {
      this.toolRegistry.register(nameOrOptions);
    } else {
      throw new Error('Invalid tool registration arguments');
    }
    
    logger.logToolRegistered(
      typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name, 
      this.toolRegistry.getAllTools().length
    );
  }

  public getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  public getTools() {
    return this.toolRegistry.getAllTools();
  }

  public getCapabilities() {
    return this.toolRegistry.getCapabilities();
  }
}

/**
 * Main server entry point - supports both architectures
 */
async function main(): Promise<void> {
  try {
    // Try to initialize with dev architecture first
    const { config } = await initializeServer();
    
    // Create and configure server
    const server = new SuperComponentsServer(config);
    
    // Register placeholder tools
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
    // Fallback to MVP architecture if dev initialization fails
    console.error('Dev architecture initialization failed, falling back to MVP architecture');
    const server = new DesignSystemMCPServer();
    await server.start();
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
