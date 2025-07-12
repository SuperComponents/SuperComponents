import { z } from "zod";
import { Tool } from "../types.js";
import { zodToJsonSchema } from "../utils/validation.js";

// Input schema for the development cache manager tool  
const inputSchema = z.object({
  action: z.enum(["stats", "invalidate", "status"]).default("stats").describe("Action to perform: 'stats' for cache statistics, 'invalidate' to clear cache, 'status' for dev mode status"),
  random_string: z.string().optional().describe("Dummy parameter for compatibility")
});

export const devCacheManagerTool: Tool = {
  definition: {
    name: "devCacheManager",
    description: "Development tool to manage MCP server cache: view statistics, invalidate cache, or check dev mode status",
    inputSchema: zodToJsonSchema(inputSchema),
  },

  async handler(input) {
    try {
      // Handle dummy parameter case (when called via MCP with random_string)
      const processedInput = typeof input === 'object' && 'random_string' in input 
        ? { action: "stats" as const } 
        : input;
      
      // Parse and validate input with defaults
      const validatedInput = inputSchema.parse(processedInput || {});
      const { action } = validatedInput;

      // Dynamic import to avoid issues if devMode is not available
      let devModeModule;
      try {
        devModeModule = await import('../utils/devMode.js');
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              error: "Development mode not available",
              message: "Dev mode utilities are not accessible",
              action,
              isProduction: process.env.NODE_ENV === 'production'
            }, null, 2)
          }],
          isError: false
        };
      }

      const { getDevModeStats, invalidateDevCache } = devModeModule;

      switch (action) {
        case "stats": {
          const stats = getDevModeStats();
          return {
            content: [{
              type: "text", 
              text: JSON.stringify({
                success: true,
                action: "stats",
                timestamp: new Date().toISOString(),
                devMode: stats,
                environment: {
                  NODE_ENV: process.env.NODE_ENV,
                  MCP_CACHE_TTL: process.env.MCP_CACHE_TTL,
                  platform: process.platform,
                  nodeVersion: process.version
                },
                message: stats.enabled 
                  ? `Dev mode active with ${stats.cacheSize} cached modules (TTL: ${stats.ttl}ms)`
                  : "Dev mode is disabled (not in development environment)"
              }, null, 2)
            }],
            isError: false
          };
        }

        case "invalidate": {
          const statsBefore = getDevModeStats();
          invalidateDevCache();
          const statsAfter = getDevModeStats();
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: true,
                action: "invalidate",
                timestamp: new Date().toISOString(),
                before: statsBefore,
                after: statsAfter,
                message: statsBefore.enabled 
                  ? `Cache invalidated! Cleared ${statsBefore.cacheSize} cached modules`
                  : "Cache invalidation requested but dev mode is disabled"
              }, null, 2)
            }],
            isError: false
          };
        }

        case "status": {
          const stats = getDevModeStats();
          const isDevMode = process.env.NODE_ENV === 'development';
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: true,
                action: "status",
                timestamp: new Date().toISOString(),
                status: {
                  developmentMode: isDevMode,
                  cacheEnabled: stats.enabled,
                  autoReload: stats.enabled && isDevMode,
                  ttl: stats.ttl,
                  activeModules: stats.cacheSize
                },
                instructions: {
                  enableDevMode: "Set NODE_ENV=development",
                  setCacheTTL: "Set MCP_CACHE_TTL=30000 (milliseconds)",
                  runDevMode: "npm run dev (30s TTL) or npm run dev:fast (5s TTL)",
                  disableCache: "npm run dev:no-cache or set MCP_CACHE_TTL=0"
                },
                message: stats.enabled 
                  ? "🟢 Development mode active - modules auto-reload on file changes"
                  : "🔴 Development mode inactive - restart server to pick up changes"
              }, null, 2)
            }],
            isError: false
          };
        }

        default:
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: false,
                error: "Invalid action",
                validActions: ["stats", "invalidate", "status"],
                message: `Unknown action: ${action}`
              }, null, 2)
            }],
            isError: true
          };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            message: "Failed to manage development cache",
            timestamp: new Date().toISOString()
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}; 