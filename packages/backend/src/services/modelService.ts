import { Model } from '@aicbot/shared';
import { ChatService } from './chatService';

export class ModelService {
  private static defaultModels: Model[] = [
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

  private static cachedModels: Model[] | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get available models. Returns hardcoded models with optional Manus API passthrough
   */
  static async getModels(): Promise<Model[]> {
    const now = Date.now();

    // Return cached models if still valid
    if (this.cachedModels && now - this.lastFetchTime < this.CACHE_TTL) {
      console.log('📋 Returning cached models');
      return this.cachedModels;
    }

    console.log('🔄 Fetching fresh models list');

    try {
      // Try to fetch models from Manus API
      const healthCheck = await ChatService.healthCheck();

      if (healthCheck.status === 'healthy') {
        console.log('✅ Manus API is healthy, using dynamic models');

        // For now, return default models since Manus API doesn't have a standard models endpoint
        // In a real implementation, you might call: await client.models.list()
        const models = [...this.defaultModels];

        // Cache the result
        this.cachedModels = models;
        this.lastFetchTime = now;

        return models;
      } else {
        console.warn(
          '⚠️ Manus API unhealthy, using fallback models:',
          healthCheck.details
        );
        return this.defaultModels;
      }
    } catch (error) {
      console.error(
        '❌ Failed to fetch models from Manus API, using fallback:',
        error
      );
      return this.defaultModels;
    }
  }

  /**
   * Get a specific model by ID
   */
  static async getModel(id: string): Promise<Model | null> {
    const models = await this.getModels();
    return models.find(model => model.id === id) || null;
  }

  /**
   * Get default settings for a model
   */
  static getDefaultSettings(modelId: string): {
    temperature: number;
    maxTokens: number;
  } {
    const model = this.defaultModels.find(m => m.id === modelId);

    if (!model) {
      // Return sensible defaults for unknown models
      return {
        temperature: 0.7,
        maxTokens: 4096,
      };
    }

    // Adjust defaults based on model capabilities
    const temperature = model.id.includes('claude') ? 0.5 : 0.7;
    const maxTokens = Math.min(model.maxTokens, 4096); // Conservative default

    return {
      temperature,
      maxTokens,
    };
  }

  /**
   * Clear the model cache
   */
  static clearCache(): void {
    this.cachedModels = null;
    this.lastFetchTime = 0;
    console.log('🗑️ Model cache cleared');
  }
}
