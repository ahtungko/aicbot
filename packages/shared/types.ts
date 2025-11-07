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

// Enhanced types for Manus API integration
export interface ManusChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ManusChatRequest {
  model: string;
  messages: ManusChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ManusChatChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  delta?: {
    role?: string;
    content?: string;
  };
  finish_reason?: string;
}

export interface ManusChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ManusChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ConversationCreateRequest {
  title: string;
  settings: ConversationSettings;
}

export interface ConversationUpdateRequest {
  title?: string;
  settings?: ConversationSettings;
}

export interface ChatStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ManusChatChoice[];
}

// Error codes for consistent error handling
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MANUS_API_ERROR = 'MANUS_API_ERROR',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Response wrapper for API consistency
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}