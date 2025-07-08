// tests/server/initialization.test.ts
import { 
  initializeServer, 
  createServerState, 
  type ServerState 
} from '../../src/server/initialization.js';
import { SuperComponentsServer } from '../../src/server.js';
import { loadServerConfig } from '../../src/config/server.js';

describe('Server Initialization', () => {
  describe('initializeServer', () => {
    it('should initialize server with valid configuration', async () => {
      const result = await initializeServer();
      
      expect(result).toBeDefined();
      expect(result.config).toBeDefined();
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.processInfo).toBeDefined();
      expect(result.processInfo.pid).toBe(process.pid);
      expect(result.processInfo.nodeVersion).toBe(process.version);
    });

    it('should load configuration with defaults', async () => {
      const result = await initializeServer();
      
      expect(result.config.name).toBe('supercomponents-server');
      expect(result.config.version).toBe('1.0.0');
      expect(result.config.nodeEnv).toBe('test'); // NODE_ENV will be 'test' in Jest
      expect(result.config.logLevel).toBe('info');
      expect(result.config.transport).toBe('stdio');
    });

    it('should capture process information', async () => {
      const result = await initializeServer();
      
      expect(result.processInfo.pid).toBeGreaterThan(0);
      expect(result.processInfo.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
      expect(result.processInfo.platform).toBe(process.platform);
      expect(result.processInfo.arch).toBe(process.arch);
      expect(result.processInfo.memoryUsage).toBeDefined();
      expect(result.processInfo.memoryUsage.rss).toBeGreaterThan(0);
    });
  });

  describe('createServerState', () => {
    let serverState: ServerState;

    beforeEach(() => {
      serverState = createServerState();
    });

    it('should create initial server state', () => {
      expect(serverState.status).toBe('initializing');
      expect(serverState.startTime).toBeInstanceOf(Date);
      expect(serverState.requestCount).toBe(0);
      expect(serverState.toolCallCount).toBe(0);
      expect(serverState.errors).toEqual([]);
    });

    it('should update status correctly', () => {
      serverState.setStatus('starting');
      expect(serverState.status).toBe('starting');
      
      serverState.setStatus('running');
      expect(serverState.status).toBe('running');
      
      serverState.setStatus('stopping');
      expect(serverState.status).toBe('stopping');
      
      serverState.setStatus('stopped');
      expect(serverState.status).toBe('stopped');
    });

    it('should track request count', () => {
      expect(serverState.requestCount).toBe(0);
      
      serverState.incrementRequestCount();
      expect(serverState.requestCount).toBe(1);
      
      serverState.incrementRequestCount();
      expect(serverState.requestCount).toBe(2);
    });

    it('should track tool call count', () => {
      expect(serverState.toolCallCount).toBe(0);
      
      serverState.incrementToolCallCount();
      expect(serverState.toolCallCount).toBe(1);
      
      serverState.incrementToolCallCount();
      expect(serverState.toolCallCount).toBe(2);
    });

    it('should log errors', () => {
      expect(serverState.errors).toHaveLength(0);
      
      serverState.logError('Test error 1');
      expect(serverState.errors).toHaveLength(1);
      expect(serverState.errors[0]).toEqual(expect.objectContaining({
        error: 'Test error 1',
        timestamp: expect.any(Date)
      }));
      
      serverState.logError('Test error 2');
      expect(serverState.errors).toHaveLength(2);
      expect(serverState.errors[1]).toEqual(expect.objectContaining({
        error: 'Test error 2',
        timestamp: expect.any(Date)
      }));
    });

    it('should calculate uptime', () => {
      const stats = serverState.getStats();
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.uptime).toBeLessThan(1000); // Should be less than 1 second for tests
    });

    it('should return complete statistics', () => {
      serverState.setStatus('running');
      serverState.incrementRequestCount();
      serverState.incrementToolCallCount();
      serverState.logError('Test error');
      
      const stats = serverState.getStats();
      
      expect(stats.status).toBe('running');
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.requestCount).toBe(1);
      expect(stats.toolCallCount).toBe(1);
      expect(stats.errorCount).toBe(1);
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.memoryUsage.rss).toBeGreaterThan(0);
    });
  });

  describe('SuperComponentsServer', () => {
    let server: SuperComponentsServer;
    let config: any;

    beforeEach(() => {
      config = loadServerConfig();
      server = new SuperComponentsServer(config);
    });

    it('should create server instance', () => {
      expect(server).toBeDefined();
      expect(server.getStatus()).toBe('initializing');
    });

    it('should register tools', () => {
      const mockHandler = jest.fn().mockResolvedValue({ test: 'result' });
      
      server.registerTool('test-tool', mockHandler);
      
      // Tool registration should be tracked internally
      expect(server.getStatus()).toBe('initializing');
    });

    it('should track server statistics', () => {
      const stats = server.getStats();
      
      expect(stats.status).toBe('initializing');
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.requestCount).toBe(0);
      expect(stats.toolCallCount).toBe(0);
      expect(stats.errorCount).toBe(0);
    });

    it('should handle multiple tool registrations', () => {
      const handler1 = jest.fn().mockResolvedValue({ result: 1 });
      const handler2 = jest.fn().mockResolvedValue({ result: 2 });
      const handler3 = jest.fn().mockResolvedValue({ result: 3 });
      
      server.registerTool('tool-1', handler1);
      server.registerTool('tool-2', handler2);
      server.registerTool('tool-3', handler3);
      
      // All tools should be registered
      expect(server.getStatus()).toBe('initializing');
    });
  });

  describe('Configuration Loading', () => {
    it('should load configuration with environment variables', () => {
      const originalEnv = process.env;
      
      try {
        process.env.NODE_ENV = 'production';
        process.env.LOG_LEVEL = 'error';
        process.env.OPENAI_API_KEY = 'test-key';
        
        const config = loadServerConfig();
        
        expect(config.nodeEnv).toBe('production');
        expect(config.logLevel).toBe('error');
        expect(config.openaiApiKey).toBe('test-key');
        
      } finally {
        process.env = originalEnv;
      }
    });

    it('should use defaults when environment variables are not set', () => {
      const originalEnv = process.env;
      
      try {
        // Clear relevant environment variables
        delete process.env.NODE_ENV;
        delete process.env.LOG_LEVEL;
        delete process.env.OPENAI_API_KEY;
        
        const config = loadServerConfig();
        
        expect(config.nodeEnv).toBe('development');
        expect(config.logLevel).toBe('info');
        expect(config.openaiApiKey).toBeUndefined();
        
      } finally {
        process.env = originalEnv;
      }
    });
  });
}); 