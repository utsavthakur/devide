import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';

let client: Anthropic | null = null;

if (apiKey && apiKey !== 'your_claude_api_key_here') {
  client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // Required for browser usage
  });
}

export interface FileOperation {
  type: 'update_file' | 'switch_file';
  path: string;
  content?: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate code using Claude with tool calling support
 */
export const generateCode = async (
  userMessage: string,
  conversationHistory: ClaudeMessage[] = [],
  onToolCall?: (operation: FileOperation) => void
): Promise<{ response: string; operations: FileOperation[] }> => {
  if (!client) {
    console.warn('Claude API Key not configured');
    return {
      response: 'Claude API is not configured. Please add your API key to .env.local',
      operations: []
    };
  }

  try {
    const tools: Anthropic.Tool[] = [
      {
        name: 'update_file',
        description: 'Create or update a file with new code content. Use this when the user asks you to create, modify, or write code to a file.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The file path (e.g., App.tsx, utils.ts, styles.css)'
            },
            content: {
              type: 'string',
              description: 'The complete code content for the file'
            }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'switch_file',
        description: 'Switch the active editor view to a different file. Use this when the user wants to view or work on a different file.',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The file path to switch to'
            }
          },
          required: ['path']
        }
      }
    ];

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools,
      system: `You are Codexia, an advanced AI software architect living inside a voice-first IDE. 

Users build software by talking to you. You have tools to write files and switch files.

When a user asks you to build something:
1. Write the code immediately using the update_file tool
2. Be concise and professional in your responses
3. Confirm actions briefly (e.g., "Created App.tsx with your React component")
4. Sound like a futuristic AI system - confident, precise, and helpful

Always provide clean, modern, production-ready code. Use TypeScript when appropriate.`,
      messages
    });

    const operations: FileOperation[] = [];
    let textResponse = '';

    // Process response content
    for (const block of response.content) {
      if (block.type === 'text') {
        textResponse += block.text;
      } else if (block.type === 'tool_use') {
        const operation: FileOperation = {
          type: block.name as 'update_file' | 'switch_file',
          path: (block.input as any).path,
          content: (block.input as any).content
        };
        operations.push(operation);
        
        if (onToolCall) {
          onToolCall(operation);
        }
      }
    }

    return {
      response: textResponse || 'I\'ve completed the requested operations.',
      operations
    };

  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      response: `Error: ${error instanceof Error ? error.message : 'Failed to generate code'}`,
      operations: []
    };
  }
};

/**
 * Stream code generation with real-time updates
 */
export const streamCode = async (
  userMessage: string,
  conversationHistory: ClaudeMessage[] = [],
  onChunk: (text: string) => void,
  onToolCall?: (operation: FileOperation) => void
): Promise<FileOperation[]> => {
  if (!client) {
    onChunk('Claude API is not configured. Please add your API key to .env.local');
    return [];
  }

  try {
    const tools: Anthropic.Tool[] = [
      {
        name: 'update_file',
        description: 'Create or update a file with new code content.',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
            content: { type: 'string', description: 'Complete file content' }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'switch_file',
        description: 'Switch to a different file.',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path to switch to' }
          },
          required: ['path']
        }
      }
    ];

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools,
      system: `You are Codexia, an advanced AI software architect in a voice-first IDE. Be concise, professional, and provide production-ready code.`,
      messages
    });

    const operations: FileOperation[] = [];

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text);
      } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
        // Tool use will be in the final message
      }
    }

    const finalMessage = await stream.finalMessage();
    
    for (const block of finalMessage.content) {
      if (block.type === 'tool_use') {
        const operation: FileOperation = {
          type: block.name as 'update_file' | 'switch_file',
          path: (block.input as any).path,
          content: (block.input as any).content
        };
        operations.push(operation);
        
        if (onToolCall) {
          onToolCall(operation);
        }
      }
    }

    return operations;

  } catch (error) {
    console.error('Claude Stream Error:', error);
    onChunk(`Error: ${error instanceof Error ? error.message : 'Stream failed'}`);
    return [];
  }
};
