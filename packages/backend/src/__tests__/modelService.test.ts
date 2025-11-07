import { ModelService } from '../services/modelService';
import { ChatService } from '../services/chatService';

// Mock ChatService
jest.mock('../services/chatService');
const MockedChatService = ChatService as jest.Mocked<typeof ChatService>;

describe('ModelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ModelService.clearCache();
  });

  describe('getModels', () => {
    it('returns hardcoded models when Manus API is unhealthy', async () => {
      (MockedChatService.healthCheck as jest.Mock).mockResolvedValue({
        status: 'unhealthy',
        details: { error: 'API unavailable' },
      });

      const models = await ModelService.getModels();

      expect(models).toHaveLength(5);
      expect(models[0]).toEqual({
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient model for most tasks',
        maxTokens: 4096,
      });
    });

    it('returns hardcoded models when Manus API check throws error', async () => {
      (MockedChatService.healthCheck as jest.Mock).mockRejectedValue(new Error('Network error'));

      const models = await ModelService.getModels();

      expect(models).toHaveLength(5);
      expect(models[0]).toEqual({
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient model for most tasks',
        maxTokens: 4096,
      });
    });

    it('caches models for specified TTL', async () => {
      jest.useFakeTimers();
      
      (MockedChatService.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        details: { modelsCount: 5 },
      });

      // First call
      await ModelService.getModels();
      expect(MockedChatService.healthCheck).toHaveBeenCalledTimes(1);

      // Second call within cache period
      await ModelService.getModels();
      expect(MockedChatService.healthCheck).toHaveBeenCalledTimes(1); // Should not call again

      // Wait for cache to expire
      jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      // Third call after cache expiry
      await ModelService.getModels();
      expect(MockedChatService.healthCheck).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });

    it('returns cached models when within TTL', async () => {
      (MockedChatService.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        details: { modelsCount: 5 },
      });

      const models1 = await ModelService.getModels();
      const models2 = await ModelService.getModels();

      expect(models1).toEqual(models2);
      expect(MockedChatService.healthCheck).toHaveBeenCalledTimes(1);
    });
  });

  describe('getModel', () => {
    it('returns model when it exists', async () => {
      (MockedChatService.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        details: { modelsCount: 5 },
      });

      const model = await ModelService.getModel('gpt-4');

      expect(model).toEqual({
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model for complex tasks',
        maxTokens: 8192,
      });
    });

    it('returns null when model does not exist', async () => {
      (MockedChatService.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        details: { modelsCount: 5 },
      });

      const model = await ModelService.getModel('non-existent-model');

      expect(model).toBeNull();
    });
  });

  describe('getDefaultSettings', () => {
    it('returns sensible defaults for known models', () => {
      const gptSettings = ModelService.getDefaultSettings('gpt-3.5-turbo');
      expect(gptSettings).toEqual({
        temperature: 0.7,
        maxTokens: 4096,
      });

      const claudeSettings = ModelService.getDefaultSettings('claude-3-sonnet');
      expect(claudeSettings).toEqual({
        temperature: 0.5,
        maxTokens: 4096,
      });
    });

    it('returns conservative defaults for unknown models', () => {
      const unknownSettings = ModelService.getDefaultSettings('unknown-model');
      expect(unknownSettings).toEqual({
        temperature: 0.7,
        maxTokens: 4096,
      });
    });

    it('respects model token limits', () => {
      const gpt4TurboSettings = ModelService.getDefaultSettings('gpt-4-turbo');
      expect(gpt4TurboSettings.maxTokens).toBe(4096); // Should be min of 128000 and 4096
    });
  });

  describe('clearCache', () => {
    it('clears the model cache', async () => {
      (MockedChatService.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        details: { modelsCount: 5 },
      });

      // First call to populate cache
      await ModelService.getModels();
      expect(MockedChatService.healthCheck).toHaveBeenCalledTimes(1);

      // Clear cache
      ModelService.clearCache();

      // Second call should trigger new health check
      await ModelService.getModels();
      expect(MockedChatService.healthCheck).toHaveBeenCalledTimes(2);
    });
  });
});