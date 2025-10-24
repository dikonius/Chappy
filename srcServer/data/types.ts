import type { Query } from 'express-serve-static-core';
import type { Request } from 'express';

interface MessageResponse {
  message: string;
}

interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: { id: string; name: string; };
  errors?: { path: string; message: string }[];
  message?: string;
}

interface LoginBody {
  name: string;
  password: string;
}


interface User {
  pk: string;           
  sk: string;
  userId: string;           
  name: string;
  password: string;
  GSIType: string;
}

interface JwtPayload {
  userId: string;
  exp: number;
}

// Properly generic interface for auth-extended requests (mirrors Express Request generics)
interface AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    userId: string;
  };
}

export type { AuthRequest, User, LoginBody, LoginResponse, JwtPayload, MessageResponse };
