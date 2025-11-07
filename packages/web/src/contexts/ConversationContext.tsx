import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Conversation, Message } from '@aicbot/shared';
import { persistenceUtils } from '@/lib/persistence';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  loadFromBackend: (conversations: Conversation[]) => void;
  isHydrated: boolean;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      'useConversation must be used within a ConversationProvider'
    );
  }
  return context;
};

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    persistenceUtils.checkVersion();
    const savedConversations = persistenceUtils.loadConversations();
    const savedConversationId = persistenceUtils.loadCurrentConversationId();
    
    if (savedConversations.length > 0) {
      setConversations(savedConversations);
    }
    
    if (savedConversationId) {
      setCurrentConversationId(savedConversationId);
    }
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      persistenceUtils.saveConversations(conversations);
    }
  }, [conversations, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      persistenceUtils.saveCurrentConversationId(currentConversationId);
    }
  }, [currentConversationId, isHydrated]);

  const addConversation = (conversation: Conversation) => {
    setConversations((prev) => [...prev, conversation]);
    setCurrentConversationId(conversation.id);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, ...updates } : conv))
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );
  };

  const loadFromBackend = (backendConversations: Conversation[]) => {
    setConversations(backendConversations);
  };

  const value: ConversationContextType = {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    addConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    loadFromBackend,
    isHydrated,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
