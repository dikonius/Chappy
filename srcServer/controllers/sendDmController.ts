import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import type { MessageType, AuthRequest } from '../data/types.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { generateMessageSK } from '../utils/Messages.js';
import { MESSAGE_TYPES } from '../data/types.js';

export const sendDM = async (
  req: AuthRequest<{ receiverId: string }, {}, { content: string }>,  // receiverId from path, content from body
  res: Response
) => {
  try {
    const { receiverId } = req.params;  // From path
    const { content } = req.body;  // Only content in body
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to send DMs' });
    }

    const senderId = req.user.userId;
    if (!content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Sort user IDs for symmetric PK (u001 < u456 = 'DM#u001#u456')
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