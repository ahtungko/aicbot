import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { validateChatRequest } from '../middleware/validation';
import { ChatService } from '../services/chatService';
import { ConversationService } from '../services/conversationService';
import { v4 as uuidv4 } from 'uuid';
import { Message, ApiErrorCode, ApiResponse } from '@aicbot/shared';

const router = Router();

router.post(
  '/',
  authenticate,
  validateChatRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    const { message, conversationId, settings } = req.body;
    const userId = req.user!.id;

    try {
      // Create or use existing conversation
      let targetConversationId = conversationId;

      if (!targetConversationId) {
        // Create a new conversation if none provided
        const newConversation = await ConversationService.createConversation(
          message.length > 50 ? message.substring(0, 50) + '...' : message,
          settings,
          userId
        );
        targetConversationId = newConversation.id;
      }

      // Add user message to conversation
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        role: 'user',
        timestamp: new Date(),
        conversationId: targetConversationId,
      };

      await ConversationService.addMessage(
        targetConversationId,
        userMessage,
        userId
      );

      // Set up Server-Sent Events for streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // Send the chat request to Manus API with streaming
      await ChatService.sendMessage(
        { message, conversationId: targetConversationId, settings },
        async chunk => {
          // Send chunk to client
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);

          // If this is the final chunk, save the complete message
          if (chunk.isComplete) {
            const assistantMessage: Message = {
              id: chunk.id,
              content: chunk.content,
              role: 'assistant',
              timestamp: new Date(),
              conversationId: targetConversationId,
            };

            await ConversationService.addMessage(
              targetConversationId,
              assistantMessage,
              userId
            );
          }
        }
      );

      // Send completion signal
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Chat endpoint error:', error);

      // Send error as SSE
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: error.code || ApiErrorCode.INTERNAL_ERROR,
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        },
        timestamp: new Date().toISOString(),
      };

      const errorData = {
        error: true,
        ...errorResponse,
      };
      res.write(`data: ${JSON.stringify(errorData)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
);

export { router as chatRouter };
