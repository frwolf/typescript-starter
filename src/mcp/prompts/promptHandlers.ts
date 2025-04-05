import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Request } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register prompt-related handlers on the MCP server.
 * @param server The MCP server instance
 * @param notes The notes storage object
 */
export function registerPromptHandlers(
  server: Server,
  notes: { [id: string]: { title: string; content: string } }
) {
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'summarize_notes',
          description: 'Summarize all notes'
        }
      ]
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request: Request) => {
    if (!request.params || request.params.name !== 'summarize_notes') {
      throw new Error('Unknown prompt');
    }

    const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
      type: 'resource' as const,
      resource: {
        uri: `note:///${id}`,
        mimeType: 'text/plain',
        text: note.content
      }
    }));

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Please summarize the following notes:'
          }
        },
        ...embeddedNotes.map((note) => ({
          role: 'user' as const,
          content: note
        })),
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Provide a concise summary of all the notes above.'
          }
        }
      ]
    };
  });
}
