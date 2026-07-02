/**
 * Telegram Agent
 * 
 * A specialized agent for managing Telegram bot connections and interactions.
 * This agent can:
 * - Connect/disconnect from Telegram
 * - Send messages to users
 * - Process incoming messages
 * - Manage bot commands and menus
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const TelegramConnectSchema = z.object({
  status: z.string(),
  message: z.string(),
  bot_token_prefix: z.string().optional(),
  owner_chat_id: z.number().optional(),
  connected: z.boolean(),
});

const TelegramMessageSchema = z.object({
  status: z.string(),
  success: z.boolean(),
  chat_id: z.number(),
  message_preview: z.string().optional(),
  error: z.string().optional(),
});

const TelegramStatusSchema = z.object({
  connected: z.boolean(),
  api_healthy: z.boolean(),
  bot_token_set: z.boolean(),
  owner_chat_id: z.number().nullable(),
  last_update_id: z.number().nullable(),
});

/**
 * Telegram Agent for managing bot connections and messaging
 */
export const TelegramAgent = (
  config: Config,
): LocalAgentDefinition<typeof TelegramConnectSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'telegram_agent',
    kind: 'local',
    displayName: 'Telegram Agent',
    description: `A specialized agent for managing Telegram bot connections and messaging. 
    Use this agent to:
    - Connect to a Telegram bot with a bot token
    - Send messages to Telegram users
    - Check connection status
    - Manage bot commands and menu
    - Process incoming messages
    
    This agent wraps the @telegram/mtproto API for advanced features.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['connect', 'disconnect', 'status', 'send', 'list_commands', 'set_commands'],
            description: 'The action to perform',
          },
          bot_token: {
            type: 'string',
            description: 'Telegram bot token from @BotFather (required for connect)',
          },
          chat_id: {
            type: 'number',
            description: 'Target chat ID for sending messages',
          },
          message: {
            type: 'string',
            description: 'Message text to send',
          },
          owner_chat_id: {
            type: 'number',
            description: 'Your personal chat ID for authentication',
          },
          commands: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                command: { type: 'string' },
                description: { type: 'string' },
              },
            },
            description: 'Bot commands to set in the menu',
          },
        },
        required: ['action'],
        allOf: [
          {
            if: { properties: { action: { const: 'connect' } } },
            then: { required: ['bot_token'] },
          },
          {
            if: { properties: { action: { const: 'send' } } },
            then: { required: ['chat_id', 'message'] },
          },
        ],
      },
    },
    
    outputConfig: {
      outputName: 'result',
      description: 'Result of the Telegram operation',
      schema: z.object({
        success: z.boolean(),
        action: z.string(),
        message: z.string().optional(),
        error: z.string().optional(),
        details: z.record(z.unknown()).optional(),
      }),
    },

    processOutput: (output) => JSON.stringify(output, null, 2),

    modelConfig: {
      model,
      generateContentConfig: {
        temperature: 0.2,
        topP: 0.95,
        thinkingConfig: supportsModernFeatures(model)
          ? { includeThoughts: true, thinkingBudget: -1 }
          : DEFAULT_THINKING_MODE,
      },
    },

    toolConfig: {
      tools: [
        'read_file',
        'bash',
      ],
    },

    runConfig: {
      maxTimeMinutes: 3,
      maxTurns: 10,
    },

    promptConfig: {
      query: `Perform the following Telegram action: ${'$'}{action}
${'${bot_token}' ? `Bot Token: ${'$'}{bot_token.substring(0, 10)}...` : ''}
${'${chat_id}' ? `Target Chat ID: ${'$'}{chat_id}` : ''}
${'${message}' ? `Message: ${'$'}{message}` : ''}`,
      systemPrompt: `You are the Telegram Agent, an expert in managing Telegram bot connections and messaging.

## Your Capabilities:
1. **Connect/Disconnect**: Manage bot connections using bot tokens
2. **Send Messages**: Push notifications and responses to users
3. **Status Check**: Verify connection health and API status
4. **Command Management**: Set and manage bot command menus
5. **Chat Management**: List and manage bot conversations

## Security Guidelines:
- Never log or expose full bot tokens
- Validate chat IDs before sending messages
- Rate limit outgoing messages to prevent bans
- Sanitize all user inputs

## Best Practices:
- Always confirm successful message delivery
- Handle connection errors gracefully
- Provide clear status feedback
- Maintain audit log of actions

## Workflow:
1. Parse the action and required parameters
2. Execute the Telegram API call
3. Validate the response
4. Return structured result with success/error status

Remember: You are a bridge between the user and Telegram's API. Be reliable and secure.`,
    },
  };
};

export default TelegramAgent;