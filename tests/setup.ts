// Jest setup file for MCP server tests
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock console methods for cleaner test output
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
}); 