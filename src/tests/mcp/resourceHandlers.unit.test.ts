import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { registerResourceHandlers } from '../../mcp/resources/resourceHandlers';
import { Note } from '../../models/note';

interface MockServer extends Partial<Server> {
  setRequestHandler: ReturnType<typeof vi.fn>;
}

describe('registerResourceHandlers', () => {
  let mockServer: MockServer;
  let notes: Record<string, Note>;

  beforeEach(() => {
    notes = {
      '1': { title: 'Note One', content: 'Content of note one' },
      '2': { title: 'Note Two', content: 'Content of note two' }
    };

    mockServer = {
      setRequestHandler: vi.fn()
    };
  });

  it('registers ListResourcesRequestSchema and ReadResourceRequestSchema handlers', () => {
    registerResourceHandlers(mockServer as unknown as Server, notes);

    expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ListResourcesRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ReadResourceRequestSchema,
      expect.any(Function)
    );
  });

  it('ListResourcesRequestSchema handler returns transformed notes', async () => {
    registerResourceHandlers(mockServer as unknown as Server, notes);

    const listHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === ListResourcesRequestSchema
    )![1]!;

    const result = await listHandler();

    expect(result.resources).toHaveLength(2);
    expect(result.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: 'note:///1',
          mimeType: 'text/plain',
          name: 'Note One',
          description: 'A text note: Note One'
        }),
        expect.objectContaining({
          uri: 'note:///2',
          mimeType: 'text/plain',
          name: 'Note Two',
          description: 'A text note: Note Two'
        })
      ])
    );
  });

  it('ReadResourceRequestSchema handler returns note content for valid note', async () => {
    registerResourceHandlers(mockServer as unknown as Server, notes);

    const readHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === ReadResourceRequestSchema
    )![1]!;

    const request = {
      params: {
        uri: 'note:///1'
      }
    };

    const result = await readHandler(request);

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0]).toEqual({
      uri: 'note:///1',
      mimeType: 'text/plain',
      text: 'Content of note one'
    });
  });

  it('ReadResourceRequestSchema handler throws error if params missing', async () => {
    registerResourceHandlers(mockServer as unknown as Server, notes);

    const readHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === ReadResourceRequestSchema
    )![1]!;

    await expect(readHandler({})).rejects.toThrow('Invalid request');
  });

  it('ReadResourceRequestSchema handler throws error if note not found', async () => {
    // @ts-expect-error partial mock
    registerResourceHandlers(mockServer, notes);

    const readHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === ReadResourceRequestSchema
    )![1]!;

    const request = {
      params: {
        uri: 'note:///999'
      }
    };

    await expect(readHandler(request)).rejects.toThrow('Note 999 not found');
  });
});
