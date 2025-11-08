import { ConversationService, storage } from '../services/conversationService';
import { ConversationSettings, Message } from '@aicbot/shared';

describe('ConversationService', () => {
  const mockUserId = 'test-user';
  const mockSettings: ConversationSettings = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  };

  beforeEach(() => {
    // Clear in-memory storage before each test
    storage.clear();
  });

  describe('createConversation', () => {
    it('creates a new conversation with valid data', async () => {
      const title = 'Test Conversation';

      const conversation = await ConversationService.createConversation(
        title,
        mockSettings,
        mockUserId
      );

      expect(conversation).toEqual({
        id: expect.any(String),
        title,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        messages: [],
        settings: mockSettings,
      });
    });

    it('generates unique IDs for each conversation', async () => {
      const conv1 = await ConversationService.createConversation(
        'Conv 1',
        mockSettings,
        mockUserId
      );
      const conv2 = await ConversationService.createConversation(
        'Conv 2',
        mockSettings,
        mockUserId
      );

      expect(conv1.id).not.toBe(conv2.id);
    });
  });

  describe('getConversations', () => {
    it('returns empty array when no conversations exist', async () => {
      const conversations =
        await ConversationService.getConversations(mockUserId);
      expect(conversations).toEqual([]);
    });

    it('returns all conversations sorted by updated date', async () => {
      const conv1 = await ConversationService.createConversation(
        'Older',
        mockSettings,
        mockUserId
      );

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const conv2 = await ConversationService.createConversation(
        'Newer',
        mockSettings,
        mockUserId
      );

      const conversations =
        await ConversationService.getConversations(mockUserId);

      expect(conversations).toHaveLength(2);
      expect(conversations[0].id).toBe(conv2.id); // Newer first
      expect(conversations[1].id).toBe(conv1.id); // Older second
    });
  });

  describe('getConversation', () => {
    it('returns conversation with messages when it exists', async () => {
      const createdConv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const retrievedConv = await ConversationService.getConversation(
        createdConv.id,
        mockUserId
      );

      expect(retrievedConv).toEqual({
        ...createdConv,
        messages: [],
      });
    });

    it('returns null when conversation does not exist', async () => {
      const conversation = await ConversationService.getConversation(
        'non-existent-id',
        mockUserId
      );

      expect(conversation).toBeNull();
    });
  });

  describe('updateConversation', () => {
    it('updates conversation title', async () => {
      const conv = await ConversationService.createConversation(
        'Original Title',
        mockSettings,
        mockUserId
      );

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));

      const updatedConv = await ConversationService.updateConversation(
        conv.id,
        { title: 'Updated Title' },
        mockUserId
      );

      expect(updatedConv?.title).toBe('Updated Title');
      expect(updatedConv?.updatedAt).not.toEqual(conv.updatedAt);
    });

    it('updates conversation settings', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const newSettings = { ...mockSettings, temperature: 0.9 };
      const updatedConv = await ConversationService.updateConversation(
        conv.id,
        { settings: newSettings },
        mockUserId
      );

      expect(updatedConv?.settings.temperature).toBe(0.9);
    });

    it('returns null when updating non-existent conversation', async () => {
      const result = await ConversationService.updateConversation(
        'non-existent-id',
        { title: 'New Title' },
        mockUserId
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('deletes existing conversation', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const deleted = await ConversationService.deleteConversation(
        conv.id,
        mockUserId
      );

      expect(deleted).toBe(true);

      const retrieved = await ConversationService.getConversation(
        conv.id,
        mockUserId
      );
      expect(retrieved).toBeNull();
    });

    it('returns false when deleting non-existent conversation', async () => {
      const deleted = await ConversationService.deleteConversation(
        'non-existent-id',
        mockUserId
      );

      expect(deleted).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('adds message to conversation', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const message: Message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user',
        timestamp: new Date(),
        conversationId: conv.id,
      };

      await ConversationService.addMessage(conv.id, message, mockUserId);

      const updatedConv = await ConversationService.getConversation(
        conv.id,
        mockUserId
      );

      expect(updatedConv?.messages).toContainEqual(message);
    });

    it('updates conversation timestamp when message is added', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const originalUpdatedAt = conv.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));

      const message: Message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user',
        timestamp: new Date(),
        conversationId: conv.id,
      };

      await ConversationService.addMessage(conv.id, message, mockUserId);

      const updatedConv = await ConversationService.getConversation(
        conv.id,
        mockUserId
      );

      expect(updatedConv?.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe('getConversationMessages', () => {
    it('returns empty array for conversation with no messages', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const messages = await ConversationService.getConversationMessages(
        conv.id,
        mockUserId
      );

      expect(messages).toEqual([]);
    });

    it('returns messages for conversation with messages', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const message: Message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user',
        timestamp: new Date(),
        conversationId: conv.id,
      };

      await ConversationService.addMessage(conv.id, message, mockUserId);

      const messages = await ConversationService.getConversationMessages(
        conv.id,
        mockUserId
      );

      expect(messages).toContainEqual(message);
    });
  });

  describe('getConversationHistory', () => {
    it('returns formatted history for Manus API', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const userMessage: Message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user',
        timestamp: new Date(),
        conversationId: conv.id,
      };

      const assistantMessage: Message = {
        id: 'msg-2',
        content: 'Hello there!',
        role: 'assistant',
        timestamp: new Date(),
        conversationId: conv.id,
      };

      const streamingMessage: Message = {
        id: 'msg-3',
        content: 'Streaming...',
        role: 'assistant',
        timestamp: new Date(),
        conversationId: conv.id,
        isStreaming: true,
      };

      await ConversationService.addMessage(conv.id, userMessage, mockUserId);
      await ConversationService.addMessage(
        conv.id,
        assistantMessage,
        mockUserId
      );
      await ConversationService.addMessage(
        conv.id,
        streamingMessage,
        mockUserId
      );

      const history = await ConversationService.getConversationHistory(
        conv.id,
        mockUserId
      );

      expect(history).toEqual([
        { role: 'user', content: 'Hello world' },
        { role: 'assistant', content: 'Hello there!' },
        // Streaming message should be excluded
      ]);
    });

    it('returns empty history for conversation with no messages', async () => {
      const conv = await ConversationService.createConversation(
        'Test Conv',
        mockSettings,
        mockUserId
      );

      const history = await ConversationService.getConversationHistory(
        conv.id,
        mockUserId
      );

      expect(history).toEqual([]);
    });
  });

  describe('pruneConversations', () => {
    it('prunes conversations older than max age', async () => {
      const oldDate = new Date(Date.now() - 60 * 60 * 24 * 1000); // 1 day ago
      const recentDate = new Date();

      // Create old conversation
      const oldConv = await ConversationService.createConversation(
        'Old Conv',
        mockSettings,
        mockUserId
      );

      // Manually set old timestamp
      const conv = storage.conversations.get(oldConv.id)!;
      conv.updatedAt = oldDate;
      storage.conversations.set(oldConv.id, conv);

      // Create recent conversation
      const recentConv = await ConversationService.createConversation(
        'Recent Conv',
        mockSettings,
        mockUserId
      );

      const prunedCount = await ConversationService.pruneConversations(
        12 * 60 * 60 * 1000
      ); // 12 hours

      expect(prunedCount).toBe(1);

      const oldConvExists = await ConversationService.getConversation(
        oldConv.id,
        mockUserId
      );
      const recentConvExists = await ConversationService.getConversation(
        recentConv.id,
        mockUserId
      );

      expect(oldConvExists).toBeNull();
      expect(recentConvExists).toBeTruthy();
    });

    it('returns 0 when no conversations to prune', async () => {
      await ConversationService.createConversation(
        'Recent Conv',
        mockSettings,
        mockUserId
      );

      const prunedCount = await ConversationService.pruneConversations(
        60 * 60 * 24 * 1000
      ); // 1 day

      expect(prunedCount).toBe(0);
    });
  });

  describe('resetAll', () => {
    it('resets all conversation data', async () => {
      await ConversationService.createConversation(
        'Conv 1',
        mockSettings,
        mockUserId
      );
      await ConversationService.createConversation(
        'Conv 2',
        mockSettings,
        mockUserId
      );

      expect(storage.conversations.size).toBe(2);
      expect(storage.messages.size).toBe(2);

      await ConversationService.resetAll();

      expect(storage.conversations.size).toBe(0);
      expect(storage.messages.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('returns correct statistics', async () => {
      const conv1 = await ConversationService.createConversation(
        'Conv 1',
        mockSettings,
        mockUserId
      );
      const conv2 = await ConversationService.createConversation(
        'Conv 2',
        mockSettings,
        mockUserId
      );

      const message1: Message = {
        id: 'msg-1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date(),
        conversationId: conv1.id,
      };

      const message2: Message = {
        id: 'msg-2',
        content: 'Hi',
        role: 'assistant',
        timestamp: new Date(),
        conversationId: conv1.id,
      };

      const message3: Message = {
        id: 'msg-3',
        content: 'Hey',
        role: 'user',
        timestamp: new Date(),
        conversationId: conv2.id,
      };

      await ConversationService.addMessage(conv1.id, message1, mockUserId);
      await ConversationService.addMessage(conv1.id, message2, mockUserId);
      await ConversationService.addMessage(conv2.id, message3, mockUserId);

      const stats = await ConversationService.getStats(mockUserId);

      expect(stats).toEqual({
        totalConversations: 2,
        totalMessages: 3,
        averageMessagesPerConversation: 1.5,
      });
    });

    it('returns zero stats for empty data', async () => {
      const stats = await ConversationService.getStats(mockUserId);

      expect(stats).toEqual({
        totalConversations: 0,
        totalMessages: 0,
        averageMessagesPerConversation: 0,
      });
    });
  });
});
