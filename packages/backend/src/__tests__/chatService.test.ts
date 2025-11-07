import { ChatService } from '../services/chatService';
import { ChatRequest, ApiErrorCode } from '@aicbot/shared';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

// Mock the OpenAI client methods
const mockCreate = jest.fn();
const mockList = jest.fn();

MockedOpenAI.prototype.chat = {
  completions: {
    create: mockCreate,
  },
} as any;

MockedOpenAI.prototype.models = {
  list: mockList,
} as any;

describe('ChatService', () => {
  const mockChatRequest: ChatRequest = {
    message: 'Hello, how are you?',
    conversationId: 'test-conversation-id',
    settings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.MANUS_API_KEY;
    delete process.env.MANUS_API_BASE_URL;
  });

  describe('sendMessage (streaming)', () => {
    it('should throw error when API key is not configured', async () => {
      expect.assertions(1);

      try {
        await ChatService.sendMessage(mockChatRequest, jest.fn());
      } catch (error: any) {
        expect(error.message).toBe('MANUS_API_KEY environment variable is required');
      }
    });

    it('should handle streaming response successfully', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const mockChunks = [
        {
          id: 'chunk-1',
          choices: [{ delta: { content: 'Hello' } }],
        },
        {
          id: 'chunk-2',
          choices: [{ delta: { content: ' there!' } }],
        },
      ];

      const mockAsyncIterable = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        },
      };

      mockCreate.mockResolvedValue(mockAsyncIterable);

      const onChunk = jest.fn();

      await ChatService.sendMessage(mockChatRequest, onChunk);

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, {
        id: expect.stringMatching(/^assistant-\d+$/),
        content: 'Hello',
        conversationId: 'test-conversation-id',
        isComplete: false,
      });
      expect(onChunk).toHaveBeenNthCalledWith(2, {
        id: expect.stringMatching(/^assistant-\d+$/),
        content: 'Hello there!',
        conversationId: 'test-conversation-id',
        isComplete: true,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, how are you?' },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });
    });

    it('should include conversation history when conversationId is provided', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const mockAsyncIterable = {
        async *[Symbol.asyncIterator]() {
          yield {
            id: 'chunk-1',
            choices: [{ delta: { content: 'Response' } }],
          };
        },
      };

      mockCreate.mockResolvedValue(mockAsyncIterable);
      
      // Mock ConversationService.getConversationHistory
      const { ConversationService } = require('../services/conversationService');
      jest.spyOn(ConversationService, 'getConversationHistory').mockResolvedValue([
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' },
      ]);

      const onChunk = jest.fn();

      await ChatService.sendMessage(mockChatRequest, onChunk);

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Previous message' },
          { role: 'assistant', content: 'Previous response' },
          { role: 'user', content: 'Hello, how are you?' },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      expect(ConversationService.getConversationHistory).toHaveBeenCalledWith(
        'test-conversation-id',
        'default-user'
      );
    });

    it('should handle API errors appropriately', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const apiError = new Error('API Error') as any;
      apiError.status = 401;
      apiError.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: { error: 'Invalid API key' },
      };

      mockCreate.mockRejectedValue(apiError);

      const onChunk = jest.fn();

      try {
        await ChatService.sendMessage(mockChatRequest, onChunk);
      } catch (error: any) {
        expect(error.code).toBe(ApiErrorCode.UNAUTHORIZED);
        expect(error.message).toBe('Invalid API key or unauthorized access');
        expect(error.originalError).toBe(apiError);
      }

      expect(onChunk).not.toHaveBeenCalled();
    });

    it('should handle rate limiting errors', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const rateLimitError = new Error('Rate limit exceeded') as any;
      rateLimitError.status = 429;

      mockCreate.mockRejectedValue(rateLimitError);

      const onChunk = jest.fn();

      try {
        await ChatService.sendMessage(mockChatRequest, onChunk);
      } catch (error: any) {
        expect(error.code).toBe(ApiErrorCode.RATE_LIMIT_EXCEEDED);
        expect(error.message).toBe('Rate limit exceeded. Please try again later');
      }
    });

    it('should handle model not found errors', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const modelNotFoundError = new Error('Model not found') as any;
      modelNotFoundError.status = 404;

      mockCreate.mockRejectedValue(modelNotFoundError);

      const onChunk = jest.fn();

      try {
        await ChatService.sendMessage(mockChatRequest, onChunk);
      } catch (error: any) {
        expect(error.code).toBe(ApiErrorCode.MODEL_NOT_FOUND);
        expect(error.message).toBe('The specified model was not found');
      }
    });
  });

  describe('sendMessageNonStreaming', () => {
    it('should handle non-streaming response successfully', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello there!',
              role: 'assistant',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await ChatService.sendMessageNonStreaming(mockChatRequest);

      expect(result).toEqual({
        id: expect.stringMatching(/^assistant-\d+$/),
        content: 'Hello there!',
        conversationId: 'test-conversation-id',
        isComplete: true,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, how are you?' },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      });
    });

    it('should handle empty response gracefully', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const mockResponse = {
        choices: [],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await ChatService.sendMessageNonStreaming(mockChatRequest);

      expect(result.content).toBe('');
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      delete process.env.MANUS_API_KEY;
      delete process.env.MANUS_API_BASE_URL;
    });

    it('should return healthy status when API is accessible', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const mockModelsResponse = {
        data: [
          { id: 'gpt-3.5-turbo' },
          { id: 'gpt-4' },
        ],
      };

      mockList.mockResolvedValue(mockModelsResponse);

      const result = await ChatService.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        details: {
          modelsCount: 2,
          baseURL: 'https://api.manus.ai/v1',
        },
      });
    });

    it('should return unhealthy status when API is not accessible', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const apiError = new Error('API unavailable') as any;
      apiError.status = 503;

      mockList.mockRejectedValue(apiError);

      const result = await ChatService.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: {
          error: 'API unavailable',
          status: 503,
        },
      });
    });

    it('should return unhealthy status when API key is not configured', async () => {
      const result = await ChatService.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: {
          error: 'MANUS_API_KEY environment variable is required',
        },
      });
    });
  });

  describe('client initialization', () => {
    it('should use custom base URL when provided', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      process.env.MANUS_API_BASE_URL = 'https://custom.api.manus.ai/v1';
      
      const mockModelsResponse = { data: [] };
      mockList.mockResolvedValue(mockModelsResponse);

      // Reset the openai instance to force re-initialization
      (ChatService as any).openai = null;

      await ChatService.healthCheck();

      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        baseURL: 'https://custom.api.manus.ai/v1',
      });
    });

    it('should use default base URL when not provided', async () => {
      process.env.MANUS_API_KEY = 'test-api-key';
      
      const mockModelsResponse = { data: [] };
      mockList.mockResolvedValue(mockModelsResponse);

      // Reset the openai instance to force re-initialization
      (ChatService as any).openai = null;

      await ChatService.healthCheck();

      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        baseURL: 'https://api.manus.ai/v1',
      });
    });
  });
});