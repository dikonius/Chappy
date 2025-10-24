import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { AuthRequest } from '../data/types.js';


export const getDMs = async (
  req: AuthRequest<{ receiverId: string }, { success?: boolean; messages?: any[] }>,
  res: Response
) => {
  try {
    const { receiverId } = req.params;
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to view DMs' });
    }

    const userId = req.user.userId;
    // Sort for symmetric PK
    const [user1, user2] = [userId, receiverId].sort();
    const pk = `DM#${user1}#${user2}`;

    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': 'pk' },
      ExpressionAttributeValues: { ':pk': pk },
      ProjectionExpression: 'sk, content, senderId, userId', // Exclude sensitive fields
    }));

    // Filter and sort messages by timestamp (sk)
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
    console.error('Get DMs error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};