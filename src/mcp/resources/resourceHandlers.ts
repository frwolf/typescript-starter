import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Request } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Registers resource-related handlers on the MCP server.
 *
 * Handlers:
 * - ListResourcesRequest: Lists all available note resources.
 * - ReadResourceRequest: Retrieves the content of a specific note resource by URI.
 *
 * @param server The MCP server instance.
 * @param notes An object mapping note IDs to note objects containing title and content.
 */
export const registerResourceHandlers = (
  server: Server,
  notes: { [id: string]: { title: string; content: string } }
): void => {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: Object.entries(notes).map(([id, note]) => ({
        uri: `note:///${id}`,
        mimeType: 'text/plain',
        name: note.title,
        description: `A text note: ${note.title}`
      }))
    };
  });

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: Request) => {
      if (!request.params) {
        throw new Error('Invalid request');
      }

      const paramsSchema = z.object({
        uri: z.string().min(1, 'URI is required')
      });

      const { uri } = paramsSchema.parse(request.params);

      const url = new URL(uri);
      const id = url.pathname.replace(/^\//, '');
      const note = notes[id];

      if (!note) {
        throw new Error(`Note ${id} not found`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: note.content
          }
        ]
      };
    }
  );
};
