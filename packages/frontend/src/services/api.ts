import { Message, Conversation, Model, ConversationSettings, ChatRequest, ChatResponse } from '@aicbot/shared';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.');
    }
    
    throw new ApiError('An unexpected error occurred.');
  }
}

export const api = {
  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return apiRequest<Conversation[]>('/conversations');
  },

  async getConversation(id: string): Promise<Conversation> {
    return apiRequest<Conversation>(`/conversations/${id}`);
  },

  async createConversation(title: string, settings: ConversationSettings): Promise<Conversation> {
    return apiRequest<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, settings }),
    });
  },

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    return apiRequest<Conversation>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteConversation(id: string): Promise<void> {
    return apiRequest<void>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  // Models
  async getModels(): Promise<Model[]> {
    return apiRequest<Model[]>('/models');
  },

  // Chat streaming
  async sendMessage(request: ChatRequest, onChunk: (chunk: ChatResponse) => void): Promise<void> {
    const url = `${API_BASE_URL}/chat`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new ApiError('No response body received');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch (e) {
              console.error('Failed to parse chunk:', data);
            }
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
      
      throw new ApiError('Failed to send message');
    }
  },
};

export { ApiError };