import type { Response } from 'express';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDB.js';
import { formatMessages } from '../utils/Messages.js';
import type { AuthRequest } from '../data/types.js';

export const getChannelMessages = async (
  req: AuthRequest<{ channelName: string }>,
  res: Response
) => {
  try {
    const channelName = req.params.channelName;
    const pk = `CHANNEL#${channelName}`;

    // Check if channel is locked (fetch META)
    const { Item: meta } = await db.send(new GetCommand({
      TableName: tableName,
      Key: { pk, sk: 'META' },
    }));

    const isLocked = meta?.isLocked === true || meta?.isLocked === 'true';
    const isGuest = !req.user;  // True if no user (guest)

    if (isLocked && isGuest) {
      return res.status(403).json({ success: false, message: 'Login required for locked channels' });
    }

    // Fetch messages (only if allowed)
    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': 'pk' },
      ExpressionAttributeValues: { ':pk': pk },
      ProjectionExpression: 'sk, content, senderId, userId',
    }));

    // Unwrap if wrapped (your logs show plain)
    const unwrappedItems = (Items || []).map((item: any) => ({
      sk: item.sk || item.sk?.S,
      content: item.content || item.content?.S,
      senderId: item.senderId || item.senderId?.S,
      userId: item.userId || item.userId?.S,
    }));

    const messages = formatMessages(unwrappedItems);  // Your helper (sorts/filters MSG#)

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get channel messages error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};