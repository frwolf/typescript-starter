import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockValidateConfig = vi.fn();
const mockInitializeMcpServer = vi.fn();
const mockLogInfo = vi.fn();
const mockLogError = vi.fn();
const mockGetLogger = vi.fn(() => ({
  info: mockLogInfo,
  error: mockLogError
}));

vi.mock('../utils/utils.js', () => ({
  validateConfig: mockValidateConfig
}));

vi.mock('../mcp/mcpServer.js', () => ({
  initializeMcpServer: mockInitializeMcpServer
}));

vi.mock('../config/LogConfig.js', () => ({
  getLogger: mockGetLogger
}));

describe('src/index.ts', () => {
  let originalProcessExit: typeof process.exit;
  let originalProcessOn: typeof process.on;
  let signalHandlers: Record<string, () => void> = {};

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Mock process.exit
    originalProcessExit = process.exit;
    process.exit = vi.fn() as unknown as typeof process.exit;

    // Mock process.on to capture signal handlers
    originalProcessOn = process.on;
    signalHandlers = {};
    process.on = vi.fn((signal: string, handler: () => void) => {
      signalHandlers[signal] = handler;
      return process as unknown as NodeJS.Process;
    }) as unknown as typeof process.on;
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.exit = originalProcessExit;
    process.on = originalProcessOn;
  });

  it('should log valid config and start MCP server successfully', async () => {
    mockValidateConfig.mockResolvedValue(true);
    mockInitializeMcpServer.mockResolvedValue(undefined);

    await import('../../src/index.js');

    expect(mockValidateConfig).toHaveBeenCalled();
    expect(mockInitializeMcpServer).toHaveBeenCalled();
    expect(mockLogInfo).toHaveBeenCalledWith('Server config is valid!');
    expect(mockLogInfo).toHaveBeenCalledWith('MCP server is running...');
  });

  it('should log invalid config', async () => {
    mockValidateConfig.mockResolvedValue(false);
    mockInitializeMcpServer.mockResolvedValue(undefined);

    await import('../../src/index.js');

    expect(mockValidateConfig).toHaveBeenCalled();
    expect(mockLogInfo).toHaveBeenCalledWith('Server config is not valid!');
  });

  it('should log error if MCP server fails to start', async () => {
    mockValidateConfig.mockResolvedValue(true);
    const error = new Error('Failed to start');
    mockInitializeMcpServer.mockRejectedValue(error);

    await import('../../src/index.js');

    expect(mockValidateConfig).toHaveBeenCalled();
    expect(mockInitializeMcpServer).toHaveBeenCalled();
    expect(mockLogError).toHaveBeenCalledWith(
      'Failed to start MCP server:',
      error
    );
  });

  it('should perform cleanup and exit when cleanup is called', async () => {
    await import('../../src/index.js');

    // Access cleanup via signal handler
    const cleanup = signalHandlers['SIGINT']?.toString().includes('cleanup')
      ? signalHandlers['SIGINT']
      : null;
    expect(cleanup).toBeTruthy();

    mockLogInfo.mockClear();
    (process.exit as unknown as { mockClear: () => void }).mockClear();

    if (cleanup) {
      cleanup();
      expect(mockLogInfo).toHaveBeenCalledWith('Performing cleanup...');
      expect(process.exit).toHaveBeenCalledWith(0);
    }
  });

  it('should handle SIGINT signal and perform cleanup', async () => {
    await import('../../src/index.js');

    const sigintHandler = signalHandlers['SIGINT'];
    expect(sigintHandler).toBeTruthy();

    mockLogInfo.mockClear();
    (process.exit as unknown as { mockClear: () => void }).mockClear();

    sigintHandler();

    expect(mockLogInfo).toHaveBeenCalledWith('Received SIGINT (Ctrl+C)');
    expect(mockLogInfo).toHaveBeenCalledWith('Performing cleanup...');
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should handle SIGTERM signal and perform cleanup', async () => {
    await import('../../src/index.js');

    const sigtermHandler = signalHandlers['SIGTERM'];
    expect(sigtermHandler).toBeTruthy();

    mockLogInfo.mockClear();
    (process.exit as unknown as { mockClear: () => void }).mockClear();

    sigtermHandler();

    expect(mockLogInfo).toHaveBeenCalledWith('Received SIGTERM');
    expect(mockLogInfo).toHaveBeenCalledWith('Performing cleanup...');
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should log error and exit if main throws unhandled error', async () => {
    // Mock validateConfig and initializeMcpServer to throw synchronously
    mockValidateConfig.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    (process.exit as unknown as { mockClear: () => void }).mockClear();

    await import('../../src/index.js');

    expect(mockLogError).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
