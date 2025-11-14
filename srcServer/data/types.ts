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

interface FormData {
  name: string;
  password: string;
}

interface ValidationErrors {
  name?: string;
  password?: string;
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

// Message Types 
type MessageType = 'DM' | 'CHANNEL';

const MESSAGE_TYPES = {
  DM: 'DM' as const,
  CHANNEL: 'CHANNEL' as const,
} as const;

// Base Message Interface 
interface Message {
  pk: string;
  sk: string;
  content: string;
  GSIType: MessageType;
  senderId: string;
  userId?: string; // Optional, for owner reference
  receiverId?: string; // Optional, only for DMs
}

// DM-specific 
interface DmMessage extends Message {
  GSIType: 'DM';
  receiverId: string;
}

// Channel-specific 
interface ChannelMessage extends Message {
  GSIType: 'CHANNEL';
}

// Formatted Message Response 
interface FormattedMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

// API Response for Messages 
interface MessagesResponse {
  success: boolean;
  messages: FormattedMessage[];
}

// API Response for Channels 
interface Channel {
  id: string;
  name: string;
  isLocked: boolean;
  creatorId: string;
}

interface ChannelsResponse {
  success: boolean;
  channels: Channel[];
}


// Error Messages (centralized for controllers;)
const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required to send DMs' as const,
  CONTENT_REQUIRED: 'Message content is required' as const,
  LOCKED_CHANNEL: 'Login required for locked channels' as const,
} as const;

export type { AuthRequest, User, LoginBody, LoginResponse, JwtPayload, MessageResponse, MessageType, ChannelsResponse, Channel, MessagesResponse, FormattedMessage, ChannelMessage, DmMessage, Message, FormData, ValidationErrors}

export {MESSAGE_TYPES, ERROR_MESSAGES}