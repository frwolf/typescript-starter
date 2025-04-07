#!/usr/bin/env node

import process from 'node:process';

import { getLogger } from './config/LogConfig.js';
import { initializeMcpServer } from './mcp/mcpServer.js';
import type { Config } from './models/config-model.js';
import { validateConfig } from './utils/utils.js';

const log = getLogger('process');

// Handle SIGINT & SIGTERM signals
/**
 * Cleanup resources and exit the process.
 * Logs a cleanup message and exits with code 0.
 */
const cleanup = () => {
  log.info('Performing cleanup...');
  // Add cleanup logic here
  process.exit(0);
};

// Handle signals
process.on('SIGINT', () => {
  log.info('Received SIGINT (Ctrl+C)');
  cleanup();
});

process.on('SIGTERM', () => {
  log.info('Received SIGTERM');
  cleanup();
});

const serverConfig: Config = {
  id: `srv-1`,
  description: `Config for Server-1`,
  count: 3
};

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  log.info(`Begin processing.`);

  // As an example (see Dockerfile) when the app is running in containerized environment, the CONTAINERIZED env variable is set to true
  log.info(`ENV CONTAINERIZED: ${process.env.CONTAINERIZED}`);

  const validationResult = await validateConfig(serverConfig);
  if (validationResult) {
    log.info(`Server config is valid!`);
  } else {
    log.info(`Server config is not valid!`);
  }

  // Initialize and start the MCP server
  try {
    await initializeMcpServer();
    log.info('MCP server is running...');
  } catch (error) {
    log.error('Failed to start MCP server:', error);
  }

  log.info(`Processing ready.`);
}
main().catch((error) => {
  log.error('Server error:', error);
  process.exit(1);
});
