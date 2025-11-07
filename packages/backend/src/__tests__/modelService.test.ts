import { ModelService } from '../services/modelService';

describe('ModelService', () => {
  describe('getModels', () => {
    it('returns all available models', async () => {
      const models = await ModelService.getModels();

      expect(models).toHaveLength(5);
      expect(models[0]).toEqual({
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient model for most tasks',
        maxTokens: 4096,
      });
    });

    it('returns models in consistent order', async () => {
      const models1 = await ModelService.getModels();
      const models2 = await ModelService.getModels();

      expect(models1).toEqual(models2);
    });
  });

  describe('getModel', () => {
    it('returns model when it exists', async () => {
      const model = await ModelService.getModel('gpt-4');

      expect(model).toEqual({
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model for complex tasks',
        maxTokens: 8192,
      });
    });

    it('returns null when model does not exist', async () => {
      const model = await ModelService.getModel('non-existent-model');

      expect(model).toBeNull();
    });
  });
});