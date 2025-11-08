import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { validateIdParam } from '../middleware/validation';
import { ModelService } from '../services/modelService';
import { ApiErrorCode, ApiResponse } from '@aicbot/shared';

const router = Router();

// Get all available models
router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const models = await ModelService.getModels();
      res.json(models);
    } catch (error: any) {
      console.error('Get models error:', error);
      const response: ApiResponse = {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch models',
          details: error.message,
        },
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }
);

// Get a specific model
router.get(
  '/:id',
  authenticate,
  validateIdParam,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const model = await ModelService.getModel(id);

      if (!model) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: ApiErrorCode.MODEL_NOT_FOUND,
            message: 'Model not found',
          },
          timestamp: new Date().toISOString(),
        };
        return res.status(404).json(response);
      }

      res.json(model);
    } catch (error: any) {
      console.error('Get model error:', error);
      const response: ApiResponse = {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch model',
          details: error.message,
        },
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }
);

export { router as modelsRouter };
