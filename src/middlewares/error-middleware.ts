import ApiError from '@/exceptions/api-error';
import { Request, Response, NextFunction } from 'express';

function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message, errors: error.errors });
  }

  return res.status(500).json({ message: 'Unexpected error occurred' });
}

export default errorMiddleware;
