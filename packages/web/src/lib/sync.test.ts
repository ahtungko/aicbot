import { describe, it, expect, beforeEach } from 'vitest';
import { syncUtils } from './sync';
import type { Conversation } from '@aicbot/shared';

describe('syncUtils', () => {
  const createConversation = (id: string, updatedAt: Date, messageCount = 0): Conversation => ({
    id,
    title: `Conversation ${id}`,
    createdAt: new Date('2024-01-01'),
    updatedAt,
    messages: Array.from({ length: messageCount }, (_, i) => ({
      id: `${id}-msg${i}`,
      content: `Message ${i}`,
      role: 'user' as const,
      timestamp: new Date(`2024-01-01T${String(i).padStart(2, '0')}:00:00`),
      conversationId: id,
    })),
    settings: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    },
  });

  describe('mergeConversations', () => {
    it('merges backend conversations that are not in local', () => {
      const local: Conversation[] = [
        createConversation('conv1', new Date('2024-01-01')),
      ];
      const backend: Conversation[] = [
        createConversation('conv1', new Date('2024-01-01')),
        createConversation('conv2', new Date('2024-01-02')),
      ];

      const merged = syncUtils.mergeConversations(local, backend);

      expect(merged).toHaveLength(2);
      expect(merged.find((c) => c.id === 'conv2')).toBeDefined();
    });

    it('keeps local conversations that are not in backend', () => {
      const local: Conversation[] = [
        createConversation('conv1', new Date('2024-01-01')),
        createConversation('conv3', new Date('2024-01-03')),
      ];
      const backend: Conversation[] = [
        createConversation('conv1', new Date('2024-01-01')),
      ];

      const merged = syncUtils.mergeConversations(local, backend);

      expect(merged).toHaveLength(2);
      expect(merged.find((c) => c.id === 'conv3')).toBeDefined();
    });

    it('sorts conversations by updatedAt descending', () => {
      const local: Conversation[] = [];
      const backend: Conversation[] = [
        createConversation('conv1', new Date('2024-01-01')),
        createConversation('conv2', new Date('2024-01-03')),
        createConversation('conv3', new Date('2024-01-02')),
      ];

      const merged = syncUtils.mergeConversations(local, backend);

      expect(merged[0].id).toBe('conv2');
      expect(merged[1].id).toBe('conv3');
      expect(merged[2].id).toBe('conv1');
    });
  });

  describe('mergeConversation', () => {
    it('prefers backend when backend is newer', () => {
      const local = createConversation('conv1', new Date('2024-01-01'));
      const backend = createConversation('conv1', new Date('2024-01-02'));

      const merged = syncUtils.mergeConversation(local, backend);

      expect(merged.updatedAt).toEqual(backend.updatedAt);
    });

    it('prefers backend when updatedAt is equal', () => {
      const date = new Date('2024-01-01');
      const local = createConversation('conv1', date);
      const backend = createConversation('conv1', date);

      const merged = syncUtils.mergeConversation(local, backend);

      expect(merged).toEqual(backend);
    });

    it('merges local-only messages when local is newer', () => {
      const local = createConversation('conv1', new Date('2024-01-02'), 3);
      const backend = createConversation('conv1', new Date('2024-01-01'), 2);

      const merged = syncUtils.mergeConversation(local, backend);

      expect(merged.messages).toHaveLength(3);
      expect(merged.messages.some((m) => m.id === 'conv1-msg2')).toBe(true);
    });

    it('preserves backend messages and adds local-only messages', () => {
      const backend = createConversation('conv1', new Date('2024-01-01'), 2);
      const local = createConversation('conv1', new Date('2024-01-02'), 2);
      
      local.messages.push({
        id: 'conv1-msg-local',
        content: 'Local only message',
        role: 'user',
        timestamp: new Date('2024-01-01T03:00:00'),
        conversationId: 'conv1',
      });

      const merged = syncUtils.mergeConversation(local, backend);

      expect(merged.messages).toHaveLength(3);
      expect(merged.messages.find((m) => m.id === 'conv1-msg-local')).toBeDefined();
    });

    it('sorts messages by timestamp', () => {
      const backend = createConversation('conv1', new Date('2024-01-01'), 2);
      const local = createConversation('conv1', new Date('2024-01-02'), 2);
      
      local.messages.push({
        id: 'conv1-msg-middle',
        content: 'Middle message',
        role: 'user',
        timestamp: new Date('2024-01-01T00:30:00'),
        conversationId: 'conv1',
      });

      const merged = syncUtils.mergeConversation(local, backend);

      expect(merged.messages[0].id).toBe('conv1-msg0');
      expect(merged.messages[1].id).toBe('conv1-msg-middle');
      expect(merged.messages[2].id).toBe('conv1-msg1');
    });
  });

  describe('syncWithBackend', () => {
    it('successfully syncs and merges conversations', async () => {
      const local: Conversation[] = [
        createConversation('conv1', new Date('2024-01-01')),
      ];
      
      const fetchBackendConversations = async () => [
        createConversation('conv1', new Date('2024-01-02')),
        createConversation('conv2', new Date('2024-01-03')),
      ];

      const result = await syncUtils.syncWithBackend(
        local,
        fetchBackendConversations
      );

      expect(result.success).toBe(true);
      expect(result.mergedConversations).toHaveLength(2);
    });

    it('handles sync errors gracefully', async () => {
      const local: Conversation[] = [];
      const fetchBackendConversations = async () => {
        throw new Error('Network error');
      };

      const result = await syncUtils.syncWithBackend(
        local,
        fetchBackendConversations
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendUnsentMessages', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('sends all unsent messages successfully', async () => {
      const unsentMessages = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          content: 'Message 1',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg2',
          conversationId: 'conv1',
          content: 'Message 2',
          timestamp: new Date().toISOString(),
        },
      ];

      const sendMessage = async () => Promise.resolve();

      const result = await syncUtils.sendUnsentMessages(
        unsentMessages,
        sendMessage
      );

      expect(result.success).toBe(true);
      expect(result.failedMessages).toEqual([]);
    });

    it('tracks failed messages', async () => {
      const unsentMessages = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          content: 'Message 1',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg2',
          conversationId: 'conv1',
          content: 'Message 2',
          timestamp: new Date().toISOString(),
        },
      ];

      let callCount = 0;
      const sendMessage = async () => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Send failed');
        }
      };

      const result = await syncUtils.sendUnsentMessages(
        unsentMessages,
        sendMessage
      );

      expect(result.success).toBe(false);
      expect(result.failedMessages).toHaveLength(1);
      expect(result.failedMessages![0].id).toBe('msg2');
    });
  });
});
