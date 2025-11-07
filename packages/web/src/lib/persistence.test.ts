import { describe, it, expect, beforeEach, vi } from 'vitest';
import { persistenceUtils } from './persistence';
import type { Conversation } from '@aicbot/shared';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('persistenceUtils', () => {
  describe('checkVersion', () => {
    it('should return false on first run and set version', () => {
      expect(persistenceUtils.checkVersion()).toBe(false);
      expect(localStorage.getItem('aicbot_version')).toBe('1.0');
    });

    it('should return true on subsequent runs with same version', () => {
      persistenceUtils.checkVersion();
      expect(persistenceUtils.checkVersion()).toBe(true);
    });
  });

  describe('saveConversations and loadConversations', () => {
    it('should save and load conversations correctly', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv1',
          title: 'Test Conversation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          messages: [
            {
              id: 'msg1',
              content: 'Hello',
              role: 'user',
              timestamp: new Date('2024-01-01T10:00:00'),
              conversationId: 'conv1',
            },
          ],
          settings: {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
      ];

      persistenceUtils.saveConversations(conversations);
      const loaded = persistenceUtils.loadConversations();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('conv1');
      expect(loaded[0].title).toBe('Test Conversation');
      expect(loaded[0].createdAt).toBeInstanceOf(Date);
      expect(loaded[0].updatedAt).toBeInstanceOf(Date);
      expect(loaded[0].messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should return empty array when no data exists', () => {
      const loaded = persistenceUtils.loadConversations();
      expect(loaded).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('aicbot_conversations', 'invalid json');
      const loaded = persistenceUtils.loadConversations();
      expect(loaded).toEqual([]);
    });
  });

  describe('saveCurrentConversationId and loadCurrentConversationId', () => {
    it('should save and load conversation ID', () => {
      persistenceUtils.saveCurrentConversationId('conv1');
      expect(persistenceUtils.loadCurrentConversationId()).toBe('conv1');
    });

    it('should remove ID when null is saved', () => {
      persistenceUtils.saveCurrentConversationId('conv1');
      persistenceUtils.saveCurrentConversationId(null);
      expect(persistenceUtils.loadCurrentConversationId()).toBe(null);
    });

    it('should return null when no ID exists', () => {
      expect(persistenceUtils.loadCurrentConversationId()).toBe(null);
    });
  });

  describe('unsent messages', () => {
    it('should save and load unsent messages', () => {
      const message = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test message',
        timestamp: new Date().toISOString(),
      };

      persistenceUtils.saveUnsentMessage(message);
      const loaded = persistenceUtils.loadUnsentMessages();

      expect(loaded).toHaveLength(1);
      expect(loaded[0]).toEqual(message);
    });

    it('should remove specific unsent message', () => {
      const message1 = {
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Message 1',
        timestamp: new Date().toISOString(),
      };
      const message2 = {
        id: 'msg2',
        conversationId: 'conv1',
        content: 'Message 2',
        timestamp: new Date().toISOString(),
      };

      persistenceUtils.saveUnsentMessage(message1);
      persistenceUtils.saveUnsentMessage(message2);
      persistenceUtils.removeUnsentMessage('msg1');

      const loaded = persistenceUtils.loadUnsentMessages();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('msg2');
    });

    it('should clear all unsent messages', () => {
      persistenceUtils.saveUnsentMessage({
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test',
        timestamp: new Date().toISOString(),
      });

      persistenceUtils.clearUnsentMessages();
      expect(persistenceUtils.loadUnsentMessages()).toEqual([]);
    });
  });

  describe('getLastSyncTime', () => {
    it('should return last sync time after saving conversations', () => {
      const beforeSave = new Date();
      persistenceUtils.saveConversations([]);
      const lastSync = persistenceUtils.getLastSyncTime();

      expect(lastSync).toBeInstanceOf(Date);
      expect(lastSync!.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
    });

    it('should return null when no sync has occurred', () => {
      expect(persistenceUtils.getLastSyncTime()).toBe(null);
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      persistenceUtils.saveConversations([
        {
          id: 'conv1',
          title: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
          settings: {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
      ]);
      persistenceUtils.saveCurrentConversationId('conv1');
      persistenceUtils.saveUnsentMessage({
        id: 'msg1',
        conversationId: 'conv1',
        content: 'Test',
        timestamp: new Date().toISOString(),
      });

      persistenceUtils.clearAll();

      expect(persistenceUtils.loadConversations()).toEqual([]);
      expect(persistenceUtils.loadCurrentConversationId()).toBe(null);
      expect(persistenceUtils.loadUnsentMessages()).toEqual([]);
      expect(persistenceUtils.getLastSyncTime()).toBe(null);
    });
  });
});
