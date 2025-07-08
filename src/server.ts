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

export class DesignSystemMCPServer {
  private server: Server;

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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Design System MCP Server started");
  }
}