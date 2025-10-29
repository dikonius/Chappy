import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../data/types.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    (req as any).user = null;  // Guest mode – pass through
    return next();
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = { userId: payload.userId };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid JWT' });
  }
};