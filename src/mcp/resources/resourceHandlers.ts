import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Request } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register resource-related handlers on the MCP server.
 * @param server The MCP server instance
 * @param notes The notes storage object
 */
export function registerResourceHandlers(
  server: Server,
  notes: { [id: string]: { title: string; content: string } }
) {
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

      const url = new URL(request.params.uri as string);
      const id = url.pathname.replace(/^\//, '');
      const note = notes[id];

      if (!note) {
        throw new Error(`Note ${id} not found`);
      }

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'text/plain',
            text: note.content
          }
        ]
      };
    }
  );
}
