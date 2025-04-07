import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Request } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Represents the role of a message sender in a prompt.
 * Currently only 'user' is supported.
 */
export type MessageRole = 'user';

/**
 * Represents the type of content in a message.
 * - 'resource': Embedded resource content such as a note.
 * - 'text': Plain text content.
 */
export type ContentType = 'resource' | 'text';

/**
 * Registers prompt-related handlers on the MCP server.
 *
 * Handlers:
 * - ListPromptsRequest: Returns available prompts.
 * - GetPromptRequest: Returns a prompt with embedded notes for summarization.
 *
 * @param server The MCP server instance.
 * @param notes An object mapping note IDs to note objects containing title and content.
 */
export const registerPromptHandlers = (
  server: Server,
  notes: { [id: string]: { title: string; content: string } }
): void => {
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
    if (!request.params) {
      throw new Error('Invalid request');
    }

    const paramsSchema = z.object({
      name: z.literal('summarize_notes')
    });

    try {
      paramsSchema.parse(request.params);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new Error('Unknown prompt');
      }
      throw err;
    }

    const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
      type: 'resource', // Use string literal
      resource: {
        uri: `note:///${id}`,
        mimeType: 'text/plain',
        text: note.content
      }
    }));

    return {
      messages: [
        {
          role: 'user', // Use string literal
          content: {
            type: 'text', // Use string literal
            text: 'Please summarize the following notes:'
          }
        },
        ...embeddedNotes.map((note) => ({
          role: 'user', // Use string literal
          content: note
        })),
        {
          role: 'user', // Use string literal
          content: {
            type: 'text', // Use string literal
            text: 'Provide a concise summary of all the notes above.'
          }
        } // Closing brace for the message object
      ] // Closing bracket for the messages array
    }; // Closing brace for the return object
  }); // Closing parenthesis for setRequestHandler
}; // Closing brace for registerPromptHandlers function
