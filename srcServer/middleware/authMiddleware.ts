import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../data/types.js'; 

// Auth middleware (verifies JWT and sets req.user)
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid token' });
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = { userId: payload.userId }; // Type-safe with your AuthRequest extension
    next();
  } catch (error) {
    console.error('Auth middleware error:', (error as Error).message);
    return res.status(401).json({ success: false, message: 'Invalid JWT' });
  }
};