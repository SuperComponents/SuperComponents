// src/server/lifecycle.ts
import { EventEmitter } from 'events';
import { MCPError, MCPErrorCode } from './errors.js';
import { getLogger, Logger } from '../utils/logger.js';

// =====================
// Server States
// =====================

export enum ServerState {
  UNINITIALIZED = 'uninitialized',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

export interface ServerConfig {
  name: string;
  version: string;
  port?: number;
  host?: string;
  healthCheckInterval?: number;
  shutdownTimeout?: number;
  maxConnections?: number;
  env?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  memory: NodeJS.MemoryUsage;
  connections: number;
  lastCheck: Date;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  output?: string;
  duration?: number;
  timestamp: Date;
}

export interface ServerMetrics {
  startTime: Date;
  uptime: number;
  requestCount: number;
  errorCount: number;
  activeConnections: number;
  totalConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastHealth: HealthStatus;
}

// =====================
// Server Lifecycle Events
// =====================

export interface ServerLifecycleEvents {
  'state-changed': [oldState: ServerState, newState: ServerState];
  'starting': [];
  'started': [];
  'stopping': [];
  'stopped': [];
  'error': [error: Error];
  'health-check': [status: HealthStatus];
  'connection-opened': [connectionId: string];
  'connection-closed': [connectionId: string];
  'shutdown-signal': [signal: string];
  'request-processed': [requestId: string, duration: number];
  'request-error': [requestId: string, error: Error];
}

// =====================
// Health Check Registry
// =====================

export type HealthCheckFunction = () => Promise<HealthCheck>;

export class HealthCheckRegistry {
  private checks: Map<string, HealthCheckFunction> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = getLogger();
  }

  register(name: string, checkFunction: HealthCheckFunction): void {
    this.checks.set(name, checkFunction);
    this.logger.debug(`Registered health check: ${name}`);
  }

  unregister(name: string): boolean {
    const removed = this.checks.delete(name);
    if (removed) {
      this.logger.debug(`Unregistered health check: ${name}`);
    }
    return removed;
  }

  async runAll(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    
    for (const [name, checkFunction] of this.checks.entries()) {
      try {
        const startTime = Date.now();
        const result = await checkFunction();
        result.duration = Date.now() - startTime;
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'fail',
          output: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  getRegisteredChecks(): string[] {
    return Array.from(this.checks.keys());
  }
}

// =====================
// Connection Manager
// =====================

export class ConnectionManager {
  private connections: Map<string, { id: string; connectedAt: Date; metadata?: any }> = new Map();
  private maxConnections: number;
  private logger: Logger;

  constructor(maxConnections: number = 100) {
    this.maxConnections = maxConnections;
    this.logger = getLogger();
  }

  addConnection(id: string, metadata?: any): void {
    if (this.connections.size >= this.maxConnections) {
      throw new MCPError(
        MCPErrorCode.RateLimitExceeded,
        `Maximum connections exceeded (${this.maxConnections})`,
        { maxConnections: this.maxConnections, currentConnections: this.connections.size }
      );
    }

    this.connections.set(id, {
      id,
      connectedAt: new Date(),
      metadata,
    });

    this.logger.debug(`Connection added: ${id}`, { total: this.connections.size });
  }

  removeConnection(id: string): boolean {
    const removed = this.connections.delete(id);
    if (removed) {
      this.logger.debug(`Connection removed: ${id}`, { total: this.connections.size });
    }
    return removed;
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getConnections(): Array<{ id: string; connectedAt: Date; metadata?: any }> {
    return Array.from(this.connections.values());
  }

  async closeAllConnections(): Promise<void> {
    const connectionIds = Array.from(this.connections.keys());
    this.logger.info(`Closing ${connectionIds.length} connections`);
    
    for (const connectionId of connectionIds) {
      try {
        this.removeConnection(connectionId);
      } catch (error) {
        this.logger.warn(`Failed to close connection ${connectionId}`, { error });
      }
    }
  }
}

// =====================
// Server Lifecycle Manager
// =====================

export class ServerLifecycleManager extends EventEmitter<ServerLifecycleEvents> {
  private state: ServerState = ServerState.UNINITIALIZED;
  private config: ServerConfig;
  private logger: Logger;
  private healthRegistry: HealthCheckRegistry;
  private connectionManager: ConnectionManager;
  private metrics: ServerMetrics;
  private healthCheckInterval?: NodeJS.Timeout;
  private shutdownTimeout?: NodeJS.Timeout;
  private signalHandlers: Map<string, () => void> = new Map();

  constructor(config: ServerConfig) {
    super();
    this.config = config;
    this.logger = getLogger();
    this.healthRegistry = new HealthCheckRegistry();
    this.connectionManager = new ConnectionManager(config.maxConnections);
    
    this.metrics = {
      startTime: new Date(),
      uptime: 0,
      requestCount: 0,
      errorCount: 0,
      activeConnections: 0,
      totalConnections: 0,
      memoryUsage: process.memoryUsage(),
      lastHealth: {
        status: 'healthy',
        uptime: 0,
        memory: process.memoryUsage(),
        connections: 0,
        lastCheck: new Date(),
        checks: [],
      },
    };

    this.setupSignalHandlers();
    this.registerDefaultHealthChecks();
  }

  // =====================
  // State Management
  // =====================

  getState(): ServerState {
    return this.state;
  }

  private setState(newState: ServerState): void {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;
    
    this.logger.info(`Server state changed: ${oldState} → ${newState}`);
    this.emit('state-changed', oldState, newState);
  }

  // =====================
  // Startup
  // =====================

  async start(): Promise<void> {
    if (this.state !== ServerState.UNINITIALIZED && this.state !== ServerState.STOPPED) {
      throw new MCPError(
        MCPErrorCode.InvalidRequest,
        `Cannot start server in state: ${this.state}`,
        { currentState: this.state }
      );
    }

    try {
      this.setState(ServerState.STARTING);
      this.emit('starting');

      this.logger.info(`Starting ${this.config.name} v${this.config.version}`, {
        env: this.config.env,
        port: this.config.port,
        host: this.config.host,
      });

      // Initialize metrics
      this.metrics.startTime = new Date();
      
      // Server is now running
      this.setState(ServerState.RUNNING);
      this.emit('started');
      
      // Start health checking after server is fully running
      await this.startHealthChecking();
      
      this.logger.info(`${this.config.name} server started successfully`);
      
    } catch (error) {
      this.setState(ServerState.ERROR);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // =====================
  // Shutdown
  // =====================

  async stop(force: boolean = false): Promise<void> {
    if (this.state === ServerState.STOPPED || this.state === ServerState.STOPPING) {
      return;
    }

    try {
      this.setState(ServerState.STOPPING);
      this.emit('stopping');

      this.logger.info(`Stopping ${this.config.name} server`, { force });

      // Stop health checking
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }

      // Close all connections
      await this.connectionManager.closeAllConnections();

      // Clear any shutdown timeout
      if (this.shutdownTimeout) {
        clearTimeout(this.shutdownTimeout);
        this.shutdownTimeout = undefined;
      }

      // Remove signal handlers
      this.removeSignalHandlers();

      this.setState(ServerState.STOPPED);
      this.emit('stopped');
      
      this.logger.info(`${this.config.name} server stopped successfully`);
      
    } catch (error) {
      this.setState(ServerState.ERROR);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async gracefulShutdown(timeoutMs?: number): Promise<void> {
    const timeout = timeoutMs || this.config.shutdownTimeout || 30000;
    
    this.logger.info(`Initiating graceful shutdown with ${timeout}ms timeout`);

    return new Promise((resolve, reject) => {
      const shutdownPromise = this.stop(false);
      
      const timer = setTimeout(() => {
        this.logger.warn('Graceful shutdown timed out, forcing shutdown');
        this.stop(true).then(resolve).catch(reject);
      }, timeout);

      shutdownPromise
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  // =====================
  // Health Monitoring
  // =====================

  private async startHealthChecking(): Promise<void> {
    const interval = this.config.healthCheckInterval || 30000; // 30 seconds default
    
    // Run initial health check
    await this.runHealthCheck();

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.runHealthCheck();
      } catch (error) {
        this.logger.error('Health check failed', { error });
      }
    }, interval);

    this.logger.debug(`Health checking started with ${interval}ms interval`);
  }

  private async runHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const checks = await this.healthRegistry.runAll();
      const uptime = Date.now() - this.metrics.startTime.getTime();
      const memory = process.memoryUsage();
      const connections = this.connectionManager.getConnectionCount();

      // Determine overall health status
      const hasFailures = checks.some(check => check.status === 'fail');
      const hasWarnings = checks.some(check => check.status === 'warn');
      
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (hasFailures) {
        status = 'unhealthy';
      } else if (hasWarnings) {
        status = 'degraded';
      }

      const healthStatus: HealthStatus = {
        status,
        uptime,
        memory,
        connections,
        lastCheck: new Date(),
        checks,
      };

      this.metrics.lastHealth = healthStatus;
      this.metrics.uptime = uptime;
      this.metrics.memoryUsage = memory;
      this.metrics.activeConnections = connections;

      this.emit('health-check', healthStatus);

      const duration = Date.now() - startTime;
      this.logger.debug(`Health check completed in ${duration}ms`, { status, checks: checks.length });
      
    } catch (error) {
      this.logger.error('Health check execution failed', { error });
      throw error;
    }
  }

  registerHealthCheck(name: string, checkFunction: HealthCheckFunction): void {
    this.healthRegistry.register(name, checkFunction);
  }

  unregisterHealthCheck(name: string): boolean {
    return this.healthRegistry.unregister(name);
  }

  async getHealthStatus(): Promise<HealthStatus> {
    if (this.state !== ServerState.RUNNING) {
      return {
        status: 'unhealthy',
        uptime: 0,
        memory: process.memoryUsage(),
        connections: 0,
        lastCheck: new Date(),
        checks: [{
          name: 'server-state',
          status: 'fail',
          output: `Server is not running (state: ${this.state})`,
          timestamp: new Date(),
        }],
      };
    }

    return this.metrics.lastHealth;
  }

  // =====================
  // Connection Management
  // =====================

  addConnection(id: string, metadata?: any): void {
    this.connectionManager.addConnection(id, metadata);
    this.metrics.totalConnections++;
    this.emit('connection-opened', id);
  }

  removeConnection(id: string): boolean {
    const removed = this.connectionManager.removeConnection(id);
    if (removed) {
      this.emit('connection-closed', id);
    }
    return removed;
  }

  getConnections(): Array<{ id: string; connectedAt: Date; metadata?: any }> {
    return this.connectionManager.getConnections();
  }

  // =====================
  // Metrics
  // =====================

  getMetrics(): ServerMetrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime.getTime(),
      memoryUsage: process.memoryUsage(),
      activeConnections: this.connectionManager.getConnectionCount(),
    };
  }

  recordRequest(requestId: string, duration?: number): void {
    this.metrics.requestCount++;
    if (duration) {
      this.emit('request-processed', requestId, duration);
    }
  }

  recordError(requestId?: string, error?: Error): void {
    this.metrics.errorCount++;
    if (requestId && error) {
      this.emit('request-error', requestId, error);
    }
  }

  // =====================
  // Signal Handling
  // =====================

  private setupSignalHandlers(): void {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      const handler = () => {
        this.logger.info(`Received ${signal}, initiating graceful shutdown`);
        this.emit('shutdown-signal', signal);
        this.gracefulShutdown().catch(error => {
          this.logger.error('Graceful shutdown failed', { error });
          process.exit(1);
        });
      };

      this.signalHandlers.set(signal, handler);
      process.on(signal, handler);
    });

    this.logger.debug('Signal handlers registered', { signals });
  }

  private removeSignalHandlers(): void {
    for (const [signal, handler] of this.signalHandlers.entries()) {
      process.off(signal, handler);
    }
    this.signalHandlers.clear();
    this.logger.debug('Signal handlers removed');
  }

  // =====================
  // Default Health Checks
  // =====================

  private registerDefaultHealthChecks(): void {
    // Memory usage check
    this.registerHealthCheck('memory', async () => {
      const memory = process.memoryUsage();
      const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
      const heapUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;

      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let output = `Heap usage: ${heapUsedMB}MB/${heapTotalMB}MB (${heapUsagePercent.toFixed(1)}%)`;

      if (heapUsagePercent > 90) {
        status = 'fail';
        output += ' - Critical memory usage';
      } else if (heapUsagePercent > 75) {
        status = 'warn';
        output += ' - High memory usage';
      }

      return {
        name: 'memory',
        status,
        output,
        timestamp: new Date(),
      };
    });

    // Connection count check
    this.registerHealthCheck('connections', async () => {
      const connections = this.connectionManager.getConnectionCount();
      const maxConnections = this.config.maxConnections || 100;
      const usagePercent = (connections / maxConnections) * 100;

      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let output = `Active connections: ${connections}/${maxConnections} (${usagePercent.toFixed(1)}%)`;

      if (usagePercent > 90) {
        status = 'fail';
        output += ' - Critical connection usage';
      } else if (usagePercent > 75) {
        status = 'warn';
        output += ' - High connection usage';
      }

      return {
        name: 'connections',
        status,
        output,
        timestamp: new Date(),
      };
    });

    // Server state check
    this.registerHealthCheck('server-state', async () => {
      const isHealthy = this.state === ServerState.RUNNING;
      
      return {
        name: 'server-state',
        status: isHealthy ? 'pass' : 'fail',
        output: `Server state: ${this.state}`,
        timestamp: new Date(),
      };
    });
  }
}

// =====================
// Utility Functions
// =====================

export function createServerLifecycleManager(config: ServerConfig): ServerLifecycleManager {
  return new ServerLifecycleManager(config);
}

export function createHealthCheck(
  name: string,
  checkFunction: () => Promise<boolean>,
  description?: string
): HealthCheckFunction {
  return async (): Promise<HealthCheck> => {
    try {
      const result = await checkFunction();
      return {
        name,
        status: result ? 'pass' : 'fail',
        output: description || (result ? 'Check passed' : 'Check failed'),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name,
        status: 'fail',
        output: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      };
    }
  };
}

// =====================
// Export complete - all types already exported above
// ===================== 