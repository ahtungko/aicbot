// Shared types for chat functionality

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  settings: ConversationSettings;
}

export interface ConversationSettings {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  maxTokens: number;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  settings: ConversationSettings;
}

export interface ChatResponse {
  id: string;
  content: string;
  conversationId: string;
  isComplete: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}