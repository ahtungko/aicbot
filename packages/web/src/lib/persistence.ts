import type { Conversation, Message } from '@aicbot/shared';

const STORAGE_VERSION = '1.0';
const STORAGE_KEYS = {
  VERSION: 'aicbot_version',
  CONVERSATIONS: 'aicbot_conversations',
  CURRENT_CONVERSATION_ID: 'aicbot_current_conversation_id',
  UNSENT_MESSAGES: 'aicbot_unsent_messages',
  LAST_SYNC: 'aicbot_last_sync',
} as const;

export interface PersistedConversation extends Omit<Conversation, 'createdAt' | 'updatedAt' | 'messages'> {
  createdAt: string;
  updatedAt: string;
  messages: PersistedMessage[];
}

export interface PersistedMessage extends Omit<Message, 'timestamp'> {
  timestamp: string;
  unsent?: boolean;
}

export interface UnsentMessage {
  id: string;
  conversationId: string;
  content: string;
  timestamp: string;
}

function serializeConversation(conversation: Conversation): PersistedConversation {
  return {
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    })),
  };
}

function deserializeConversation(persisted: PersistedConversation): Conversation {
  return {
    ...persisted,
    createdAt: new Date(persisted.createdAt),
    updatedAt: new Date(persisted.updatedAt),
    messages: persisted.messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
  };
}

export const persistenceUtils = {
  checkVersion(): boolean {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!storedVersion || storedVersion !== STORAGE_VERSION) {
      localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
      return false;
    }
    return true;
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      const serialized = conversations.map(serializeConversation);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(serialized));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save conversations to localStorage:', error);
    }
  },

  loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!data) return [];
      
      const parsed: PersistedConversation[] = JSON.parse(data);
      return parsed.map(deserializeConversation);
    } catch (error) {
      console.error('Failed to load conversations from localStorage:', error);
      return [];
    }
  },

  saveCurrentConversationId(id: string | null): void {
    try {
      if (id === null) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
      } else {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
      }
    } catch (error) {
      console.error('Failed to save current conversation ID:', error);
    }
  },

  loadCurrentConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    } catch (error) {
      console.error('Failed to load current conversation ID:', error);
      return null;
    }
  },

  saveUnsentMessage(message: UnsentMessage): void {
    try {
      const unsent = this.loadUnsentMessages();
      unsent.push(message);
      localStorage.setItem(STORAGE_KEYS.UNSENT_MESSAGES, JSON.stringify(unsent));
    } catch (error) {
      console.error('Failed to save unsent message:', error);
    }
  },

  loadUnsentMessages(): UnsentMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNSENT_MESSAGES);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load unsent messages:', error);
      return [];
    }
  },

  removeUnsentMessage(messageId: string): void {
    try {
      const unsent = this.loadUnsentMessages();
      const filtered = unsent.filter((msg) => msg.id !== messageId);
      localStorage.setItem(STORAGE_KEYS.UNSENT_MESSAGES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove unsent message:', error);
    }
  },

  clearUnsentMessages(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.UNSENT_MESSAGES);
    } catch (error) {
      console.error('Failed to clear unsent messages:', error);
    }
  },

  getLastSyncTime(): Date | null {
    try {
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};
