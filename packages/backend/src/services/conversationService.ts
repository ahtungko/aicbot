import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, ConversationSettings } from '@aicbot/shared';

// In-memory storage for development
// In production, this would be replaced with a database
const conversations = new Map<string, Conversation>();
const messages = new Map<string, Message[]>();

// Export for testing purposes
export const storage = {
  conversations,
  messages,
  clear: () => {
    conversations.clear();
    messages.clear();
  },
};

export class ConversationService {
  static async createConversation(
    title: string,
    settings: ConversationSettings,
    userId: string
  ): Promise<Conversation> {
    const id = uuidv4();
    const conversation: Conversation = {
      id,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      settings,
    };
    
    conversations.set(id, conversation);
    messages.set(id, []);
    
    return conversation;
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    const allConversations = Array.from(conversations.values());
    
    // Sort by updated date, most recent first
    return allConversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static async getConversation(id: string, userId: string): Promise<Conversation | null> {
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return null;
    }
    
    // Get messages for this conversation
    const conversationMessages = messages.get(id) || [];
    
    return {
      ...conversation,
      messages: conversationMessages,
    };
  }

  static async updateConversation(
    id: string,
    updates: Partial<Conversation>,
    userId: string
  ): Promise<Conversation | null> {
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return null;
    }
    
    const updatedConversation: Conversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };
    
    conversations.set(id, updatedConversation);
    
    return updatedConversation;
  }

  static async deleteConversation(id: string, userId: string): Promise<boolean> {
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return false;
    }
    
    conversations.delete(id);
    messages.delete(id);
    
    return true;
  }

  static async addMessage(
    conversationId: string,
    message: Message,
    userId: string
  ): Promise<void> {
    const conversationMessages = messages.get(conversationId) || [];
    conversationMessages.push(message);
    messages.set(conversationId, conversationMessages);
    
    // Update conversation's updated timestamp
    const conversation = conversations.get(conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      conversations.set(conversationId, conversation);
    }
  }

  /**
   * Get conversation history formatted for Manus API
   */
  static async getConversationHistory(
    conversationId: string,
    userId: string
  ): Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> {
    const conversationMessages = messages.get(conversationId) || [];
    
    return conversationMessages
      .filter(msg => !msg.isStreaming) // Don't include streaming messages
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  /**
   * Prune old conversations (cleanup utility)
   */
  static async pruneConversations(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    // Default: 30 days
    const now = Date.now();
    const cutoffTime = new Date(now - maxAge);
    let prunedCount = 0;

    for (const [id, conversation] of conversations.entries()) {
      if (conversation.updatedAt < cutoffTime) {
        conversations.delete(id);
        messages.delete(id);
        prunedCount++;
      }
    }

    if (prunedCount > 0) {
      console.log(`🗑️ Pruned ${prunedCount} conversations older than ${maxAge}ms`);
    }

    return prunedCount;
  }

  /**
   * Reset all conversation data (for testing/debugging)
   */
  static async resetAll(): Promise<void> {
    const conversationCount = conversations.size;
    conversations.clear();
    messages.clear();
    console.log(`🗑️ Reset ${conversationCount} conversations`);
  }

  /**
   * Get conversation statistics
   */
  static async getStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }> {
    const allConversations = await this.getConversations(userId);
    const totalConversations = allConversations.length;
    let totalMessages = 0;

    for (const conversation of allConversations) {
      const conversationMessages = messages.get(conversation.id) || [];
      totalMessages += conversationMessages.length;
    }

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
    };
  }

  static async getConversationMessages(
    conversationId: string,
    userId: string
  ): Promise<Message[]> {
    return messages.get(conversationId) || [];
  }
}