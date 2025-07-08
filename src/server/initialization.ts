// src/server/initialization.ts
import { loadServerConfig, validateRequiredConfig, getConfigSummary, ServerConfig } from '../config/server.js';
import { initializeLogger, getLogger } from '../utils/logger.js';

export interface ServerInitializationResult {
  config: ServerConfig;
  startTime: Date;
  processInfo: {
    pid: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

/**
 * Initialize server configuration and logging
 */
export async function initializeServer(): Promise<ServerInitializationResult> {
  const startTime = new Date();
  
  try {
    // Load and validate configuration
    const config = loadServerConfig();
    validateRequiredConfig(config);
    
    // Initialize logging system
    const logger = initializeLogger(config);
    
    // Log server startup
    logger.logServerStart(getConfigSummary(config));
    
    // Collect process information
    const processInfo = {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
    };
    
    logger.debug('Process information collected', processInfo);
    
    return {
      config,
      startTime,
      processInfo,
    };
    
  } catch (error) {
    // If logger isn't initialized yet, fall back to console
    const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
    console.error(`❌ Server initialization failed: ${errorMessage}`);
    throw error;
  }
}

/**
 * Setup graceful shutdown handlers
 */
export function setupShutdownHandlers(shutdownCallback: (signal: string) => Promise<void>): void {
  const logger = getLogger();
  
  const handleShutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}, initiating graceful shutdown`);
    
    try {
      await shutdownCallback(signal);
      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown', {}, error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  };
  
  // Handle different shutdown signals
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught exception', {}, error);
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled promise rejection', {
      reason: String(reason),
      promise: String(promise),
    });
    process.exit(1);
  });
  
  logger.debug('🛡️ Shutdown handlers registered');
}

/**
 * Perform health checks during initialization
 */
export async function performHealthChecks(config: ServerConfig): Promise<void> {
  const logger = getLogger();
  
  logger.debug('🔍 Performing health checks');
  
  const checks = [
    checkNodeVersion(),
    checkMemoryUsage(),
    checkEnvironmentVariables(config),
  ];
  
  const results = await Promise.allSettled(checks);
  
  for (const [index, result] of results.entries()) {
    if (result.status === 'rejected') {
      logger.warn(`⚠️ Health check ${index + 1} failed`, {}, result.reason);
    }
  }
  
  logger.debug('✅ Health checks completed');
}

/**
 * Check Node.js version compatibility
 */
async function checkNodeVersion(): Promise<void> {
  const logger = getLogger();
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  
  if (majorVersion < 18) {
    throw new Error(`Node.js version ${nodeVersion} is not supported. Minimum required: 18.0.0`);
  }
  
  logger.debug('✅ Node.js version check passed', { nodeVersion });
}

/**
 * Check memory usage
 */
async function checkMemoryUsage(): Promise<void> {
  const logger = getLogger();
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };
  
  logger.debug('📊 Memory usage', { memoryUsageMB });
  
  // Warn if memory usage is high at startup
  if (memoryUsageMB.rss > 500) {
    logger.warn('⚠️ High memory usage detected at startup', { memoryUsageMB });
  }
}

/**
 * Check critical environment variables
 */
async function checkEnvironmentVariables(config: ServerConfig): Promise<void> {
  const logger = getLogger();
  
  const criticalVars: Array<{ name: string; value: string | undefined }> = [
    { name: 'NODE_ENV', value: config.nodeEnv },
    { name: 'LOG_LEVEL', value: config.logLevel },
  ];
  
  // Add production-specific checks
  if (config.nodeEnv === 'production') {
    criticalVars.push({
      name: 'OPENAI_API_KEY',
      value: config.openaiApiKey ? '[REDACTED]' : undefined,
    });
  }
  
  const missing = criticalVars.filter(v => !v.value);
  if (missing.length > 0) {
    logger.warn('⚠️ Missing environment variables', {
      missing: missing.map(v => v.name),
    });
  }
  
  logger.debug('✅ Environment variables check completed', {
    checked: criticalVars.map(v => ({ name: v.name, hasValue: !!v.value })),
  });
}

/**
 * Initialize server state tracking
 */
export function createServerState() {
  return {
    status: 'initializing' as 'initializing' | 'starting' | 'running' | 'stopping' | 'stopped',
    startTime: new Date(),
    requestCount: 0,
    toolCallCount: 0,
    lastRequestTime: null as Date | null,
    errors: [] as Array<{ timestamp: Date; error: string }>,
    
    // State management methods
    setStatus(newStatus: 'initializing' | 'starting' | 'running' | 'stopping' | 'stopped') {
      this.status = newStatus;
      getLogger().debug('📊 Server status changed', { status: newStatus });
    },
    
    incrementRequestCount() {
      this.requestCount++;
      this.lastRequestTime = new Date();
    },
    
    incrementToolCallCount() {
      this.toolCallCount++;
    },
    
    logError(error: string) {
      this.errors.push({ timestamp: new Date(), error });
      // Keep only last 100 errors
      if (this.errors.length > 100) {
        this.errors.shift();
      }
    },
    
    getStats() {
      return {
        status: this.status,
        uptime: Date.now() - this.startTime.getTime(),
        requestCount: this.requestCount,
        toolCallCount: this.toolCallCount,
        lastRequestTime: this.lastRequestTime,
        errorCount: this.errors.length,
        memoryUsage: process.memoryUsage(),
      };
    },
  };
}

export type ServerState = ReturnType<typeof createServerState>; 