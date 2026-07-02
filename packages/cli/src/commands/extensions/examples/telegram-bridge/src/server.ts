/**
 * Telegram Bridge MCP Server
 * 
 * This server provides tools for connecting ZERO CLI to Telegram,
 * enabling users to interact with ZERO from anywhere via Telegram messaging.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Types for Telegram Bot API responses
interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: {
      id: number;
      type: string;
      username?: string;
      first_name?: string;
    };
    text?: string;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
  };
  edited_message?: {
    chat: { id: number };
    text: string;
  };
}

interface TelegramConfig {
  botToken?: string;
  ownerChatId?: number;
  connected: boolean;
  lastUpdate?: number;
}

// Server state
const config: TelegramConfig = {
  connected: false,
};

// Health check for Telegram API
async function checkTelegramHealth(): Promise<boolean> {
  if (!config.botToken) {
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// Get updates from Telegram
async function getTelegramUpdates(offset: number = 0): Promise<TelegramUpdate[]> {
  if (!config.botToken) {
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${offset}&timeout=1`
    );
    const data = await response.json();
    return data.ok ? data.result : [];
  } catch {
    return [];
  }
}

// Send message to Telegram
async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  if (!config.botToken) {
    return false;
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// Create MCP Server
const server = new Server(
  {
    name: 'telegram-bridge',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'telegram_connect',
        description: 'Connect to a Telegram bot using a bot token and optional owner chat ID',
        inputSchema: {
          type: 'object',
          properties: {
            bot_token: {
              type: 'string',
              description: 'Your Telegram bot token from @BotFather',
            },
            owner_chat_id: {
              type: 'number',
              description: 'Your Telegram chat ID (get it from @userinfobot)',
            },
          },
          required: ['bot_token'],
        },
      },
      {
        name: 'telegram_disconnect',
        description: 'Disconnect from the Telegram bot',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'telegram_send_message',
        description: 'Send a message to a specific Telegram chat',
        inputSchema: {
          type: 'object',
          properties: {
            chat_id: {
              type: 'number',
              description: 'The target chat ID',
            },
            message: {
              type: 'string',
              description: 'The message text to send',
            },
          },
          required: ['chat_id', 'message'],
        },
      },
      {
        name: 'telegram_get_updates',
        description: 'Get recent messages from the Telegram bot',
        inputSchema: {
          type: 'object',
          properties: {
            offset: {
              type: 'number',
              description: 'Update ID offset (default: 0)',
              default: 0,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of updates to retrieve (default: 10)',
              default: 10,
            },
          },
        },
      },
      {
        name: 'telegram_status',
        description: 'Check the connection status with Telegram',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'telegram_list_chats',
        description: 'List recent chats that have interacted with the bot',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of chats to retrieve (default: 20)',
              default: 20,
            },
          },
        },
      },
      {
        name: 'telegram_delete_webhook',
        description: 'Delete the webhook and use getUpdates instead',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'telegram_set_commands',
        description: 'Set the bot command menu',
        inputSchema: {
          type: 'object',
          properties: {
            commands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  command: { type: 'string' },
                  description: { type: 'string' },
                },
              },
              description: 'Array of commands to set',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'telegram_connect': {
        const { bot_token, owner_chat_id } = args as { 
          bot_token: string; 
          owner_chat_id?: number; 
        };
        
        config.botToken = bot_token;
        config.ownerChatId = owner_chat_id;
        
        const isHealthy = await checkTelegramHealth();
        
        if (isHealthy) {
          config.connected = true;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: '✅ Successfully connected to Telegram bot!',
                  bot_token_prefix: bot_token.substring(0, 10) + '...',
                  owner_chat_id: owner_chat_id || 'Not set',
                }, null, 2),
              },
            ],
          };
        } else {
          config.connected = false;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: '❌ Failed to connect to Telegram. Please check your bot token.',
                }, null, 2),
              },
            ],
          };
        }
      }

      case 'telegram_disconnect': {
        config.connected = false;
        config.botToken = undefined;
        config.ownerChatId = undefined;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: '🔌 Disconnected from Telegram bot.',
              }, null, 2),
            },
          ],
        };
      }

      case 'telegram_send_message': {
        const { chat_id, message } = args as { chat_id: number; message: string };
        
        if (!config.connected) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: '❌ Not connected to Telegram. Use telegram_connect first.',
                }, null, 2),
              },
            ],
          };
        }
        
        const sent = await sendTelegramMessage(chat_id, message);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: sent,
                message: sent 
                  ? '✅ Message sent successfully!' 
                  : '❌ Failed to send message.',
                chat_id,
                message_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
              }, null, 2),
            },
          ],
        };
      }

      case 'telegram_get_updates': {
        const { offset = 0, limit = 10 } = args as { offset?: number; limit?: number };
        
        if (!config.connected) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: '❌ Not connected to Telegram.',
                }, null, 2),
              },
            ],
          };
        }
        
        const updates = await getTelegramUpdates(offset);
        const limitedUpdates = updates.slice(0, limit);
        
        // Update last update ID
        if (limitedUpdates.length > 0) {
          config.lastUpdate = limitedUpdates[limitedUpdates.length - 1].update_id;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                updates_count: limitedUpdates.length,
                updates: limitedUpdates.map(u => ({
                  update_id: u.update_id,
                  chat_id: u.message?.chat?.id || u.edited_message?.chat?.id,
                  username: u.message?.chat?.username || u.edited_message?.chat?.id,
                  message: u.message?.text || u.edited_message?.text || '[non-text message]',
                  from: u.message?.from?.first_name || 'Unknown',
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'telegram_status': {
        const isHealthy = config.connected ? await checkTelegramHealth() : false;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                connected: config.connected,
                api_healthy: isHealthy,
                bot_token_set: !!config.botToken,
                bot_token_prefix: config.botToken ? config.botToken.substring(0, 10) + '...' : null,
                owner_chat_id: config.ownerChatId,
                last_update_id: config.lastUpdate,
              }, null, 2),
            },
          ],
        };
      }

      case 'telegram_list_chats': {
        const { limit = 20 } = args as { limit?: number };
        
        if (!config.connected || !config.botToken) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: '❌ Not connected to Telegram.',
                }, null, 2),
              },
            ],
          };
        }
        
        // Get updates to find unique chats
        const updates = await getTelegramUpdates(0);
        const uniqueChats = new Map<number, { 
          chat_id: number; 
          username?: string;
          type: string;
          last_message?: string;
          message_count: number;
        }>();
        
        for (const update of updates) {
          const chat = update.message?.chat;
          if (chat) {
            const existing = uniqueChats.get(chat.id);
            if (existing) {
              existing.message_count++;
              existing.last_message = update.message?.text;
            } else {
              uniqueChats.set(chat.id, {
                chat_id: chat.id,
                username: chat.username,
                type: chat.type,
                last_message: update.message?.text,
                message_count: 1,
              });
            }
          }
        }
        
        const chats = Array.from(uniqueChats.values())
          .sort((a, b) => b.message_count - a.message_count)
          .slice(0, limit);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total_chats: uniqueChats.size,
                chats,
              }, null, 2),
            },
          ],
        };
      }

      case 'telegram_delete_webhook': {
        if (!config.connected || !config.botToken) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: '❌ Not connected to Telegram.',
                }, null, 2),
              },
            ],
          };
        }
        
        try {
          const response = await fetch(
            `https://api.telegram.org/bot${config.botToken}/deleteWebhook?drop_pending_updates=true`
          );
          const data = await response.json();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: data.ok,
                  message: data.ok 
                    ? '✅ Webhook deleted, using getUpdates now.' 
                    : '❌ Failed to delete webhook.',
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `❌ Error: ${error}`,
                }, null, 2),
              },
            ],
          };
        }
      }

      case 'telegram_set_commands': {
        const { commands } = args as { commands: Array<{command: string; description: string}> };
        
        if (!config.connected || !config.botToken) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: '❌ Not connected to Telegram.',
                }, null, 2),
              },
            ],
          };
        }
        
        try {
          const response = await fetch(
            `https://api.telegram.org/bot${config.botToken}/setMyCommands`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ commands }),
            }
          );
          const data = await response.json();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: data.ok,
                  message: data.ok 
                    ? '✅ Bot commands updated!' 
                    : '❌ Failed to update commands.',
                  commands,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `❌ Error: ${error}`,
                }, null, 2),
              },
            ],
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: `❌ Unknown tool: ${name}`,
              }, null, 2),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: `❌ Tool execution failed: ${error}`,
          }, null, 2),
        },
      ],
    };
  }
});

// List resources (optional)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'telegram://status',
        name: 'Connection Status',
        description: 'Current Telegram connection status',
        mimeType: 'application/json',
      },
    ],
  };
});

// List prompts (optional)
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'telegram-welcome',
        description: 'Generate a welcome message for Telegram users',
        arguments: [
          {
            name: 'username',
            description: 'Telegram username',
            required: true,
          },
        ],
      },
    ],
  };
});

// Main entry point
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Telegram Bridge MCP Server running on stdio');
}

main().catch(console.error);