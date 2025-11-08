import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
}
