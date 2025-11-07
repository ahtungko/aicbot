import React from 'react';
import { format } from 'date-fns';
import { Message } from '@aicbot/shared';
import { Bot, User } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`
        flex gap-3 p-4 
        ${isUser ? 'bg-gray-50' : 'bg-white'}
        ${isStreaming && isAssistant ? 'animate-pulse' : ''}
      `}
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
      `}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
          {isStreaming && isAssistant && (
            <span className="text-xs text-blue-600 font-medium">
              (typing...)
            </span>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">
            {message.content}
            {isStreaming && isAssistant && (
              <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  loading?: boolean;
}

export function MessageList({ messages, isStreaming, loading }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8">
          <MessageSkeleton />
          <MessageSkeleton />
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Start a conversation
          </h2>
          <p className="text-gray-600 max-w-md">
            Send a message to begin chatting with the AI assistant. Ask questions, get help, or just have a conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}