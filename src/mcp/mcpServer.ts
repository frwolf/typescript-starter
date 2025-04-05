import { getLogger } from '../config/LogConfig.js';

const log = getLogger('mcpServer');

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerPromptHandlers } from './prompts/promptHandlers.js';
import { registerResourceHandlers } from './resources/resourceHandlers.js';
import { registerToolHandlers } from './tools/toolHandlers.js';

/**
 * Type alias for a note object.
 */
type Note = { title: string; content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
  '1': { title: 'First Note', content: 'This is note 1' },
  '2': { title: 'Second Note', content: 'This is note 2' }
};

/**
 * Create an MCP server with capabilities for resources, tools, and prompts.
 */
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

// Register handlers
registerPromptHandlers(server, notes);
registerResourceHandlers(server, notes);
registerToolHandlers(server, notes);

/**
 * Initializes and starts the MCP server
 */
export async function initializeMcpServer(): Promise<void> {
  log.info('Initializing MCP server...');

  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log.info('MCP server initialized successfully');
  } catch (error) {
    log.error('Failed to initialize MCP server:', error);
    throw error;
  }
}
