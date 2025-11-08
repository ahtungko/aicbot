import type { Conversation } from '@aicbot/shared';
import { persistenceUtils, UnsentMessage } from './persistence';

export interface SyncResult {
  success: boolean;
  mergedConversations?: Conversation[];
  failedMessages?: UnsentMessage[];
  error?: string;
}

export const syncUtils = {
  async syncWithBackend(
    localConversations: Conversation[],
    fetchBackendConversations: () => Promise<Conversation[]>
  ): Promise<SyncResult> {
    try {
      const backendConversations = await fetchBackendConversations();

      const mergedConversations = this.mergeConversations(
        localConversations,
        backendConversations
      );

      persistenceUtils.saveConversations(mergedConversations);

      return {
        success: true,
        mergedConversations,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  mergeConversations(
    local: Conversation[],
    backend: Conversation[]
  ): Conversation[] {
    const backendMap = new Map(backend.map(conv => [conv.id, conv]));
    const localMap = new Map(local.map(conv => [conv.id, conv]));

    const merged: Conversation[] = [];

    backend.forEach(backendConv => {
      const localConv = localMap.get(backendConv.id);

      if (!localConv) {
        merged.push(backendConv);
      } else {
        merged.push(this.mergeConversation(localConv, backendConv));
      }
    });

    local.forEach(localConv => {
      if (!backendMap.has(localConv.id)) {
        merged.push(localConv);
      }
    });

    return merged.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  mergeConversation(local: Conversation, backend: Conversation): Conversation {
    if (backend.updatedAt >= local.updatedAt) {
      return backend;
    }

    const backendMessageIds = new Set(backend.messages.map(m => m.id));

    const localOnlyMessages = local.messages.filter(
      msg => !backendMessageIds.has(msg.id)
    );

    if (localOnlyMessages.length === 0) {
      return backend;
    }

    return {
      ...backend,
      messages: [...backend.messages, ...localOnlyMessages].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      ),
    };
  },

  async sendUnsentMessages(
    unsentMessages: UnsentMessage[],
    sendMessage: (conversationId: string, content: string) => Promise<void>
  ): Promise<SyncResult> {
    const failedMessages: UnsentMessage[] = [];

    for (const message of unsentMessages) {
      try {
        await sendMessage(message.conversationId, message.content);
        persistenceUtils.removeUnsentMessage(message.id);
      } catch (error) {
        console.error('Failed to send message:', message.id, error);
        failedMessages.push(message);
      }
    }

    return {
      success: failedMessages.length === 0,
      failedMessages,
    };
  },
};
