import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { validateConversationCreate, validateConversationUpdate, validateIdParam } from '../middleware/validation';
import { ConversationService } from '../services/conversationService';
import { ApiErrorCode, ApiResponse } from '@aicbot/shared';

const router = Router();

// Get all conversations for the user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversations = await ConversationService.getConversations(userId);
    res.json(conversations);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch conversations',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get a specific conversation
router.get('/:id', authenticate, validateIdParam, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.getConversation(id, userId);
    
    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: ApiErrorCode.CONVERSATION_NOT_FOUND,
          message: 'Conversation not found',
        },
        timestamp: new Date().toISOString(),
      };
      return res.status(404).json(response);
    }
    
    res.json(conversation);
  } catch (error: any) {
    console.error('Get conversation error:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch conversation',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Create a new conversation
router.post('/', authenticate, validateConversationCreate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, settings } = req.body;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.createConversation(title, settings, userId);
    res.status(201).json(conversation);
  } catch (error: any) {
    console.error('Create conversation error:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Failed to create conversation',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Update a conversation
router.patch('/:id', authenticate, validateIdParam, validateConversationUpdate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.updateConversation(id, updates, userId);
    
    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: ApiErrorCode.CONVERSATION_NOT_FOUND,
          message: 'Conversation not found',
        },
        timestamp: new Date().toISOString(),
      };
      return res.status(404).json(response);
    }
    
    res.json(conversation);
  } catch (error: any) {
    console.error('Update conversation error:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Failed to update conversation',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Delete a conversation
router.delete('/:id', authenticate, validateIdParam, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const deleted = await ConversationService.deleteConversation(id, userId);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: ApiErrorCode.CONVERSATION_NOT_FOUND,
          message: 'Conversation not found',
        },
        timestamp: new Date().toISOString(),
      };
      return res.status(404).json(response);
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Failed to delete conversation',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

// Get conversation history
router.get('/:id/history', authenticate, validateIdParam, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const conversation = await ConversationService.getConversation(id, userId);
    
    if (!conversation) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: ApiErrorCode.CONVERSATION_NOT_FOUND,
          message: 'Conversation not found',
        },
        timestamp: new Date().toISOString(),
      };
      return res.status(404).json(response);
    }

    const history = await ConversationService.getConversationHistory(id, userId);
    
    res.json({
      conversation,
      history,
    });
  } catch (error: any) {
    console.error('Get conversation history error:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch conversation history',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

export { router as conversationsRouter };