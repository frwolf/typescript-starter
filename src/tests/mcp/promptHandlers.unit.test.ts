import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerPromptHandlers } from '../../mcp/prompts/promptHandlers';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

describe('registerPromptHandlers', () => {
  let mockServer: { setRequestHandler: ReturnType<typeof vi.fn> };
  let notes: Record<string, { title: string; content: string }>;

  beforeEach(() => {
    notes = {
      '1': { title: 'Note One', content: 'Content of note one' },
      '2': { title: 'Note Two', content: 'Content of note two' }
    };

    mockServer = {
      setRequestHandler: vi.fn()
    };
  });

  it('registers ListPromptsRequestSchema and GetPromptRequestSchema handlers', () => {
    registerPromptHandlers(mockServer as unknown as Server, notes);

    expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      ListPromptsRequestSchema,
      expect.any(Function)
    );
    expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
      GetPromptRequestSchema,
      expect.any(Function)
    );
  });

  it('ListPromptsRequestSchema handler returns expected prompt list', async () => {
    registerPromptHandlers(mockServer as unknown as Server, notes);

    const listHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === ListPromptsRequestSchema
    )![1]!;

    const result = await listHandler();

    expect(result).toEqual({
      prompts: [
        {
          name: 'summarize_notes',
          description: 'Summarize all notes'
        }
      ]
    });
  });

  it('GetPromptRequestSchema handler returns expected messages for summarize_notes', async () => {
    registerPromptHandlers(mockServer as unknown as Server, notes);

    const getHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === GetPromptRequestSchema
    )![1]!;

    const request = {
      params: {
        name: 'summarize_notes'
      }
    };

    const result = await getHandler(request);

    expect(result).toHaveProperty('messages');
    expect(Array.isArray(result.messages)).toBe(true);

    // Check that the first message is the instruction
    expect(result.messages[0]).toEqual({
      role: 'user',
      content: {
        type: 'text',
        text: 'Please summarize the following notes:'
      }
    });

    // Check that embedded notes are included
    const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
      role: 'user',
      content: {
        type: 'resource',
        resource: {
          uri: `note:///${id}`,
          mimeType: 'text/plain',
          text: note.content
        }
      }
    }));

    embeddedNotes.forEach((embeddedNote) => {
      expect(result.messages).toContainEqual(embeddedNote);
    });

    // Check that the last message is the summary instruction
    expect(result.messages[result.messages.length - 1]).toEqual({
      role: 'user',
      content: {
        type: 'text',
        text: 'Provide a concise summary of all the notes above.'
      }
    });
  });

  it('GetPromptRequestSchema handler throws error for unknown prompt', async () => {
    registerPromptHandlers(mockServer as unknown as Server, notes);

    const getHandler = mockServer.setRequestHandler.mock.calls.find(
      ([schema]) => schema === GetPromptRequestSchema
    )![1]!;

    const request = {
      params: {
        name: 'unknown_prompt'
      }
    };

    await expect(getHandler(request)).rejects.toThrow('Unknown prompt');
  });
});
