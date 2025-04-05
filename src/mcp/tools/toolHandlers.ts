import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Request } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register tool-related handlers on the MCP server.
 * @param server The MCP server instance
 * @param notes The notes storage object
 */
export function registerToolHandlers(
  server: Server,
  notes: { [id: string]: { title: string; content: string } }
) {
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
        const args = request.params.arguments as {
          title: string;
          content: string;
        };
        const title = String(args.title);
        const content = String(args.content);
        if (!title || !content) {
          throw new Error('Title and content are required');
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
}
