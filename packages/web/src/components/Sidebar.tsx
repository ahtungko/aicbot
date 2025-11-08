import { useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useConversation } from '@/contexts/ConversationContext';
import { useModels } from '@/hooks/useModels';

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;

export const Sidebar: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    isLoading,
    error,
    loadingConversationId,
  } = useConversation();
  const { data: models, isLoading: modelsLoading } = useModels();
  const [isCreating, setIsCreating] = useState(false);

  const defaultModel = useMemo(() => {
    if (!models || models.length === 0) {
      return undefined;
    }

    return (
      models.find(model => model.id === 'gpt-3.5-turbo') ??
      models.find(model => model.id === 'gpt-4') ??
      models[0]
    );
  }, [models]);

  const handleNewChat = async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    const createdAt = new Date();
    const title = `New Chat ${createdAt.toLocaleString()}`;
    const modelId = defaultModel?.id ?? 'gpt-3.5-turbo';
    const maxTokens = defaultModel?.maxTokens ?? DEFAULT_MAX_TOKENS;

    try {
      await createConversation(title, {
        model: modelId,
        temperature: DEFAULT_TEMPERATURE,
        maxTokens,
      });
    } catch (err) {
      console.error('Failed to create conversation', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-3">
        <Button
          className="w-full"
          onClick={handleNewChat}
          disabled={isCreating || modelsLoading}
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Chat
        </Button>
      </div>

      {error && (
        <div className="px-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map(conversation => {
              const isActive = currentConversationId === conversation.id;
              const isConversationLoading =
                loadingConversationId === conversation.id;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setCurrentConversationId(conversation.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    isActive ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium">
                      {conversation.title || 'Untitled conversation'}
                    </div>
                    {isConversationLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversation.updatedAt instanceof Date
                      ? conversation.updatedAt.toLocaleString()
                      : new Date(conversation.updatedAt).toLocaleString()}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
