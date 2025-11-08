import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConversationSettings } from '@aicbot/shared';

interface ChatComposerProps {
  onSendMessage: (message: string, settings: ConversationSettings) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  settings: ConversationSettings;
  onSettingsChange?: (settings: ConversationSettings) => void;
}

export function ChatComposer({
  onSendMessage,
  isLoading = false,
  isStreaming = false,
  settings,
  onSettingsChange,
}: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isLoading || isStreaming) return;

    onSendMessage(message.trim(), settings);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    // This would need to be implemented in the hook to stop streaming
    console.log('Stop streaming requested');
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              rows={1}
              style={{ minHeight: '52px', maxHeight: '200px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Button
                type="button"
                onClick={handleStop}
                variant="secondary"
                size="md"
                className="px-4"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!message.trim() || isLoading}
                loading={isLoading}
                size="md"
                className="px-4"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
}
