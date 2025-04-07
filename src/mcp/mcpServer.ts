import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getLogger } from '../config/LogConfig.js';

const log = getLogger('mcpServer');

import { registerPromptHandlers } from './prompts/promptHandlers.js';
import { registerResourceHandlers } from './resources/resourceHandlers.js';
import { registerToolHandlers } from './tools/toolHandlers.js';

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes = {
  '1': { title: 'First Note', content: 'This is note 1' },
  '2': { title: 'Second Note', content: 'This is note 2' }
} as const;

/**
 * Creates, configures, and connects an MCP server instance asynchronously.
 * @returns The fully initialized Server instance
 */
async function createMcpServer(): Promise<Server> {
  log.info('Creating MCP server...');

  const server = new Server(
    {
      name: 'my-server',
      version: '0.1.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    }
  );

  registerPromptHandlers(server, notes);
  registerResourceHandlers(server, notes);
  registerToolHandlers(server, notes);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  log.info('MCP server initialized successfully');
  return server;
}

/**
 * Initializes the MCP server asynchronously.
 * Primarily used to start the server and register all handlers.
 * This function is maintained for backward compatibility.
 *
 * @returns {Promise<void>} Resolves when the server is initialized.
 * @throws Will throw an error if server initialization fails.
 */
export async function initializeMcpServer(): Promise<void> {
  try {
    await createMcpServer();
  } catch (error) {
    log.error('Failed to initialize MCP server:', error);
    throw error;
  }
}

export { createMcpServer };
