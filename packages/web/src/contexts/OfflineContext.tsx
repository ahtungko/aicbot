import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { persistenceUtils, UnsentMessage } from '@/lib/persistence';

interface OfflineContextType {
  isOnline: boolean;
  unsentMessages: UnsentMessage[];
  queueMessage: (message: UnsentMessage) => void;
  clearQueue: () => void;
  removeFromQueue: (messageId: string) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
  onReconnect?: () => void;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
  onReconnect,
}) => {
  const isOnline = useOnlineStatus();
  const [unsentMessages, setUnsentMessages] = useState<UnsentMessage[]>([]);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setUnsentMessages(persistenceUtils.loadUnsentMessages());
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setWasOffline(false);
      onReconnect?.();
    }
  }, [isOnline, wasOffline, onReconnect]);

  const queueMessage = useCallback((message: UnsentMessage) => {
    persistenceUtils.saveUnsentMessage(message);
    setUnsentMessages((prev) => [...prev, message]);
  }, []);

  const clearQueue = useCallback(() => {
    persistenceUtils.clearUnsentMessages();
    setUnsentMessages([]);
  }, []);

  const removeFromQueue = useCallback((messageId: string) => {
    persistenceUtils.removeUnsentMessage(messageId);
    setUnsentMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const value: OfflineContextType = {
    isOnline,
    unsentMessages,
    queueMessage,
    clearQueue,
    removeFromQueue,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
