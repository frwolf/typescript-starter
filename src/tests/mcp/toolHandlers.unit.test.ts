import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { describe, it, expect, beforeEach } from 'vitest';

import { registerToolHandlers } from '../../../src/mcp/tools/toolHandlers';

interface CallRequest {
  params?: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

type HandlerResponse =
  | {
      tools: Array<{
        name: string;
        description: string;
        inputSchema: {
          type: string;
          properties: Record<string, { type: string; description: string }>;
          required: string[];
        };
      }>;
    }
  | { content: Array<{ type: string; text: string }> };

class MockServer {
  handlers: Record<
    string,
    (request?: CallRequest) => Promise<HandlerResponse>
  > = {};

  setRequestHandler(
    schema: object,
    handler: (request?: CallRequest) => Promise<HandlerResponse>
  ) {
    const key = this.schemaToKey(schema);
    this.handlers[key] = handler;
  }

  getHandler(
    schema: object | string
  ): (request?: CallRequest) => Promise<HandlerResponse> {
    const key = typeof schema === 'string' ? schema : this.schemaToKey(schema);
    return this.handlers[key];
  }

  private schemaToKey(schema: object): string {
    if (schema === ListToolsRequestSchema) return 'ListToolsRequestSchema';
    if (schema === CallToolRequestSchema) return 'CallToolRequestSchema';
    return 'unknown';
  }
}

describe('registerToolHandlers', () => {
  let server: MockServer;
  let notes: Record<string, { title: string; content: string }>;

  beforeEach(() => {
    server = new MockServer();
    notes = {};
    registerToolHandlers(server, notes);
  });

  it('should register ListToolsRequestSchema handler that returns create_note tool', async () => {
    const handler = server.getHandler(ListToolsRequestSchema);
    const result = await handler();
    if (!('tools' in result)) throw new Error('Expected tools in response');
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe('create_note');
    expect(result.tools[0].inputSchema.required).toEqual(['title', 'content']);
  });

  it('should create a note when calling create_note tool', async () => {
    const handler = server.getHandler(CallToolRequestSchema);
    const request = {
      params: {
        name: 'create_note',
        arguments: {
          title: 'Test Title',
          content: 'Test Content'
        }
      }
    };
    const response = await handler(request);
    if (!('content' in response))
      throw new Error('Expected content in response');
    expect(response.content[0].text).toContain('Created note 1: Test Title');
    expect(notes['1']).toEqual({
      title: 'Test Title',
      content: 'Test Content'
    });
  });

  it('should throw error if params are missing in CallToolRequestSchema', async () => {
    const handler = server.getHandler(CallToolRequestSchema);
    await expect(handler({})).rejects.toThrow('Invalid request');
  });

  it('should throw error if title or content is missing', async () => {
    const handler = server.getHandler(CallToolRequestSchema);
    const request = {
      params: {
        name: 'create_note',
        arguments: {
          title: '',
          content: ''
        }
      }
    };
    await expect(handler(request)).rejects.toThrow(
      'Title and content are required'
    );
  });

  it('should throw error for unknown tool name', async () => {
    const handler = server.getHandler(CallToolRequestSchema);
    const request = {
      params: {
        name: 'unknown_tool',
        arguments: {}
      }
    };
    await expect(handler(request)).rejects.toThrow('Unknown tool');
  });
});
