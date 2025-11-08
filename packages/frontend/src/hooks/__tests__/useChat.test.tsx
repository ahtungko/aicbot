import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChat } from '../useChat';
import { ConversationSettings } from '@aicbot/shared';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    sendMessage: jest.fn(),
  },
  ApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

import { api } from '../../services/api';

const mockSendMessage = api.sendMessage as jest.MockedFunction<
  typeof api.sendMessage
>;

describe('useChat', () => {
  const mockSettings: ConversationSettings = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isStreaming).toBe(false);
  });

  it('adds user message immediately when sending', async () => {
    const mockOnChunk = jest.fn();
    mockSendMessage.mockImplementation(async (request, onChunk) => {
      // Simulate streaming
      onChunk({
        id: 'assistant-1',
        content: 'Hello!',
        conversationId: request.conversationId || '',
        isComplete: true,
      });
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await result.current.sendMessage('Hello', mockSettings);

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      id: expect.stringMatching(/^user-\d+$/),
      content: 'Hello',
      role: 'user',
      timestamp: expect.any(Date),
      conversationId: '',
    });
  });

  it('handles streaming response correctly', async () => {
    const chunks = [
      { content: 'Hello', isComplete: false },
      { content: 'Hello world', isComplete: false },
      { content: 'Hello world!', isComplete: true },
    ];

    mockSendMessage.mockImplementation(async (request, onChunk) => {
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 10));
        onChunk({
          id: 'assistant-1',
          content: chunk.content,
          conversationId: request.conversationId || '',
          isComplete: chunk.isComplete,
        });
      }
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    result.current.sendMessage('Hello', mockSettings);

    // Check loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isStreaming).toBe(true);

    // Wait for streaming to complete
    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    // Check final messages
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toEqual({
      id: 'assistant-1',
      content: 'Hello world!',
      role: 'assistant',
      timestamp: expect.any(Date),
      conversationId: '',
      isStreaming: false,
    });
  });

  it('handles API errors', async () => {
    const error = new Error('Network error');
    mockSendMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await result.current.sendMessage('Hello', mockSettings);

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
  });

  it('clears error when clearError is called', async () => {
    const error = new Error('Network error');
    mockSendMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await result.current.sendMessage('Hello', mockSettings);
    expect(result.current.error).toBe('Network error');

    result.current.clearError();
    expect(result.current.error).toBe(null);
  });

  it('updates conversation ID', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    result.current.updateConversationId('conv-123');

    // Send a message to verify the conversation ID is used
    mockSendMessage.mockImplementation(async (request, onChunk) => {
      expect(request.conversationId).toBe('conv-123');
      onChunk({
        id: 'assistant-1',
        content: 'Response',
        conversationId: 'conv-123',
        isComplete: true,
      });
    });

    result.current.sendMessage('Hello', mockSettings);

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 'conv-123' }),
      expect.any(Function)
    );
  });

  it('sets messages manually', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    const messages = [
      {
        id: 'msg-1',
        content: 'Test message',
        role: 'user' as const,
        timestamp: new Date(),
        conversationId: 'conv-1',
      },
    ];

    result.current.setMessages(messages);

    expect(result.current.messages).toEqual(messages);
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await result.current.sendMessage('   ', mockSettings);

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('disables sending while loading', async () => {
    mockSendMessage.mockImplementation(async () => {
      // Simulate long-running request
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    const promise1 = result.current.sendMessage('First', mockSettings);
    expect(result.current.isLoading).toBe(true);

    // Second call should not trigger another request
    await result.current.sendMessage('Second', mockSettings);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);

    await promise1;
  });
});
