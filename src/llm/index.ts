// src/llm/index.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

// Load environment variables
config();

// Provider type
export type Provider = 'openai' | 'anthropic';

// Provider interface
interface LLMProvider {
  complete(prompt: string, opts: any): Promise<string>;
  streamComplete(prompt: string, opts: any): AsyncGenerator<string, void, unknown>;
}

// OpenAI provider implementation
class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async complete(prompt: string, opts: any = {}): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: opts.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      ...opts
    });
    
    return response.choices[0]?.message?.content || '';
  }

  async *streamComplete(prompt: string, opts: any = {}): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: opts.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      ...opts
    }) as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }
}

// Anthropic provider implementation
class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(prompt: string, opts: any = {}): Promise<string> {
    const response = await this.client.messages.create({
      model: opts.model || 'claude-3-5-sonnet-20241022',
      max_tokens: opts.max_tokens || 1024,
      messages: [{ role: 'user', content: prompt }],
      ...opts
    });
    
    // Handle different response formats
    const content = response.content[0];
    if (content && content.type === 'text') {
      return content.text;
    }
    return '';
  }

  async *streamComplete(prompt: string, opts: any = {}): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.messages.create({
      model: opts.model || 'claude-3-5-sonnet-20241022',
      max_tokens: opts.max_tokens || 1024,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      ...opts
    }) as unknown as AsyncIterable<any>;
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }
}

// Provider instances
const openaiProvider = new OpenAIProvider();
const anthropicProvider = new AnthropicProvider();

// Determine which provider to use
function getProvider(): { provider: LLMProvider; name: Provider } {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  
  if (hasAnthropic) {
    return { provider: anthropicProvider, name: 'anthropic' };
  } else if (hasOpenAI) {
    return { provider: openaiProvider, name: 'openai' };
  }
  
  throw new Error('No API key found. Please provide either OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.');
}

// Simple in-memory cache
const cache = new Map<string, string>();

// Rate limiting configuration
const rateLimiter = {
  tokens: 10, // Start with 10 tokens
  maxTokens: 10, // Maximum tokens
  refillRate: 1, // Refill 1 token per second
  lastRefill: Date.now()
};

// Rate limiter implementation
function checkRateLimit(): boolean {
  const now = Date.now();
  const timePassed = (now - rateLimiter.lastRefill) / 1000;
  
  // Refill tokens based on time passed
  rateLimiter.tokens = Math.min(
    rateLimiter.maxTokens,
    rateLimiter.tokens + timePassed * rateLimiter.refillRate
  );
  rateLimiter.lastRefill = now;
  
  if (rateLimiter.tokens < 1) {
    return false;
  }
  
  rateLimiter.tokens--;
  return true;
}

// Wait for rate limit availability
async function waitForRateLimit(): Promise<void> {
  while (!checkRateLimit()) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Generate cache key from prompt and options
function generateCacheKey(prompt: string, opts: any, providerName: Provider): string {
  return `${providerName}:${prompt}:${JSON.stringify(opts)}`;
}

// Main completion function with caching and rate limiting
export async function complete(prompt: string, opts: any = {}): Promise<string> {
  const { provider, name } = getProvider();
  const cacheKey = generateCacheKey(prompt, opts, name);
  
  // Check cache first
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  // Wait for rate limit
  await waitForRateLimit();
  
  try {
    const content = await provider.complete(prompt, opts);
    
    // Cache the response
    cache.set(cacheKey, content);
    
    return content;
  } catch (error) {
    // Add error handling for API failures
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    } else if (error instanceof Anthropic.APIError) {
      throw new Error(`Anthropic API Error: ${error.message}`);
    }
    throw error;
  }
}

// Streaming completion function for large payloads
export async function* streamComplete(prompt: string, opts: any = {}): AsyncGenerator<string, void, unknown> {
  await waitForRateLimit();
  
  try {
    const { provider } = getProvider();
    yield* provider.streamComplete(prompt, opts);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    } else if (error instanceof Anthropic.APIError) {
      throw new Error(`Anthropic API Error: ${error.message}`);
    }
    throw error;
  }
}

// Clear cache function for testing and maintenance
export function clearCache(): void {
  cache.clear();
}

// Get cache stats for monitoring
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

// Get rate limiter stats
export function getRateLimiterStats(): { tokens: number; maxTokens: number; refillRate: number } {
  return {
    tokens: rateLimiter.tokens,
    maxTokens: rateLimiter.maxTokens,
    refillRate: rateLimiter.refillRate
  };
}

// Validate API keys
export function validateApiKey(): boolean {
  return !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY;
}

// Get current provider info
export function getCurrentProvider(): { name: Provider; hasKey: boolean } {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  
  if (hasAnthropic) {
    return { name: 'anthropic', hasKey: true };
  } else if (hasOpenAI) {
    return { name: 'openai', hasKey: true };
  }
  
  return { name: 'openai', hasKey: false };
} 