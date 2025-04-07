import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getLogger } from '../../config/LogConfig';
import { initializeMcpServer } from '../../mcp/mcpServer';

// Mock the StdioServerTransport class to avoid real instantiation
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => ({}))
  };
});

describe('initializeMcpServer', () => {
  let connectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock Server.prototype.connect
    connectMock = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(Server.prototype, 'connect').mockImplementation(connectMock);

    // Optionally, mock logger if you want to verify logs
    // For now, skip mocking logger
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize MCP server successfully', async () => {
    await expect(initializeMcpServer()).resolves.toBeUndefined();
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('should throw error if server connection fails', async () => {
    const error = new Error('Connection failed');
    connectMock.mockRejectedValueOnce(error);

    const log = getLogger('mcpServer');
    const errorSpy = vi.spyOn(log, 'error').mockImplementation(() => {});

    await expect(initializeMcpServer()).rejects.toThrow('Connection failed');
    expect(connectMock).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });
});
