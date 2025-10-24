import type { Request, Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';


export const getChannelMessages = async (
  req: Request<{ channelName: string }>,
  res: Response
) => {
  try {
    const channelName = req.params.channelName;
    const pk = `CHANNEL#${channelName}`;

    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': 'pk' },
      ExpressionAttributeValues: { ':pk': pk },
      ProjectionExpression: 'sk, content, senderId, userId', // Exclude sensitive fields
    }));

    // Filter messages (exclude META) and sort by timestamp
    const messages = (Items || [])
      .filter((item: any) => item.sk.startsWith('MSG#'))
      .sort((a: any, b: any) => a.sk.localeCompare(b.sk))
      .map((item: any) => ({
        id: item.sk,
        content: item.content,
        senderId: item.senderId,
        timestamp: item.sk.split('#')[1],
      }));

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get channel messages error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};