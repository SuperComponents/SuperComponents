// src/config/server.ts
import { z } from 'zod';

/**
 * Server configuration schema with validation
 */
const ServerConfigSchema = z.object({
  // Server identification
  name: z.string().default('supercomponents-server'),
  version: z.string().default('0.1.0'),
  
  // Environment configuration
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // MCP specific configuration
  transport: z.enum(['stdio']).default('stdio'),
  
  // LLM configuration
  openaiApiKey: z.string().optional(),
  llmModel: z.string().default('gpt-4'),
  llmTemperature: z.number().min(0).max(2).default(0.1),
  llmMaxTokens: z.number().positive().default(4000),
  
  // Performance configuration
  requestTimeoutMs: z.number().positive().default(30000),
  maxConcurrentRequests: z.number().positive().default(10),
  
  // Feature flags
  enableCaching: z.boolean().default(true),
  enableRateLimit: z.boolean().default(true),
  
  // Tool configuration
  toolsDirectory: z.string().default('./src/tools'),
  schemasDirectory: z.string().default('./src/schemas'),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

/**
 * Load and validate server configuration from environment variables
 */
export function loadServerConfig(): ServerConfig {
  const rawConfig = {
    // Server basics
    name: process.env.SERVER_NAME,
    version: process.env.SERVER_VERSION || process.env.npm_package_version,
    
    // Environment
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    
    // Transport
    transport: process.env.MCP_TRANSPORT,
    
    // LLM configuration
    openaiApiKey: process.env.OPENAI_API_KEY,
    llmModel: process.env.LLM_MODEL,
    llmTemperature: process.env.LLM_TEMPERATURE ? parseFloat(process.env.LLM_TEMPERATURE) : undefined,
    llmMaxTokens: process.env.LLM_MAX_TOKENS ? parseInt(process.env.LLM_MAX_TOKENS, 10) : undefined,
    
    // Performance
    requestTimeoutMs: process.env.REQUEST_TIMEOUT_MS ? parseInt(process.env.REQUEST_TIMEOUT_MS, 10) : undefined,
    maxConcurrentRequests: process.env.MAX_CONCURRENT_REQUESTS ? parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) : undefined,
    
    // Feature flags
    enableCaching: process.env.ENABLE_CACHING ? process.env.ENABLE_CACHING === 'true' : undefined,
    enableRateLimit: process.env.ENABLE_RATE_LIMIT ? process.env.ENABLE_RATE_LIMIT === 'true' : undefined,
    
    // Tool directories
    toolsDirectory: process.env.TOOLS_DIRECTORY,
    schemasDirectory: process.env.SCHEMAS_DIRECTORY,
  };
  
  try {
    return ServerConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      throw new Error(`Server configuration validation failed: ${issues}`);
    }
    throw error;
  }
}

/**
 * Validate that required configuration is present for server operation
 */
export function validateRequiredConfig(config: ServerConfig): void {
  const missingRequired: string[] = [];
  
  // Check for required environment-specific configurations
  if (config.nodeEnv === 'production') {
    if (!config.openaiApiKey) {
      missingRequired.push('OPENAI_API_KEY');
    }
  }
  
  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required configuration for ${config.nodeEnv} environment: ${missingRequired.join(', ')}`
    );
  }
}

/**
 * Create a configuration summary for logging (excludes sensitive data)
 */
export function getConfigSummary(config: ServerConfig): Record<string, any> {
  return {
    name: config.name,
    version: config.version,
    nodeEnv: config.nodeEnv,
    logLevel: config.logLevel,
    transport: config.transport,
    llmModel: config.llmModel,
    llmTemperature: config.llmTemperature,
    llmMaxTokens: config.llmMaxTokens,
    requestTimeoutMs: config.requestTimeoutMs,
    maxConcurrentRequests: config.maxConcurrentRequests,
    enableCaching: config.enableCaching,
    enableRateLimit: config.enableRateLimit,
    toolsDirectory: config.toolsDirectory,
    schemasDirectory: config.schemasDirectory,
    // Exclude sensitive fields like openaiApiKey
  };
} 