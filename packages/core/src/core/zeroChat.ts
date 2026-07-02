/**
 * ZeroChat - Core Chat Interface
 */
export interface ZeroChatConfig {
  model?: string;
  temperature?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  candidates?: unknown[];
}

export class ZeroChat {
  constructor(config: ZeroChatConfig) {}

  async sendMessage(message: string): Promise<ChatResponse> {
    return {
      message: { role: 'model', content: 'Response' },
    };
  }
}

export const zeroChat = {
  create: (config?: ZeroChatConfig) => new ZeroChat(config || {}),
};
