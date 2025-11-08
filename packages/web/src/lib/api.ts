import type {
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationSettings,
  ConversationUpdateRequest,
  Message,
  Model,
} from '@aicbot/shared';

const envBaseUrl =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').trim();
const normalizedEnvBaseUrl = envBaseUrl.replace(/\/$/, '');

const shouldUseRelativeBase = (() => {
  if (!normalizedEnvBaseUrl) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const origin = window.location.origin.replace(/\/$/, '');
  return normalizedEnvBaseUrl === origin;
})();

const apiBase = shouldUseRelativeBase ? '' : normalizedEnvBaseUrl;
const API_BASE_URL = apiBase ? `${apiBase}/api` : '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(endpoint: string) {
  return `${API_BASE_URL}${endpoint}`;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}) {
  const url = buildUrl(endpoint);

  const config: RequestInit = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      let errorPayload: any = null;

      try {
        errorPayload = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorPayload = null;
      }

      const message =
        errorPayload?.error?.message ||
        errorPayload?.message ||
        `HTTP ${response.status}: ${response.statusText}`;

      const code =
        errorPayload?.error?.code ||
        errorPayload?.code ||
        undefined;

      throw new ApiError(message, response.status, code);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.');
    }

    throw new ApiError('An unexpected error occurred while contacting the API');
  }
}

function parseMessage(raw: any): Message {
  return {
    id: raw.id,
    content: raw.content,
    role: raw.role,
    conversationId: raw.conversationId,
    timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
    isStreaming: raw.isStreaming ?? false,
  };
}

function parseConversation(raw: any): Conversation {
  const messagesArray = Array.isArray(raw.messages)
    ? (raw.messages as any[]).map(parseMessage)
    : [];

  return {
    id: raw.id,
    title: raw.title ?? 'Untitled Conversation',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
    messages: messagesArray,
    settings: {
      model: raw.settings?.model ?? '',
      temperature: raw.settings?.temperature ?? 0.7,
      maxTokens: raw.settings?.maxTokens ?? 2000,
    },
  };
}

export const api = {
  async getConversations(): Promise<Conversation[]> {
    const data = await apiRequest<any[]>('/conversations');
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(parseConversation);
  },

  async getConversation(id: string): Promise<Conversation> {
    const data = await apiRequest<any>(`/conversations/${id}`);
    return parseConversation(data);
  },

  async createConversation(
    title: string,
    settings: ConversationSettings
  ): Promise<Conversation> {
    const data = await apiRequest<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, settings }),
    });
    return parseConversation(data);
  },

  async updateConversation(
    id: string,
    updates: ConversationUpdateRequest
  ): Promise<Conversation> {
    const data = await apiRequest<any>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return parseConversation(data);
  },

  async deleteConversation(id: string): Promise<void> {
    await apiRequest<void>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  async getModels(): Promise<Model[]> {
    const data = await apiRequest<Model[]>('/models');
    return data;
  },

  async sendMessage(
    request: ChatRequest,
    onChunk: (chunk: ChatResponse) => void
  ): Promise<void> {
    const url = buildUrl('/chat');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorPayload: any = null;

        try {
          errorPayload = errorText ? JSON.parse(errorText) : null;
        } catch {
          errorPayload = null;
        }

        const message =
          errorPayload?.error?.message ||
          errorPayload?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        const code =
          errorPayload?.error?.code ||
          errorPayload?.code ||
          undefined;

        throw new ApiError(message, response.status, code);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new ApiError('No response body received from the server');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (!line.startsWith('data: ')) {
            continue;
          }

          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed?.error) {
              throw new ApiError(
                parsed?.error?.message || 'Failed to process chat response',
                undefined,
                parsed?.error?.code
              );
            }

            onChunk(parsed as ChatResponse);
          } catch (error) {
            if (error instanceof ApiError) {
              throw error;
            }

            console.error('Failed to parse chat chunk:', data, error);
          }
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error. Please check your connection.');
      }

      throw new ApiError('Failed to send message to the chat service');
    }
  },
};
