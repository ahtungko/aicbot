import fetch from 'node-fetch';
import { ChatRequest, ChatResponse, Message } from '@aicbot/shared';

export class ChatService {
  private static readonly MANUS_API_URL = process.env.MANUS_API_URL || 'https://api.manus.ai/v1';
  private static readonly MANUS_API_KEY = process.env.MANUS_API_KEY;

  static async sendMessage(
    request: ChatRequest,
    onChunk: (chunk: ChatResponse) => void
  ): Promise<void> {
    if (!this.MANUS_API_KEY) {
      throw new Error('MANUS_API_KEY environment variable is required');
    }

    try {
      const response = await fetch(`${this.MANUS_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.MANUS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.settings.model,
          messages: [
            {
              role: 'user',
              content: request.message,
            },
          ],
          temperature: request.settings.temperature,
          max_tokens: request.settings.maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Manus API error: ${response.status} - ${errorText}`);
      }

      const assistantMessageId = `assistant-${Date.now()}`;
      let accumulatedContent = '';

      // Handle streaming response
      if (response.body) {
        const reader = (response.body as any).getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // Send final chunk
                onChunk({
                  id: assistantMessageId,
                  content: accumulatedContent,
                  conversationId: request.conversationId || '',
                  isComplete: true,
                });
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  accumulatedContent += content;
                  
                  onChunk({
                    id: assistantMessageId,
                    content: accumulatedContent,
                    conversationId: request.conversationId || '',
                    isComplete: false,
                  });
                }
              } catch (e) {
                console.error('Failed to parse Manus API chunk:', data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  // Fallback method for when streaming is not available
  static async sendMessageNonStreaming(request: ChatRequest): Promise<ChatResponse> {
    if (!this.MANUS_API_KEY) {
      throw new Error('MANUS_API_KEY environment variable is required');
    }

    const response = await fetch(`${this.MANUS_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.MANUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.settings.model,
        messages: [
          {
            role: 'user',
            content: request.message,
          },
        ],
        temperature: request.settings.temperature,
        max_tokens: request.settings.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Manus API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    return {
      id: `assistant-${Date.now()}`,
      content,
      conversationId: request.conversationId || '',
      isComplete: true,
    };
  }
}