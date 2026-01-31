import Anthropic from '@anthropic-ai/sdk';

const API_KEY_STORAGE = 'codexia_api_keys';

// Get API key from localStorage or fallback to env
const getApiKey = (): string => {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) {
      const keys = JSON.parse(stored);
      if (keys.claude) return keys.claude;
    }
  } catch (e) {
    console.error('Failed to load API key from localStorage:', e);
  }
  return import.meta.env.VITE_CLAUDE_API_KEY || '';
};

let client: Anthropic | null = null;

// Initialize client with API key
const initializeClient = () => {
  const apiKey = getApiKey();
  if (apiKey && apiKey !== 'your_claude_api_key_here') {
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    return true;
  }
  return false;
};

// Try to initialize on load
initializeClient();

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
  // Try to reinitialize client in case keys were just added
  if (!client) {
    initializeClient();
  }

  if (!client) {
    console.warn('Claude API Key not configured');
    return {
      response: 'Claude API key not found. Please enter your API key in the settings.',
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
      system: `You are a professional AI coding assistant inside a VS Code-style IDE.

Core principles:
- Be concise and professional
- No emojis, no motivational talk
- Sound like a senior software engineer
- Always ask permission before modifying files

When a user requests code changes:
1. Analyze the request
2. Use update_file tool to propose changes
3. Be clear about what files you're modifying
4. Wait for user approval (the system handles this)

Provide clean, modern, production-ready code. Use TypeScript when appropriate.`,
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
      response: textResponse || 'I\'ve prepared the requested changes.',
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
    initializeClient();
  }

  if (!client) {
    onChunk('Claude API key not configured. Please enter your API key in the settings.');
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
      system: `You are a professional AI coding assistant. Be concise and provide production-ready code.`,
      messages
    });

    const operations: FileOperation[] = [];

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text);
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
