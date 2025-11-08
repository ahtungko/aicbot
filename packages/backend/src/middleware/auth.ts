import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // For now, we'll use a simple mock authentication
  // In a real application, you would verify JWT tokens or use another auth method

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = {
      id: 'default-user',
      email: 'user@example.com',
    };
    return next();
  }

  // Mock user for development
  req.user = {
    id: 'default-user',
    email: 'user@example.com',
  };

  next();
}
