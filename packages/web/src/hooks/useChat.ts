import { useCallback, useRef, useState } from 'react';
import type { ConversationSettings, Message } from '@aicbot/shared';
import { api, ApiError } from '@/lib/api';
import { useConversation } from '@/contexts/ConversationContext';

export function useChat(conversationId: string | null) {
  const { addMessage } = useConversation();
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  const sendMessage = useCallback(
    async (content: string, settings: ConversationSettings) => {
      const targetConversationId = conversationIdRef.current;
      const trimmedContent = content.trim();

      if (!targetConversationId || !trimmedContent) {
        return false;
      }

      setIsSending(true);
      setIsStreaming(true);
      setError(null);

      const timestamp = new Date();
      const userMessage: Message = {
        id: `user-${timestamp.getTime()}`,
        content: trimmedContent,
        role: 'user',
        timestamp,
        conversationId: targetConversationId,
      };

      addMessage(targetConversationId, userMessage);

      let success = true;

      try {
        await api.sendMessage(
          {
            message: trimmedContent,
            conversationId: targetConversationId,
            settings,
          },
          chunk => {
            const assistantMessage: Message = {
              id: chunk.id,
              content: chunk.content,
              role: 'assistant',
              timestamp: new Date(),
              conversationId: targetConversationId,
              isStreaming: !chunk.isComplete,
            };

            addMessage(targetConversationId, assistantMessage);
            setIsStreaming(!chunk.isComplete);
          }
        );
      } catch (err) {
        success = false;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to send message';
        setError(message);
      } finally {
        setIsSending(false);
        setIsStreaming(false);
      }

      return success;
    },
    [addMessage]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isSending,
    isStreaming,
    error,
    clearError,
  };
}
