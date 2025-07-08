// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Tool implementations
import { parseDesignTool } from "./tools/parseDesigns.js";
import { analyzeComponentsTool } from "./tools/analyzeComponents.js";
import { generateInstructionTool } from "./tools/generateInstruction.js";

const server = new McpServer({
  name: "supercomponents-server",
  version: "0.1.0",
  capabilities: {
    tools: {}
  }
});

// Tools list
const tools = [
  parseDesignTool.definition,
  analyzeComponentsTool.definition,
  generateInstructionTool.definition
];

// Tool handlers
const toolHandlers = {
  "parse.design": parseDesignTool.handler,
  "analyze.components": analyzeComponentsTool.handler,
  "generate.instruction": generateInstructionTool.handler
};

// TODO: Register handlers - need to find correct MCP server API
// The setRequestHandler method doesn't exist on McpServer type
// server.setRequestHandler("tools/list", async () => ({
//   tools: tools
// }));

// server.setRequestHandler("tools/call", async (request: any) => {
//   const { name, arguments: args } = request.params;
//   
//   const handler = toolHandlers[name as keyof typeof toolHandlers];
//   if (!handler) {
//     throw new Error(`Unknown tool: ${name}`);
//   }
//   
//   return handler(args);
// });

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SuperComponents MCP Server running on stdio");
}

main().catch(console.error);