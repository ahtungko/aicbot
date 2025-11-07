import { useState, useCallback, useRef } from 'react';
import { api, ApiError } from '../services/api';
import { Message, ChatRequest, ConversationSettings } from '@aicbot/shared';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
}

export function useChat(conversationId?: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    isStreaming: false,
  });

  const streamingMessageRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | undefined>(conversationId);

  const updateConversationId = useCallback((id: string | undefined) => {
    conversationIdRef.current = id;
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    settings: ConversationSettings
  ) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isStreaming: true,
    }));

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      conversationId: conversationIdRef.current || '',
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    try {
      const request: ChatRequest = {
        message: content,
        conversationId: conversationIdRef.current,
        settings,
      };

      let assistantMessageId: string | null = null;
      let assistantContent = '';

      await api.sendMessage(request, (chunk) => {
        if (!assistantMessageId) {
          assistantMessageId = chunk.id;
        }
        
        assistantContent += chunk.content;
        
        streamingMessageRef.current = assistantContent;
        
        setState(prev => {
          const existingAssistantIndex = prev.messages.findIndex(
            msg => msg.id === assistantMessageId
          );
          
          const assistantMessage: Message = {
            id: assistantMessageId!,
            content: assistantContent,
            role: 'assistant',
            timestamp: new Date(),
            conversationId: chunk.conversationId,
            isStreaming: !chunk.isComplete,
          };

          if (existingAssistantIndex >= 0) {
            const updatedMessages = [...prev.messages];
            updatedMessages[existingAssistantIndex] = assistantMessage;
            return {
              ...prev,
              messages: updatedMessages,
              isStreaming: !chunk.isComplete,
            };
          } else {
            return {
              ...prev,
              messages: [...prev.messages, assistantMessage],
              isStreaming: !chunk.isComplete,
            };
          }
        });
      });

      streamingMessageRef.current = null;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
      }));

    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to send message';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isStreaming: false,
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    setState(prev => ({ ...prev, messages }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isStreaming: state.isStreaming,
    sendMessage,
    clearError,
    setMessages,
    updateConversationId,
  };
}