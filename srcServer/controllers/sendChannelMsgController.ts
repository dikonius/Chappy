import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { AuthRequest } from '../data/types.js';


export const sendChannelMessage = async (
  req: AuthRequest<{ channelName: string }, {}, { content: string }>,
  res: Response
) => {
  try {
    const { content } = req.body;
    const channelName = req.params.channelName;
    if (!content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Determine sender (user or guest)
    let senderId: string;
    if (req.user?.userId) {
      senderId = req.user.userId;
    } else {
      // Guest mode: Allow sends only in public channels
      senderId = 'guest';
    }

    const pk = `CHANNEL#${channelName}`;
    const timestamp = new Date().toISOString();
    const sk = `MSG#${timestamp}`;

    // Check if channel is locked (fetch META item)
    const { Item: meta } = await db.send(new GetCommand({
      TableName: tableName,
      Key: { pk, sk: 'META' },
    }));

    const isLocked = meta?.isLocked === 'true'; // Assuming string 'true'/'false' from schema
    if (isLocked && senderId === 'guest') {
      return res.status(403).json({ success: false, message: 'Login required for locked channels' });
    }

    const messageItem = {
      pk,
      sk,
      content: content.trim(),
      GSIType: 'CHANNEL',
      senderId,
      userId: senderId, // For consistency, though not always used
    };

    await db.send(new PutCommand({
      TableName: tableName,
      Item: messageItem,
    }));

    res.status(201).json({ success: true, message: 'Message sent successfully', timestamp });
  } catch (error) {
    console.error('Send channel message error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};