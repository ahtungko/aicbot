import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { ConversationSidebar } from './ConversationSidebar';
import { MessageList } from './MessageList';
import { ChatComposer } from './ChatComposer';
import { ModelSelector } from './ModelSelector';
import { Button } from './ui/Button';
import { useConversations, useCreateConversation, useUpdateConversation, useDeleteConversation, useModels, useConversation } from '../hooks/useConversations';
import { useChat } from '../hooks/useChat';
import { Conversation, ConversationSettings, Model } from '@aicbot/shared';
import { showToast } from './ui/Toaster';

const DEFAULT_SETTINGS: ConversationSettings = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
};

export function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<ConversationSettings>(DEFAULT_SETTINGS);

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: selectedConversation } = useConversation(selectedConversationId || '');
  const { data: models, isLoading: modelsLoading } = useModels();
  
  const createConversationMutation = useCreateConversation();
  const updateConversationMutation = useUpdateConversation();
  const deleteConversationMutation = useDeleteConversation();
  
  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    isStreaming,
    sendMessage,
    clearError,
    setMessages,
    updateConversationId,
  } = useChat(selectedConversationId);

  // Update settings when conversation changes
  useEffect(() => {
    if (selectedConversation?.settings) {
      setSettings(selectedConversation.settings);
    }
  }, [selectedConversation]);

  // Update messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages);
      updateConversationId(selectedConversation.id);
    } else {
      setMessages([]);
      updateConversationId(undefined);
    }
  }, [selectedConversation, setMessages, updateConversationId]);

  // Set default model when models load
  useEffect(() => {
    if (models && models.length > 0 && !settings.model) {
      const defaultModel = models.find(m => m.id === 'gpt-3.5-turbo') || models[0];
      setSettings(prev => ({ ...prev, model: defaultModel.id }));
    }
  }, [models, settings.model]);

  // Show error toast when chat error occurs
  useEffect(() => {
    if (chatError) {
      showToast(chatError, 'error');
      clearError();
    }
  }, [chatError, clearError]);

  const handleCreateConversation = () => {
    const title = `New Chat ${new Date().toLocaleDateString()}`;
    createConversationMutation.mutate(
      { title, settings },
      {
        onSuccess: (newConversation) => {
          setSelectedConversationId(newConversation.id);
          setSidebarOpen(false);
          showToast('New conversation created', 'success');
        },
        onError: (error) => {
          showToast('Failed to create conversation', 'error');
        },
      }
    );
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  const handleUpdateConversation = (id: string, updates: Partial<Conversation>) => {
    updateConversationMutation.mutate(
      { id, updates },
      {
        onError: () => {
          showToast('Failed to update conversation', 'error');
        },
      }
    );
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id, {
      onSuccess: () => {
        if (selectedConversationId === id) {
          setSelectedConversationId(undefined);
        }
        showToast('Conversation deleted', 'success');
      },
      onError: () => {
        showToast('Failed to delete conversation', 'error');
      },
    });
  };

  const handleSendMessage = (content: string, messageSettings: ConversationSettings) => {
    // If no conversation is selected, create one first
    if (!selectedConversationId) {
      const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      createConversationMutation.mutate(
        { title, settings: messageSettings },
        {
          onSuccess: (newConversation) => {
            setSelectedConversationId(newConversation.id);
            // Send the message after creating the conversation
            setTimeout(() => {
              sendMessage(content, messageSettings);
            }, 100);
          },
          onError: () => {
            showToast('Failed to create conversation', 'error');
          },
        }
      );
    } else {
      sendMessage(content, messageSettings);
      
      // Update conversation settings if they changed
      if (JSON.stringify(settings) !== JSON.stringify(messageSettings)) {
        handleUpdateConversation(selectedConversationId, { settings: messageSettings });
      }
    }
  };

  const handleModelChange = (modelId: string) => {
    setSettings(prev => ({ ...prev, model: modelId }));
  };

  const handleSettingsChange = (newSettings: ConversationSettings) => {
    setSettings(newSettings);
    
    // Update current conversation settings if there is one
    if (selectedConversationId) {
      handleUpdateConversation(selectedConversationId, { settings: newSettings });
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        onUpdateConversation={handleUpdateConversation}
        onDeleteConversation={handleDeleteConversation}
        loading={conversationsLoading}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Model selector */}
        <ModelSelector
          models={models}
          selectedModel={settings.model}
          settings={settings}
          onModelChange={handleModelChange}
          onSettingsChange={handleSettingsChange}
          loading={modelsLoading}
        />

        {/* Messages */}
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          loading={chatLoading && messages.length === 0}
        />

        {/* Composer */}
        <ChatComposer
          onSendMessage={handleSendMessage}
          isLoading={chatLoading}
          isStreaming={isStreaming}
          settings={settings}
        />
      </div>
    </div>
  );
}