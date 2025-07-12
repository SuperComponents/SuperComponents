import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const inputSchema = z.object({
  message: z.string().optional().default("Hello from test tool!")
});

export const testTool = {
  definition: {
    name: "testTool",
    description: "Simple test tool to verify fresh code deployment",
    inputSchema: zodToJsonSchema(inputSchema),
  },

  async handler(input: any) {
    const validatedInput = inputSchema.parse(input);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          message: validatedInput.message,
          timestamp: new Date().toISOString(),
          freshCode: true,
          version: "1.0.0-TEST"
        }, null, 2)
      }],
      isError: false
    };
  }
}; 