import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type {
  Conversation,
  ConversationSettings,
  ConversationUpdateRequest,
  Message,
} from '@aicbot/shared';
import { persistenceUtils } from '@/lib/persistence';
import { api, ApiError } from '@/lib/api';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  createConversation: (
    title: string,
    settings: ConversationSettings
  ) => Promise<Conversation>;
  updateConversation: (
    id: string,
    updates: ConversationUpdateRequest
  ) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => void;
  refreshConversations: () => Promise<void>;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  loadingConversationId: string | null;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

const sortConversationsByUpdatedAt = (items: Conversation[]) =>
  [...items].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

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
  const [currentConversationId, setCurrentConversationIdState] = useState<
    string | null
  >(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversationId, setLoadingConversationId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistenceUtils.checkVersion();
    const savedConversations = persistenceUtils.loadConversations();
    const savedConversationId = persistenceUtils.loadCurrentConversationId();

    if (savedConversations.length > 0) {
      setConversations(sortConversationsByUpdatedAt(savedConversations));
    }

    if (savedConversationId) {
      setCurrentConversationIdState(savedConversationId);
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

  const loadConversation = useCallback(async (id: string) => {
    setLoadingConversationId(id);
    try {
      const conversation = await api.getConversation(id);
      setConversations(prev => {
        const exists = prev.some(conv => conv.id === id);
        const updated = exists
          ? prev.map(conv => (conv.id === id ? conversation : conv))
          : [...prev, conversation];
        return sortConversationsByUpdatedAt(updated);
      });
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingConversationId(current => (current === id ? null : current));
    }
  }, []);

  const refreshConversations = useCallback(
    async () => {
      setIsLoading(true);
      try {
        const latest = await api.getConversations();
        setConversations(sortConversationsByUpdatedAt(latest));
        setError(null);

        let selectedConversationId: string | null = null;

        setCurrentConversationIdState(prev => {
          if (prev && latest.some(conv => conv.id === prev)) {
            selectedConversationId = prev;
            return prev;
          }
          const fallback = latest.length > 0 ? latest[0].id : null;
          selectedConversationId = fallback;
          return fallback;
        });

        if (selectedConversationId) {
          await loadConversation(selectedConversationId);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [loadConversation]
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isActive = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        const latest = await api.getConversations();
        if (!isActive) return;

        setConversations(sortConversationsByUpdatedAt(latest));
        setError(null);

        let selectedConversationId: string | null = null;

        setCurrentConversationIdState(prev => {
          if (prev && latest.some(conv => conv.id === prev)) {
            selectedConversationId = prev;
            return prev;
          }
          const fallback = latest.length > 0 ? latest[0].id : null;
          selectedConversationId = fallback;
          return fallback;
        });

        if (selectedConversationId) {
          await loadConversation(selectedConversationId);
        }
      } catch (err) {
        if (isActive) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isActive = false;
    };
  }, [isHydrated, loadConversation]);

  const setCurrentConversationId = useCallback(
    (id: string | null) => {
      setCurrentConversationIdState(id);
      if (id) {
        void loadConversation(id);
      }
    },
    [loadConversation]
  );

  const createConversation = useCallback(
    async (title: string, settings: ConversationSettings) => {
      try {
        const conversation = await api.createConversation(title, settings);
        setConversations(prev =>
          sortConversationsByUpdatedAt([conversation, ...prev])
        );
        setCurrentConversationIdState(conversation.id);
        setError(null);
        return conversation;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      }
    },
    []
  );

  const updateConversation = useCallback(
    async (id: string, updates: ConversationUpdateRequest) => {
      try {
        const updatedConversation = await api.updateConversation(id, updates);
        setConversations(prev =>
          sortConversationsByUpdatedAt(
            prev.map(conv => {
              if (conv.id !== id) {
                return conv;
              }

              const shouldPreserveMessages =
                conv.messages.length > 0 &&
                updatedConversation.messages.length === 0;

              return {
                ...updatedConversation,
                messages: shouldPreserveMessages
                  ? conv.messages
                  : updatedConversation.messages,
              };
            })
          )
        );
        setError(null);
        return updatedConversation;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      }
    },
    []
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      let fallbackConversationId: string | null = null;

      setConversations(prev => {
        const filtered = prev.filter(conv => conv.id !== id);
        fallbackConversationId = filtered.length > 0 ? filtered[0].id : null;
        return filtered;
      });

      if (currentConversationId === id) {
        setCurrentConversationId(fallbackConversationId);
      }

      try {
        await api.deleteConversation(id);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
        await refreshConversations();
        throw err;
      }
    },
    [currentConversationId, refreshConversations, setCurrentConversationId]
  );

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== conversationId) {
          return conv;
        }

        const messageTimestamp =
          message.timestamp instanceof Date
            ? message.timestamp
            : new Date(message.timestamp);

        const existingIndex = conv.messages.findIndex(m => m.id === message.id);
        const messages = [...conv.messages];

        if (existingIndex >= 0) {
          messages[existingIndex] = message;
        } else {
          messages.push(message);
        }

        return {
          ...conv,
          messages,
          updatedAt: messageTimestamp,
        };
      });

      return sortConversationsByUpdatedAt(updated);
    });
  }, []);

  const value: ConversationContextType = {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    refreshConversations,
    isHydrated,
    isLoading,
    error,
    loadingConversationId,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
