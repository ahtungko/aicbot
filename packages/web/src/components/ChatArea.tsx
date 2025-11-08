import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useConversation } from '@/contexts/ConversationContext';
import { useOffline } from '@/contexts/OfflineContext';

export const ChatArea: React.FC = () => {
  const [message, setMessage] = useState('');
  const { conversations, currentConversationId } = useConversation();
  const { isOnline, queueMessage } = useOffline();

  const currentConversation = conversations.find(
    c => c.id === currentConversationId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentConversationId) return;

    if (!isOnline) {
      queueMessage({
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId,
        content: message.trim(),
        timestamp: new Date().toISOString(),
      });
      console.log('Message queued for sending when online:', message);
    } else {
      console.log('Sending message:', message);
    }

    setMessage('');
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        {!currentConversation ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome to AICBot</h2>
              <p>Start a new conversation to begin chatting</p>
            </div>
          </div>
        ) : currentConversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>No messages yet. Start typing below!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentConversation.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              isOnline
                ? 'Type your message...'
                : 'Offline - messages will be queued'
            }
            className="flex-1"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || !currentConversationId}
                  variant={!isOnline ? 'outline' : 'default'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {!isOnline && (
                <TooltipContent>
                  <p>You are offline. Message will be queued.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </form>
      </div>
    </div>
  );
};
