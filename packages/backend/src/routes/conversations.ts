import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { validateRequest, conversationCreateSchema, conversationUpdateSchema } from '../middleware/validation';
import { ConversationService } from '../services/conversationService';

const router = Router();

// Get all conversations for the user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversations = await ConversationService.getConversations(userId);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Get a specific conversation
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.getConversation(id, userId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

// Create a new conversation
router.post('/', authenticate, validateRequest(conversationCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, settings } = req.body;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.createConversation(title, settings, userId);
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

// Update a conversation
router.patch('/:id', authenticate, validateRequest(conversationUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.updateConversation(id, updates, userId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ message: 'Failed to update conversation' });
  }
});

// Delete a conversation
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const deleted = await ConversationService.deleteConversation(id, userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});

export { router as conversationsRouter };