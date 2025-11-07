import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiErrorCode, ApiResponse } from '@aicbot/shared';

// Zod schemas for validation
export const conversationSettingsSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0, 'Temperature must be at least 0').max(2, 'Temperature must be at most 2'),
  maxTokens: z.number().min(1, 'Max tokens must be at least 1').max(32000, 'Max tokens must be at most 32000'),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message must be at most 10000 characters'),
  conversationId: z.string().optional(),
  settings: conversationSettingsSchema,
});

export const conversationCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  settings: conversationSettingsSchema,
});

export const conversationUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').optional(),
  settings: conversationSettingsSchema.optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
export type ConversationUpdateInput = z.infer<typeof conversationUpdateSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;

// Validation middleware factory
export function validateRequest<T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validatedData = schema.parse(data);
      
      // Replace the original data with validated data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else {
        req.params = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: ApiErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          timestamp: new Date().toISOString(),
        };

        return res.status(400).json(response);
      }
      
      // If it's not a ZodError, pass it to the error handler
      next(error);
    }
  };
}

// Specific validation middleware for common use cases
export const validateChatRequest = validateRequest(chatRequestSchema);
export const validateConversationCreate = validateRequest(conversationCreateSchema);
export const validateConversationUpdate = validateRequest(conversationUpdateSchema);
export const validateIdParam = validateRequest(idParamSchema, 'params');

// Utility function to validate data manually (for services, etc.)
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}