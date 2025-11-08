import { Loader2, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { ModelSelector } from './ModelSelector';
import { useConversation } from '@/contexts/ConversationContext';
import { useOffline } from '@/contexts/OfflineContext';
import { useModels } from '@/hooks/useModels';
import { useChat } from '@/hooks/useChat';

export const ChatArea: React.FC = () => {
  const [message, setMessage] = useState('');
  const {
    conversations,
    currentConversationId,
    loadingConversationId,
    addMessage,
    updateConversation,
  } = useConversation();
  const { isOnline, queueMessage } = useOffline();
  const { data: models, isLoading: modelsLoading, error: modelsError } =
    useModels();
  const {
    sendMessage,
    isSending,
    isStreaming,
    error: chatError,
    clearError,
  } = useChat(currentConversationId);

  const currentConversation = useMemo(
    () =>
      conversations.find(conversation => conversation.id === currentConversationId),
    [conversations, currentConversationId]
  );

  const modelsErrorMessage = modelsError?.message ?? null;
  const isConversationLoading =
    currentConversationId !== null &&
    loadingConversationId === currentConversationId;

  useEffect(() => {
    clearError();
    setMessage('');
  }, [currentConversationId, clearError]);

  const handleModelChange = async (modelId: string) => {
    if (!currentConversationId || !currentConversation) {
      return;
    }

    const newSettings = {
      ...currentConversation.settings,
      model: modelId,
    };

    try {
      await updateConversation(currentConversationId, { settings: newSettings });
    } catch (error) {
      console.error('Failed to update model', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed || !currentConversationId || !currentConversation) {
      return;
    }

    if (!isOnline) {
      const queued = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId,
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      queueMessage(queued);
      addMessage(currentConversationId, {
        id: queued.id,
        content: trimmed,
        role: 'user',
        timestamp: new Date(),
        conversationId: currentConversationId,
      });
      setMessage('');
      return;
    }

    const success = await sendMessage(trimmed, currentConversation.settings);
    if (success) {
      setMessage('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (chatError) {
      clearError();
    }
    setMessage(event.target.value);
  };

  const canSend =
    Boolean(message.trim()) &&
    Boolean(currentConversationId) &&
    Boolean(currentConversation?.settings?.model) &&
    !isSending &&
    !isStreaming;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-muted/20 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {currentConversation?.title || 'Select a conversation to start chatting'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentConversation?.updatedAt
                ? currentConversation.updatedAt instanceof Date
                  ? `Updated ${currentConversation.updatedAt.toLocaleString()}`
                  : `Updated ${new Date(
                      currentConversation.updatedAt
                    ).toLocaleString()}`
                : 'Create a new conversation to begin'}
            </p>
          </div>
          <ModelSelector
            models={models}
            selectedModelId={currentConversation?.settings.model}
            onSelect={handleModelChange}
            isLoading={modelsLoading}
            disabled={!currentConversationId || isSending || isStreaming}
            error={modelsErrorMessage}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isConversationLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversation...
            </div>
          </div>
        ) : !currentConversation ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold">Welcome to AICBot</h2>
              <p>Select or create a conversation to start chatting.</p>
            </div>
          </div>
        ) : currentConversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>No messages yet. Start typing below!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentConversation.messages.map(msg => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } ${msg.isStreaming ? 'animate-pulse' : ''}`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    <span className="mt-1 block text-xs opacity-70">
                      {msg.timestamp instanceof Date
                        ? msg.timestamp.toLocaleTimeString()
                        : new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={handleInputChange}
              placeholder={
                isOnline
                  ? 'Type your message...'
                  : 'Offline - messages will be queued'
              }
              className="flex-1"
              disabled={!currentConversationId || isSending}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!canSend}
                    variant={!isOnline ? 'outline' : 'default'}
                  >
                    {isSending || isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                {!isOnline && (
                  <TooltipContent>
                    <p>You are offline. Message will be queued.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          {chatError && (
            <div className="text-sm text-destructive">{chatError}</div>
          )}
        </form>
      </div>
    </div>
  );
};
