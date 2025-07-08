import {
  ServerLifecycleManager,
  ServerState,
  ServerConfig,
  HealthCheckRegistry,
  ConnectionManager,
  createServerLifecycleManager,
  createHealthCheck,
  HealthStatus,
  HealthCheck,
  ServerMetrics,
} from '../../src/server/lifecycle.js';
import { MCPError, MCPErrorCode } from '../../src/server/errors.js';
import { initializeLogger } from '../../src/utils/logger.js';

// Test configuration
const testConfig: ServerConfig = {
  name: 'test-server',
  version: '1.0.0',
  port: 3000,
  host: 'localhost',
  healthCheckInterval: 100,
  shutdownTimeout: 1000,
  maxConnections: 10,
  env: 'test',
};

describe('Server Lifecycle Management', () => {
  beforeAll(() => {
    // Initialize logger for tests
    initializeLogger({
      logLevel: 'error',
      nodeEnv: 'test'
    });
  });

  afterEach(() => {
    // Clear all timers to prevent interference
    jest.clearAllTimers();
  });

  describe('HealthCheckRegistry', () => {
    let registry: HealthCheckRegistry;

    beforeEach(() => {
      registry = new HealthCheckRegistry();
    });

    it('should register and unregister health checks', () => {
      const mockCheck = jest.fn().mockResolvedValue({
        name: 'test-check',
        status: 'pass',
        timestamp: new Date(),
      });

      registry.register('test-check', mockCheck);
      expect(registry.getRegisteredChecks()).toContain('test-check');

      const removed = registry.unregister('test-check');
      expect(removed).toBe(true);
      expect(registry.getRegisteredChecks()).not.toContain('test-check');
    });

    it('should run all registered health checks', async () => {
      const mockCheck1 = jest.fn().mockResolvedValue({
        name: 'check1',
        status: 'pass',
        timestamp: new Date(),
      });
      const mockCheck2 = jest.fn().mockResolvedValue({
        name: 'check2',
        status: 'pass',
        timestamp: new Date(),
      });

      registry.register('check1', mockCheck1);
      registry.register('check2', mockCheck2);

      const results = await registry.runAll();
      expect(results).toHaveLength(2);
      expect(mockCheck1).toHaveBeenCalled();
      expect(mockCheck2).toHaveBeenCalled();
    });

    it('should handle health check errors gracefully', async () => {
      const mockCheck = jest.fn().mockRejectedValue(new Error('Check failed'));
      registry.register('failing-check', mockCheck);

      const results = await registry.runAll();
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('fail');
      expect(results[0].output).toContain('Check failed');
    });

    it('should measure check duration', async () => {
      const mockCheck = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          name: 'slow-check',
          status: 'pass',
          timestamp: new Date(),
        };
      });

      registry.register('slow-check', mockCheck);
      const results = await registry.runAll();
      expect(results[0].duration).toBeGreaterThan(5);
    });
  });

  describe('ConnectionManager', () => {
    let manager: ConnectionManager;

    beforeEach(() => {
      manager = new ConnectionManager(5);
    });

    it('should add and remove connections', () => {
      manager.addConnection('conn-1', { type: 'websocket' });
      expect(manager.getConnectionCount()).toBe(1);

      const connections = manager.getConnections();
      expect(connections).toHaveLength(1);
      expect(connections[0].id).toBe('conn-1');
      expect(connections[0].metadata.type).toBe('websocket');

      const removed = manager.removeConnection('conn-1');
      expect(removed).toBe(true);
      expect(manager.getConnectionCount()).toBe(0);
    });

    it('should enforce maximum connection limit', () => {
      for (let i = 1; i <= 5; i++) {
        manager.addConnection(`conn-${i}`);
      }

      expect(() => {
        manager.addConnection('conn-6');
      }).toThrow(MCPError);
    });

    it('should close all connections', async () => {
      manager.addConnection('conn-1');
      manager.addConnection('conn-2');
      manager.addConnection('conn-3');
      expect(manager.getConnectionCount()).toBe(3);

      await manager.closeAllConnections();
      expect(manager.getConnectionCount()).toBe(0);
    });

    it('should handle connection metadata', () => {
      const metadata = { 
        userAgent: 'test-client',
        version: '1.0.0',
        capabilities: ['tools', 'prompts']
      };

      manager.addConnection('conn-1', metadata);
      const connections = manager.getConnections();
      
      expect(connections[0].metadata).toEqual(metadata);
    });
  });

  describe('ServerLifecycleManager', () => {
    let lifecycleManager: ServerLifecycleManager;

    beforeEach(() => {
      // Create fresh instance for each test
      lifecycleManager = new ServerLifecycleManager(testConfig);
    });

    afterEach(async () => {
      // Ensure clean shutdown
      try {
        if (lifecycleManager.getState() === ServerState.RUNNING) {
          await lifecycleManager.stop();
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    describe('State Management', () => {
      it('should initialize in UNINITIALIZED state', () => {
        expect(lifecycleManager.getState()).toBe(ServerState.UNINITIALIZED);
      });

      it('should emit state change events', async () => {
        const stateChanges: Array<{ old: ServerState; new: ServerState }> = [];
        
        lifecycleManager.on('state-changed', (oldState, newState) => {
          stateChanges.push({ old: oldState, new: newState });
        });

        await lifecycleManager.start();
        
        expect(stateChanges).toHaveLength(2);
        expect(stateChanges[0]).toEqual({ old: ServerState.UNINITIALIZED, new: ServerState.STARTING });
        expect(stateChanges[1]).toEqual({ old: ServerState.STARTING, new: ServerState.RUNNING });
      });

      it('should not allow starting from invalid states', async () => {
        await lifecycleManager.start();
        await expect(lifecycleManager.start()).rejects.toThrow(MCPError);
      });
    });

    describe('Startup and Shutdown', () => {
      it('should start successfully', async () => {
        const startingEvent = jest.fn();
        const startedEvent = jest.fn();

        lifecycleManager.on('starting', startingEvent);
        lifecycleManager.on('started', startedEvent);

        await lifecycleManager.start();

        expect(lifecycleManager.getState()).toBe(ServerState.RUNNING);
        expect(startingEvent).toHaveBeenCalled();
        expect(startedEvent).toHaveBeenCalled();
      });

      it('should stop successfully', async () => {
        await lifecycleManager.start();

        const stoppingEvent = jest.fn();
        const stoppedEvent = jest.fn();

        lifecycleManager.on('stopping', stoppingEvent);
        lifecycleManager.on('stopped', stoppedEvent);

        await lifecycleManager.stop();

        expect(lifecycleManager.getState()).toBe(ServerState.STOPPED);
        expect(stoppingEvent).toHaveBeenCalled();
        expect(stoppedEvent).toHaveBeenCalled();
      });

      it('should handle graceful shutdown with timeout', async () => {
        await lifecycleManager.start();

        const shutdownPromise = lifecycleManager.gracefulShutdown(100);
        
        await expect(shutdownPromise).resolves.toBeUndefined();
        expect(lifecycleManager.getState()).toBe(ServerState.STOPPED);
      });

      it('should emit error events on startup failure', async () => {
        const errorEvent = jest.fn();
        lifecycleManager.on('error', errorEvent);

        // Mock the startHealthChecking method to throw an error
        const originalStartHealthChecking = (lifecycleManager as any).startHealthChecking;
        (lifecycleManager as any).startHealthChecking = jest.fn().mockRejectedValue(new Error('Startup failure'));

        await expect(lifecycleManager.start()).rejects.toThrow('Startup failure');
        expect(lifecycleManager.getState()).toBe(ServerState.ERROR);
        expect(errorEvent).toHaveBeenCalled();

        // Restore the original method
        (lifecycleManager as any).startHealthChecking = originalStartHealthChecking;
      });
    });

    describe('Health Monitoring (Mocked)', () => {
      beforeEach(async () => {
        // Mock health check execution to avoid real health checks
        jest.spyOn(lifecycleManager as any, 'runHealthCheck').mockResolvedValue(undefined);
        await lifecycleManager.start();
      });

      it('should provide mocked health status when running', async () => {
        // Mock the health status
        const mockHealthStatus: HealthStatus = {
          status: 'healthy',
          uptime: 1000,
          memory: process.memoryUsage(),
          connections: 0,
          lastCheck: new Date(),
          checks: [
            { name: 'memory', status: 'pass', output: 'OK', timestamp: new Date() },
            { name: 'connections', status: 'pass', output: 'OK', timestamp: new Date() },
            { name: 'server-state', status: 'pass', output: 'OK', timestamp: new Date() },
          ],
        };

        // Mock the metrics
        (lifecycleManager as any).metrics.lastHealth = mockHealthStatus;

        const healthStatus = await lifecycleManager.getHealthStatus();
        expect(healthStatus.status).toBe('healthy');
        expect(healthStatus.checks).toHaveLength(3);
      });

      it('should register custom health checks', () => {
        const customCheck = jest.fn().mockResolvedValue({
          name: 'custom',
          status: 'pass',
          timestamp: new Date(),
        });

        lifecycleManager.registerHealthCheck('custom', customCheck);
        const removed = lifecycleManager.unregisterHealthCheck('custom');
        
        expect(removed).toBe(true);
      });

      it('should report unhealthy when server is not running', async () => {
        await lifecycleManager.stop();

        const healthStatus = await lifecycleManager.getHealthStatus();
        expect(healthStatus.status).toBe('unhealthy');
        expect(healthStatus.checks[0].name).toBe('server-state');
        expect(healthStatus.checks[0].status).toBe('fail');
      });
    });

    describe('Connection Management', () => {
      beforeEach(async () => {
        jest.spyOn(lifecycleManager as any, 'runHealthCheck').mockResolvedValue(undefined);
        await lifecycleManager.start();
      });

      it('should manage connections', () => {
        const connectionOpenedEvent = jest.fn();
        const connectionClosedEvent = jest.fn();

        lifecycleManager.on('connection-opened', connectionOpenedEvent);
        lifecycleManager.on('connection-closed', connectionClosedEvent);

        lifecycleManager.addConnection('conn-1', { type: 'websocket' });
        expect(connectionOpenedEvent).toHaveBeenCalledWith('conn-1');

        const removed = lifecycleManager.removeConnection('conn-1');
        expect(removed).toBe(true);
        expect(connectionClosedEvent).toHaveBeenCalledWith('conn-1');
      });
    });

    describe('Metrics', () => {
      beforeEach(async () => {
        jest.spyOn(lifecycleManager as any, 'runHealthCheck').mockResolvedValue(undefined);
        await lifecycleManager.start();
      });

      it('should track server metrics', () => {
        const metrics = lifecycleManager.getMetrics();

        expect(metrics.startTime).toBeInstanceOf(Date);
        expect(metrics.uptime).toBeGreaterThanOrEqual(0);
        expect(metrics.requestCount).toBe(0);
        expect(metrics.errorCount).toBe(0);
        expect(metrics.activeConnections).toBe(0);
        expect(metrics.totalConnections).toBe(0);
        expect(metrics.memoryUsage).toBeDefined();
      });

      it('should record requests and errors', () => {
        const requestProcessedEvent = jest.fn();
        const requestErrorEvent = jest.fn();

        lifecycleManager.on('request-processed', requestProcessedEvent);
        lifecycleManager.on('request-error', requestErrorEvent);

        lifecycleManager.recordRequest('req-1', 100);
        lifecycleManager.recordError('req-2', new Error('Test error'));

        const metrics = lifecycleManager.getMetrics();
        expect(metrics.requestCount).toBe(1);
        expect(metrics.errorCount).toBe(1);

        expect(requestProcessedEvent).toHaveBeenCalledWith('req-1', 100);
        expect(requestErrorEvent).toHaveBeenCalledWith('req-2', expect.any(Error));
      });
    });

    describe('Signal Handling', () => {
      beforeEach(async () => {
        jest.spyOn(lifecycleManager as any, 'runHealthCheck').mockResolvedValue(undefined);
        await lifecycleManager.start();
      });

      it('should emit shutdown signal events', () => {
        const shutdownSignalEvent = jest.fn();
        lifecycleManager.on('shutdown-signal', shutdownSignalEvent);

        // Simulate SIGINT
        process.emit('SIGINT', 'SIGINT');

        expect(shutdownSignalEvent).toHaveBeenCalledWith('SIGINT');
      });
    });
  });

  describe('Utility Functions', () => {
    it('should create server lifecycle manager with config', () => {
      const manager = createServerLifecycleManager(testConfig);
      expect(manager).toBeInstanceOf(ServerLifecycleManager);
      expect(manager.getState()).toBe(ServerState.UNINITIALIZED);
    });

    it('should create health check function', async () => {
      const checkFunction = createHealthCheck(
        'test-check',
        async () => true,
        'Test description'
      );

      const result = await checkFunction();
      expect(result.name).toBe('test-check');
      expect(result.status).toBe('pass');
      expect(result.output).toBe('Test description');
    });

    it('should handle health check failures', async () => {
      const checkFunction = createHealthCheck(
        'failing-check',
        async () => { throw new Error('Check failed'); }
      );

      const result = await checkFunction();
      expect(result.name).toBe('failing-check');
      expect(result.status).toBe('fail');
      expect(result.output).toContain('Check failed');
    });
  });

  describe('Integration Tests (Isolated)', () => {
    it('should handle complete server lifecycle with mocked health checks', async () => {
      const events: string[] = [];
      const manager = createServerLifecycleManager(testConfig);

      // Mock health checking to avoid real async operations
      jest.spyOn(manager as any, 'runHealthCheck').mockResolvedValue(undefined);

      // Track all events
      manager.on('state-changed', (oldState, newState) => {
        events.push(`state-changed: ${oldState} -> ${newState}`);
      });
      manager.on('starting', () => events.push('starting'));
      manager.on('started', () => events.push('started'));
      manager.on('stopping', () => events.push('stopping'));
      manager.on('stopped', () => events.push('stopped'));

      // Start server
      await manager.start();
      expect(manager.getState()).toBe(ServerState.RUNNING);

      // Add some connections and requests
      manager.addConnection('conn-1');
      manager.recordRequest('req-1', 50);

      // Stop server
      await manager.stop();
      expect(manager.getState()).toBe(ServerState.STOPPED);

      // Verify event sequence
      expect(events).toEqual([
        'state-changed: uninitialized -> starting',
        'starting',
        'state-changed: starting -> running',
        'started',
        'state-changed: running -> stopping',
        'stopping',
        'state-changed: stopping -> stopped',
        'stopped',
      ]);
    });
  });
}); 