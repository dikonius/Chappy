import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import type { AuthRequest } from '../data/types.js';


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

    // Sort user IDs for symmetric PK (ensures bidirectional conversation key)
    const [user1, user2] = [senderId, receiverId].sort();
    const pk = `DM#${user1}#${user2}`;
    const timestamp = new Date().toISOString();
    const sk = `MSG#${timestamp}`;

    const messageItem = {
      pk,
      sk,
      content: content.trim(),
      GSIType: 'DM',
      senderId,
      userId: senderId, // Owner/sender reference, matching table schema
    };

    await db.send(new PutCommand({
      TableName: tableName,
      Item: messageItem,
    }));

    res.status(201).json({ success: true, message: 'DM sent successfully', timestamp });
  } catch (error) {
    console.error('Send DM error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};