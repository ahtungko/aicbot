import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useConversation } from '@/contexts/ConversationContext';

export const Sidebar: React.FC = () => {
  const { conversations, currentConversationId, setCurrentConversationId } =
    useConversation();

  const handleNewChat = () => {
    console.log('New chat clicked');
  };

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-3">
        <Button className="w-full" onClick={handleNewChat}>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No conversations yet
            </div>
          ) : (
            conversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setCurrentConversationId(conversation.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                  currentConversationId === conversation.id ? 'bg-accent' : ''
                }`}
              >
                <div className="truncate font-medium">{conversation.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
