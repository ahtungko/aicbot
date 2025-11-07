import OpenAI from 'openai';
import { 
  ChatRequest, 
  ChatResponse, 
  Message, 
  ManusChatRequest, 
  ManusChatResponse, 
  ChatStreamChunk,
  ApiErrorCode 
} from '@aicbot/shared';
import { ConversationService } from './conversationService';

export class ChatService {
  private static openai: OpenAI | null = null;
  private static readonly MANUS_API_BASE_URL = process.env.MANUS_API_BASE_URL || 'https://api.manus.ai/v1';
  private static readonly MANUS_API_KEY = process.env.MANUS_API_KEY;

  private static initializeClient(): OpenAI {
    if (!this.openai) {
      if (!this.MANUS_API_KEY) {
        throw new Error('MANUS_API_KEY environment variable is required');
      }

      this.openai = new OpenAI({
        apiKey: this.MANUS_API_KEY,
        baseURL: this.MANUS_API_BASE_URL,
      });

      console.log('🤖 Manus API client initialized', {
        baseURL: this.MANUS_API_BASE_URL,
        hasApiKey: !!this.MANUS_API_KEY,
      });
    }

    return this.openai;
  }

  private static sanitizeForLogging(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    if (sanitized.apiKey) {
      sanitized.apiKey = '[REDACTED]';
    }
    if (sanitized.authorization) {
      sanitized.authorization = '[REDACTED]';
    }
    if (sanitized.messages && Array.isArray(sanitized.messages)) {
      sanitized.messages = sanitized.messages.map((msg: any) => ({
        ...msg,
        content: msg.content ? msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '') : '',
      }));
    }
    return sanitized;
  }

  private static logError(error: any, context: string): void {
    const sanitizedError: any = {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      context,
      timestamp: new Date().toISOString(),
    };

    if (error.response) {
      sanitizedError.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: this.sanitizeForLogging(error.response.data),
      };
    }

    console.error('❌ Manus API Error:', sanitizedError);
  }

  static async sendMessage(
    request: ChatRequest,
    onChunk: (chunk: ChatResponse) => void
  ): Promise<void> {
    const client = this.initializeClient();
    const startTime = Date.now();

    console.log('📤 Sending chat request:', {
      conversationId: request.conversationId,
      model: request.settings.model,
      temperature: request.settings.temperature,
      maxTokens: request.settings.maxTokens,
      messageLength: request.message.length,
    });

    try {
      // Get conversation history if conversationId is provided
      let messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

      if (request.conversationId) {
        // Get existing conversation history
        const history = await ConversationService.getConversationHistory(
          request.conversationId,
          'default-user' // TODO: Get from authenticated user
        );
        messages = [
          ...history,
          {
            role: 'user',
            content: request.message,
          },
        ];
      } else {
        // New conversation, just include current message
        messages = [
          {
            role: 'user',
            content: request.message,
          },
        ];
      }

      const manusRequest: ManusChatRequest = {
        model: request.settings.model,
        messages,
        temperature: request.settings.temperature,
        max_tokens: request.settings.maxTokens,
        stream: true,
      };

      console.log('🔗 Manus API request:', this.sanitizeForLogging(manusRequest));

      const stream = await client.chat.completions.create(manusRequest);

      const assistantMessageId = `assistant-${Date.now()}`;
      let accumulatedContent = '';

      console.log('📡 Starting stream processing...');

      // Handle the stream as an async iterable
      const streamAsync = stream as any;
      
      for await (const chunk of streamAsync) {
        const streamChunk = chunk as ChatStreamChunk;
        
        if (streamChunk.choices && streamChunk.choices.length > 0) {
          const delta = streamChunk.choices[0].delta;
          
          if (delta?.content) {
            accumulatedContent += delta.content;
            
            const responseChunk: ChatResponse = {
              id: assistantMessageId,
              content: accumulatedContent,
              conversationId: request.conversationId || '',
              isComplete: false,
            };

            onChunk(responseChunk);
          }
        }
      }

      // Send final completion chunk
      const finalChunk: ChatResponse = {
        id: assistantMessageId,
        content: accumulatedContent,
        conversationId: request.conversationId || '',
        isComplete: true,
      };

      onChunk(finalChunk);

      const duration = Date.now() - startTime;
      console.log('✅ Chat request completed successfully:', {
        duration: `${duration}ms`,
        responseLength: accumulatedContent.length,
        conversationId: request.conversationId,
      });

    } catch (error: any) {
      this.logError(error, 'ChatService.sendMessage');
      
      // Transform Manus API errors to our error format
      let errorCode = ApiErrorCode.MANUS_API_ERROR;
      let errorMessage = 'An unexpected error occurred while processing your request';

      if (error.status === 401) {
        errorCode = ApiErrorCode.UNAUTHORIZED;
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.status === 429) {
        errorCode = ApiErrorCode.RATE_LIMIT_EXCEEDED;
        errorMessage = 'Rate limit exceeded. Please try again later';
      } else if (error.status === 404) {
        errorCode = ApiErrorCode.MODEL_NOT_FOUND;
        errorMessage = 'The specified model was not found';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.code = errorCode;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  // Fallback method for when streaming is not available
  static async sendMessageNonStreaming(request: ChatRequest): Promise<ChatResponse> {
    const client = this.initializeClient();
    const startTime = Date.now();

    console.log('📤 Sending non-streaming chat request:', {
      conversationId: request.conversationId,
      model: request.settings.model,
      temperature: request.settings.temperature,
      maxTokens: request.settings.maxTokens,
      messageLength: request.message.length,
    });

    try {
      // Get conversation history if conversationId is provided
      let messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

      if (request.conversationId) {
        // Get existing conversation history
        const history = await ConversationService.getConversationHistory(
          request.conversationId,
          'default-user' // TODO: Get from authenticated user
        );
        messages = [
          ...history,
          {
            role: 'user',
            content: request.message,
          },
        ];
      } else {
        // New conversation, just include current message
        messages = [
          {
            role: 'user',
            content: request.message,
          },
        ];
      }

      const manusRequest: ManusChatRequest = {
        model: request.settings.model,
        messages,
        temperature: request.settings.temperature,
        max_tokens: request.settings.maxTokens,
        stream: false,
      };

      console.log('🔗 Manus API request (non-streaming):', this.sanitizeForLogging(manusRequest));

      const response = await client.chat.completions.create(manusRequest) as ManusChatResponse;
      const content = response.choices?.[0]?.message?.content || '';

      const duration = Date.now() - startTime;
      console.log('✅ Non-streaming chat request completed successfully:', {
        duration: `${duration}ms`,
        responseLength: content.length,
        conversationId: request.conversationId,
        usage: response.usage,
      });

      return {
        id: `assistant-${Date.now()}`,
        content,
        conversationId: request.conversationId || '',
        isComplete: true,
      };

    } catch (error: any) {
      this.logError(error, 'ChatService.sendMessageNonStreaming');
      
      let errorCode = ApiErrorCode.MANUS_API_ERROR;
      let errorMessage = 'An unexpected error occurred while processing your request';

      if (error.status === 401) {
        errorCode = ApiErrorCode.UNAUTHORIZED;
        errorMessage = 'Invalid API key or unauthorized access';
      } else if (error.status === 429) {
        errorCode = ApiErrorCode.RATE_LIMIT_EXCEEDED;
        errorMessage = 'Rate limit exceeded. Please try again later';
      } else if (error.status === 404) {
        errorCode = ApiErrorCode.MODEL_NOT_FOUND;
        errorMessage = 'The specified model was not found';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.code = errorCode;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  // Health check method to verify Manus API connectivity
  static async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    try {
      if (!this.MANUS_API_KEY) {
        return {
          status: 'unhealthy',
          details: {
            error: 'MANUS_API_KEY environment variable is required',
          },
        };
      }

      const client = this.initializeClient();
      
      // Try to list models as a simple health check
      const models = await client.models.list();
      
      return {
        status: 'healthy',
        details: {
          modelsCount: models.data.length,
          baseURL: this.MANUS_API_BASE_URL,
        },
      };
    } catch (error: any) {
      this.logError(error, 'ChatService.healthCheck');
      
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          status: error.status,
        },
      };
    }
  }
}