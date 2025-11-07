import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { ModelService } from '../services/modelService';

const router = Router();

// Get all available models
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const models = await ModelService.getModels();
    res.json(models);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

// Get a specific model
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const model = await ModelService.getModel(id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    res.json(model);
  } catch (error) {
    console.error('Get model error:', error);
    res.status(500).json({ message: 'Failed to fetch model' });
  }
});

export { router as modelsRouter };