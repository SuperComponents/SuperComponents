import { existsSync, statSync } from "fs";
import { join, resolve, dirname } from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { getLogger } from "./logger.js";

// Create require function for ES modules
const require = createRequire(import.meta.url);

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy logger getter to avoid initialization issues
const getLoggerSafe = () => {
  try {
    return getLogger();
  } catch (error) {
    // Fallback to console if logger isn't initialized
    return {
      info: (msg: string) => process.env.NODE_ENV === 'development' && process.stderr.write(`INFO: ${msg}\n`),
      debug: (msg: string) => process.env.NODE_ENV === 'development' && process.stderr.write(`DEBUG: ${msg}\n`),
      warn: (msg: string) => process.env.NODE_ENV === 'development' && process.stderr.write(`WARN: ${msg}\n`),
      error: (msg: string) => process.env.NODE_ENV === 'development' && process.stderr.write(`ERROR: ${msg}\n`)
    };
  }
};

interface CacheEntry {
  module: any;
  timestamp: number;
  filePath: string;
}

interface DevModeConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  watchPaths: string[];
  fileExtensions: string[];
}

class DevModeManager {
  private config: DevModeConfig;
  private moduleCache = new Map<string, CacheEntry>();
  private watchers: any[] = [];
  private isInitialized = false;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      ttl: parseInt(process.env.MCP_CACHE_TTL || '30000'), // 30 seconds default
      watchPaths: ['./src/tools/', './src/server/', './src/utils/'],
      fileExtensions: ['.js', '.ts', '.json']
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled || this.isInitialized) {
      return;
    }

    getLoggerSafe().info(`🔄 Dev Mode: Initializing with ${this.config.ttl}ms TTL`);
    
    try {
      // Dynamic import to avoid issues in production
      const chokidar = await import('chokidar');
      
      // Set up file watchers
      this.config.watchPaths.forEach(watchPath => {
        if (existsSync(watchPath)) {
          const watcher = chokidar.watch(watchPath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true
          });

          watcher.on('change', (filePath: string) => {
            this.invalidateModuleCache(filePath);
          });

          watcher.on('add', (filePath: string) => {
            getLoggerSafe().debug(`📁 Dev Mode: New file detected: ${filePath}`);
          });

          watcher.on('unlink', (filePath: string) => {
            this.invalidateModuleCache(filePath);
            getLoggerSafe().debug(`🗑️ Dev Mode: File deleted: ${filePath}`);
          });

          this.watchers.push(watcher);
          getLoggerSafe().debug(`👀 Dev Mode: Watching ${watchPath}`);
        }
      });

      // Set up TTL cleanup interval
      setInterval(() => {
        this.cleanupExpiredCache();
      }, Math.max(this.config.ttl / 4, 5000)); // Clean up every quarter TTL, min 5s

      this.isInitialized = true;
      getLoggerSafe().info(`✅ Dev Mode: Initialized successfully`);
      
    } catch (error) {
      getLoggerSafe().warn(`⚠️ Dev Mode: Failed to initialize file watching: ${error instanceof Error ? error.message : String(error)}`);
      getLoggerSafe().warn(`📝 Dev Mode: Install 'chokidar' for automatic file watching: npm install chokidar`);
    }
  }

  /**
   * Smart require with cache invalidation - async version using dynamic imports
   */
  async smartRequire<T = any>(modulePath: string): Promise<T> {
    // Resolve the module path relative to the src directory
    const resolvedPath = this.resolveModulePath(modulePath);
    
    if (!this.config.enabled) {
      // In production, use standard require for JS files or dynamic import for TS files
      if (resolvedPath.endsWith('.ts')) {
        const module = await import(resolvedPath);
        return module;
      } else {
        return require(resolvedPath);
      }
    }

    const now = Date.now();
    const cached = this.moduleCache.get(resolvedPath);

    // Check if cached version is still valid
    if (cached && (now - cached.timestamp) < this.config.ttl) {
      // Check if file has been modified since cache
      try {
        const stat = statSync(resolvedPath);
        if (stat.mtime.getTime() <= cached.timestamp) {
          getLoggerSafe().debug(`📦 Dev Mode: Using cached module: ${resolvedPath}`);
          return cached.module;
        }
      } catch (error) {
        // File might have been deleted, invalidate cache
        this.moduleCache.delete(resolvedPath);
      }
    }

    // Cache miss or expired - reload module
    try {
      let freshModule;
      
      if (resolvedPath.endsWith('.ts')) {
        // For TypeScript files, use dynamic import with cache busting
        const moduleUrl = `${resolvedPath}?t=${now}`;
        freshModule = await import(moduleUrl);
      } else {
        // For JS files, use require with cache invalidation
        const absolutePath = require.resolve(resolvedPath);
        this.invalidateRequireCache(absolutePath);
        freshModule = require(resolvedPath);
      }
      
      // Cache the fresh module
      this.moduleCache.set(resolvedPath, {
        module: freshModule,
        timestamp: now,
        filePath: resolvedPath
      });

      getLoggerSafe().debug(`🔄 Dev Mode: Reloaded module: ${resolvedPath}`);
      return freshModule;
      
    } catch (error) {
      getLoggerSafe().error(`❌ Dev Mode: Failed to reload module ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return cached version if available as fallback
      if (cached) {
        getLoggerSafe().warn(`⚠️ Dev Mode: Falling back to cached version of ${resolvedPath}`);
        return cached.module;
      }
      
      throw error;
    }
  }

  /**
   * Resolve module path relative to src directory
   */
  private resolveModulePath(modulePath: string): string {
    // If it's already an absolute path, return as is
    if (resolve(modulePath) === modulePath) {
      return modulePath;
    }
    
    // If it starts with './', resolve relative to src directory
    if (modulePath.startsWith('./')) {
      const srcDir = resolve(__dirname, '..');
      return resolve(srcDir, modulePath.substring(2));
    }
    
    // Otherwise, resolve relative to src directory
    const srcDir = resolve(__dirname, '..');
    return resolve(srcDir, modulePath);
  }

  /**
   * Invalidate module cache for a specific file
   */
  private invalidateModuleCache(filePath: string): void {
    const resolvedPath = this.resolveModulePath(filePath);
    
    // Remove from our custom cache
    this.moduleCache.delete(resolvedPath);
    
    // Remove from Node's require cache (for JS files)
    if (!resolvedPath.endsWith('.ts')) {
      try {
        const absolutePath = require.resolve(resolvedPath);
        this.invalidateRequireCache(absolutePath);
      } catch (error) {
        // File might not exist or be resolvable, ignore
      }
    }
    
    getLoggerSafe().info(`♻️ Dev Mode: Invalidated cache for: ${resolvedPath}`);
  }

  /**
   * Remove module from Node's require cache
   */
  private invalidateRequireCache(absolutePath: string): void {
    // Delete the module from require cache
    delete require.cache[absolutePath];
    
    // Also delete any modules that required this module
    Object.keys(require.cache).forEach(cachedPath => {
      const module = require.cache[cachedPath];
      if (module && module.children) {
        const childIndex = module.children.findIndex(child => child.filename === absolutePath);
        if (childIndex !== -1) {
          module.children.splice(childIndex, 1);
        }
      }
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [path, entry] of this.moduleCache.entries()) {
      if ((now - entry.timestamp) > this.config.ttl) {
        this.moduleCache.delete(path);
        this.invalidateRequireCache(path);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      getLoggerSafe().debug(`🧹 Dev Mode: Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { 
    enabled: boolean;
    cacheSize: number; 
    ttl: number; 
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entries = Array.from(this.moduleCache.values());
    const now = Date.now();
    
    return {
      enabled: this.config.enabled,
      cacheSize: entries.length,
      ttl: this.config.ttl,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => now - e.timestamp)) : undefined,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => now - e.timestamp)) : undefined
    };
  }

  /**
   * Force invalidate all cache
   */
  invalidateAll(): void {
    getLoggerSafe().info(`🔄 Dev Mode: Force invalidating all cache`);
    
    // Clear our cache
    for (const [path] of this.moduleCache.entries()) {
      this.invalidateRequireCache(path);
    }
    this.moduleCache.clear();
    
    // Clear all require cache for our watch paths
    this.config.watchPaths.forEach(watchPath => {
      Object.keys(require.cache).forEach(cachedPath => {
        if (cachedPath.includes(watchPath)) {
          delete require.cache[cachedPath];
        }
      });
    });
  }

  /**
   * Cleanup watchers (call on server shutdown)
   */
  async cleanup(): Promise<void> {
    getLoggerSafe().info(`🛑 Dev Mode: Cleaning up watchers`);
    
    for (const watcher of this.watchers) {
      if (watcher && typeof watcher.close === 'function') {
        await watcher.close();
      }
    }
    
    this.watchers = [];
    this.moduleCache.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const devMode = new DevModeManager();

/**
 * Initialize development mode (call this early in your server startup)
 */
export async function initializeDevMode(): Promise<void> {
  await devMode.initialize();
}

/**
 * Smart require that respects development mode cache settings
 */
export async function smartRequire<T = any>(modulePath: string): Promise<T> {
  return await devMode.smartRequire<T>(modulePath);
}

/**
 * Get development mode cache statistics
 */
export function getDevModeStats() {
  return devMode.getCacheStats();
}

/**
 * Force invalidate all development cache
 */
export function invalidateDevCache(): void {
  devMode.invalidateAll();
}

/**
 * Cleanup development mode (call on server shutdown)
 */
export async function cleanupDevMode(): Promise<void> {
  await devMode.cleanup();
} 