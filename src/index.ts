#!/usr/bin/env node
import { DesignSystemMCPServer } from "./server.js";

async function main() {
  const server = new DesignSystemMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});