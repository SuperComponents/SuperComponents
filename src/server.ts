#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize logger first to prevent initialization errors
import { initializeLogger } from './utils/logger.js';
initializeLogger({ logLevel: 'info', nodeEnv: 'production' });

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: "supercomponents-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Lazy load tool implementations to ensure logger is initialized first
  const loadTools = async () => {
    const { parseDesignAndGenerateTokensTool } = await import('./tools/parseDesignAndGenerateTokens.js');
    const { initializeProjectTool } = await import('./tools/initializeProject.js');
    const { createTokenStoriesTool } = await import('./tools/createTokenStories.js');
    const { analyzeComponentsTool } = await import('./tools/analyzeComponents.js');
    const { generateInstructionTool } = await import('./tools/generateInstruction.js');
    
    return {
      parseDesignAndGenerateTokensTool,
      initializeProjectTool,
      createTokenStoriesTool,
      analyzeComponentsTool,
      generateInstructionTool,
    };
  };

  // Set up tool handlers with lazy loading
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = await loadTools();
    return {
      tools: [
        {
          name: tools.parseDesignAndGenerateTokensTool.definition.name,
          description: "Parse design input (text description, file content, or image description) and generate design tokens with Tailwind config and CSS variables. IMPORTANT: Provide design description in the 'input' parameter as a string.",
          inputSchema: {
            type: "object",
            properties: {
              input: {
                type: "string",
                description: "REQUIRED: Design description, file content, or image analysis text. Example: 'Create a modern dashboard with blue primary colors and card layout'"
              },
              outputDir: {
                type: "string",
                description: "Output directory for generated files (default: ./supercomponents)",
                default: "./supercomponents"
              },
              includeCSS: {
                type: "boolean", 
                description: "Generate CSS variables file",
                default: true
              },
              includeTailwind: {
                type: "boolean",
                description: "Generate Tailwind config file", 
                default: true
              }
            },
            required: ["input"]
          }
        },
        {
          name: tools.initializeProjectTool.definition.name,
          description: "Initialize a new SuperComponents project by fetching scaffolding from the SuperComponents repository then running the supercomponents-setup script. RUN THIS FIRST before using other tools.",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Project directory path (default: caller's current directory)"
              }
            },
            required: []
          }
        },
        {
          name: tools.createTokenStoriesTool.definition.name,
          description: tools.createTokenStoriesTool.definition.description,
          inputSchema: tools.createTokenStoriesTool.definition.inputSchema,
        },
        {
          name: tools.analyzeComponentsTool.definition.name,
          description: tools.analyzeComponentsTool.definition.description,
          inputSchema: tools.analyzeComponentsTool.definition.inputSchema,
        },
        {
          name: tools.generateInstructionTool.definition.name,
          description: tools.generateInstructionTool.definition.description,
          inputSchema: tools.generateInstructionTool.definition.inputSchema,
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tools = await loadTools();

    try {
      // Add debugging for parameter passing
      console.log(`[MCP] Tool called: ${name}`);
      console.log(`[MCP] Raw arguments:`, JSON.stringify(args, null, 2));
      
      let result;
      
      switch (name) {
        case tools.parseDesignAndGenerateTokensTool.definition.name:
          // Special handling for this tool if no parameters are provided
          if (!args || (typeof args === 'object' && Object.keys(args).length === 0)) {
            result = {
              success: false,
              error: "No parameters provided",
              message: `❌ No input provided for parseDesignAndGenerateTokens tool.\n\n🔧 How to use:\n  - Provide a design description like: "Create a modern dashboard with blue primary colors"\n  - Or provide a file path like: "./test-samples/sample-design.md"\n  - Or describe your design vision and components\n\n💡 Example:\n  Input: "Design a card-based layout with rounded corners, blue primary colors, and modern typography"`
            };
          } else {
            result = await tools.parseDesignAndGenerateTokensTool.handler(args);
          }
          break;
        
        case tools.initializeProjectTool.definition.name:
          result = await tools.initializeProjectTool.handler(args);
          break;
        
        case tools.createTokenStoriesTool.definition.name:
          result = await tools.createTokenStoriesTool.handler(args);
          break;
        
        case tools.analyzeComponentsTool.definition.name:
          result = await tools.analyzeComponentsTool.handler(args);
          break;
        
        case tools.generateInstructionTool.definition.name:
          result = await tools.generateInstructionTool.handler(args);
          break;
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      console.log(`[MCP] Tool result:`, result);

      return {
        content: [
          {
            type: "text",
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`[MCP] Error in tool ${name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Main function to start the server
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SuperComponents MCP server running on stdio");
}

// Run the server
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

export { createServer, main }; 