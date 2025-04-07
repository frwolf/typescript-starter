import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Request } from '@modelcontextprotocol/sdk/types.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Registers tool-related handlers on the MCP server.
 *
 * Handlers:
 * - ListToolsRequest: Lists available tools (e.g., create_note).
 * - CallToolRequest: Executes a tool, such as creating a new note.
 *
 * @param server The MCP server instance.
 * @param notes An object mapping note IDs to note objects containing title and content.
 */
export const registerToolHandlers = (
  server: Server,
  notes: { [id: string]: { title: string; content: string } }
): void => {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'create_note',
          description: 'Create a new note',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the note'
              },
              content: {
                type: 'string',
                description: 'Text content of the note'
              }
            },
            required: ['title', 'content']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request: Request) => {
    if (!request.params) {
      throw new Error('Invalid request');
    }

    switch (request.params.name) {
      case 'create_note': {
        const createNoteSchema = z.object({
          title: z.string().min(1, 'Title is required'),
          content: z.string().min(1, 'Content is required')
        });

        let title: string;
        let content: string;
        try {
          ({ title, content } = createNoteSchema.parse(
            request.params.arguments
          ));
        } catch (err) {
          if (err instanceof z.ZodError) {
            throw new Error('Title and content are required');
          }
          throw err;
        }

        const id = String(Object.keys(notes).length + 1);
        notes[id] = { title, content };

        return {
          content: [
            {
              type: 'text',
              text: `Created note ${id}: ${title}`
            }
          ]
        };
      }

      default:
        throw new Error('Unknown tool');
    }
  });
};
