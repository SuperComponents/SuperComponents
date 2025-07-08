// src/utils/logger.ts
import { ServerConfig } from '../config/server.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export class Logger {
  private readonly logLevel: LogLevel;
  private readonly enableColors: boolean;

  constructor(config: Pick<ServerConfig, 'logLevel' | 'nodeEnv'>) {
    this.logLevel = config.logLevel;
    this.enableColors = config.nodeEnv === 'development';
  }

  /**
   * Check if a log level should be output based on current configuration
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = this.enableColors ? this.colorizeLevel(entry.level) : entry.level.toUpperCase();
    const message = entry.message;
    
    let formatted = `[${timestamp}] ${level}: ${message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      formatted += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack && this.logLevel === 'debug') {
        formatted += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    return formatted;
  }

  /**
   * Add colors to log levels for development
   */
  private colorizeLevel(level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    return `${colors[level]}${level.toUpperCase()}${reset}`;
  }

  /**
   * Create a log entry with current timestamp
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  /**
   * Output log entry (to stderr for MCP compatibility)
   */
  private output(entry: LogEntry): void {
    if (this.shouldLog(entry.level)) {
      const formatted = this.formatLogEntry(entry);
      // Use stderr to avoid interfering with MCP stdio communication
      console.error(formatted);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: Record<string, any>): void {
    this.output(this.createLogEntry('debug', message, context));
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, any>): void {
    this.output(this.createLogEntry('info', message, context));
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, any>, error?: Error): void {
    this.output(this.createLogEntry('warn', message, context, error));
  }

  /**
   * Error level logging
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.output(this.createLogEntry('error', message, context, error));
  }

  /**
   * Log server startup information
   */
  logServerStart(config: Record<string, any>): void {
    this.info('🚀 SuperComponents MCP Server starting', {
      config: config,
    });
  }

  /**
   * Log server ready state
   */
  logServerReady(transport: string): void {
    this.info('✅ SuperComponents MCP Server ready', {
      transport,
      pid: process.pid,
    });
  }

  /**
   * Log server shutdown
   */
  logServerShutdown(reason: string): void {
    this.info('🛑 SuperComponents MCP Server shutting down', {
      reason,
    });
  }

  /**
   * Log tool registration
   */
  logToolRegistered(toolName: string, toolCount: number): void {
    this.debug('🔧 Tool registered', {
      toolName,
      totalTools: toolCount,
    });
  }

  /**
   * Log request processing
   */
  logRequest(method: string, params?: any): void {
    this.debug('📨 Processing request', {
      method,
      hasParams: !!params,
    });
  }

  /**
   * Log request completion
   */
  logRequestComplete(method: string, duration: number, success: boolean): void {
    this.debug('✅ Request completed', {
      method,
      duration: `${duration}ms`,
      success,
    });
  }

  /**
   * Log validation errors
   */
  logValidationError(error: any, input?: any): void {
    this.warn('❌ Validation failed', {
      error: error.message,
      hasInput: !!input,
    }, error);
  }

  /**
   * Log tool execution
   */
  logToolExecution(toolName: string, duration: number, success: boolean): void {
    const level = success ? 'debug' : 'warn';
    const emoji = success ? '⚡' : '⚠️';
    this[level](`${emoji} Tool execution ${success ? 'completed' : 'failed'}`, {
      toolName,
      duration: `${duration}ms`,
      success,
    });
  }
}

let globalLogger: Logger | null = null;

/**
 * Initialize the global logger instance
 */
export function initializeLogger(config: Pick<ServerConfig, 'logLevel' | 'nodeEnv'>): Logger {
  globalLogger = new Logger(config);
  return globalLogger;
}

/**
 * Get the global logger instance
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    throw new Error('Logger not initialized. Call initializeLogger() first.');
  }
  return globalLogger;
} 