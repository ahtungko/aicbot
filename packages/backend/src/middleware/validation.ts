import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    
    next();
  };
}

export const chatRequestSchema = Joi.object({
  message: Joi.string().required().min(1).max(10000),
  conversationId: Joi.string().optional(),
  settings: Joi.object({
    model: Joi.string().required(),
    temperature: Joi.number().min(0).max(2).required(),
    maxTokens: Joi.number().min(1).max(32000).required(),
  }).required(),
});

export const conversationCreateSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  settings: Joi.object({
    model: Joi.string().required(),
    temperature: Joi.number().min(0).max(2).required(),
    maxTokens: Joi.number().min(1).max(32000).required(),
  }).required(),
});

export const conversationUpdateSchema = Joi.object({
  title: Joi.string().optional().min(1).max(200),
  settings: Joi.object({
    model: Joi.string().required(),
    temperature: Joi.number().min(0).max(2).required(),
    maxTokens: Joi.number().min(1).max(32000).required(),
  }).optional(),
});