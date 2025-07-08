#!/usr/bin/env node

// Simple test to verify the MCP server starts correctly
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing MCP Server...\n');

const serverPath = join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send a simple request to list tools
const request = {
  jsonrpc: '2.0',
  method: 'tools/list',
  params: {},
  id: 1
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(request) + '\n');
}, 1000);

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString());
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

// Exit after 3 seconds
setTimeout(() => {
  console.log('\nTest complete!');
  server.kill();
  process.exit(0);
}, 3000);