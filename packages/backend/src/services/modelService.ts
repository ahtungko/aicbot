import { Model } from '@aicbot/shared';

export class ModelService {
  private static models: Model[] = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient model for most tasks',
      maxTokens: 4096,
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model for complex tasks',
      maxTokens: 8192,
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Faster version of GPT-4 with better performance',
      maxTokens: 128000,
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: 'Balanced model with strong reasoning capabilities',
      maxTokens: 200000,
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Most powerful Claude model for complex reasoning',
      maxTokens: 200000,
    },
  ];

  static async getModels(): Promise<Model[]> {
    return this.models;
  }

  static async getModel(id: string): Promise<Model | null> {
    return this.models.find(model => model.id === id) || null;
  }
}