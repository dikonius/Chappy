import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { type MessageType, type AuthRequest, MESSAGE_TYPES } from '../data/types.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { generateMessageSK } from '../utils/Messages.js';


export const sendDM = async (
  req: AuthRequest<{}, { success?: boolean; message?: string }, { receiverId: string; content: string }>,
  res: Response
) => {
  try {
    const { receiverId, content } = req.body;
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to send DMs' });
    }

    const senderId = req.user.userId;
    if (!content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Sort user IDs for symmetric PK
    const [user1, user2] = [senderId, receiverId].sort();
    const pk = `DM#${user1}#${user2}`;
    const sk = generateMessageSK();

    const messageItem = {
      pk,
      sk,
      content: content.trim(),
      GSIType: MESSAGE_TYPES.DM as MessageType,
      senderId,
      userId: senderId,
    };

    await db.send(new PutCommand({
      TableName: tableName,
      Item: messageItem,
    }));

    res.status(201).json({ success: true, message: 'DM sent successfully', timestamp: sk });
  } catch (error) {
    console.error('Send DM error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};