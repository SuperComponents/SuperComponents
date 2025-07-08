#!/usr/bin/env node
// Wrapper script that proxies to dist/cli.js

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
const args = process.argv.slice(2);

const child = spawn('node', [cliPath, ...args], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Error starting CLI:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
