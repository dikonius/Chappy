import type { Request, Response } from 'express';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDB.js';
import { generateMessageSK } from '../utils/Messages.js';
import { MESSAGE_TYPES } from '../data/types.js';
import type { AuthRequest } from '../data/types.js';

const ERROR_MESSAGES = {
  CONTENT_REQUIRED: 'Message content is required',
  LOCKED_CHANNEL: 'Login required for locked channels',
} as const;

export const sendChannelMessage = async (
  req: AuthRequest<{ channelName: string }>,  // Typed for req.user
  res: Response
) => {
  try {
    const { content } = req.body;
    const channelName = req.params.channelName;
    if (!content.trim()) {
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.CONTENT_REQUIRED });
    }

    // Determine sender (user or guest)
    let senderId: string;
    if (req.user?.userId) {
      senderId = req.user.userId;
      console.log('Send message - Logged in user senderId:', senderId);  // Debug
    } else {
      senderId = 'guest';
      console.log('Send message - Guest senderId:', senderId);  // Debug
    }

    const pk = `CHANNEL#${channelName}`;
    const sk = generateMessageSK();

    // Check if channel is locked (fetch META)
    const { Item: meta } = await db.send(new GetCommand({
      TableName: tableName,
      Key: { pk, sk: 'META' },
    }));

    console.log('Send message - META for channel:', meta);  // Debug: check isLocked

    const isLocked = meta?.isLocked === true || meta?.isLocked === 'true';
    console.log('Send message - isLocked:', isLocked, 'senderId:', senderId);  // Debug

    if (isLocked && senderId === 'guest') {
      console.log('Send message - Blocked guest from locked channel:', channelName);
      return res.status(403).json({ success: false, message: ERROR_MESSAGES.LOCKED_CHANNEL });
    }

    const messageItem = {
      pk,
      sk,
      content: content.trim(),
      GSIType: MESSAGE_TYPES.CHANNEL,
      senderId,
      userId: senderId,
    };

    await db.send(new PutCommand({
      TableName: tableName,
      Item: messageItem,
    }));

    res.status(201).json({ success: true, message: 'Message sent successfully', timestamp: sk });
  } catch (error) {
    console.error('Send channel message error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};