import { ConversationService, storage } from '../services/conversationService';
import { ConversationSettings } from '@aicbot/shared';

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
      const conversations = await ConversationService.getConversations(mockUserId);
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

      const conversations = await ConversationService.getConversations(mockUserId);
      
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

      const message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user' as const,
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

      const message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user' as const,
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

      const message = {
        id: 'msg-1',
        content: 'Hello world',
        role: 'user' as const,
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
});