import type { Request, Response } from 'express';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDB.js';
import type { AuthRequest } from '../data/types.js';
import { formatMessages } from '../utils/Messages.js';

export const getDMs = async (
  req: AuthRequest<{ receiverId: string }>,
  res: Response
) => {
  try {
    const { receiverId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Sort for symmetric PK (e.g., u001 < u456 = 'DM#u001#u456')
    const [user1, user2] = [userId, receiverId].sort();
    const pk = `DM#${user1}#${user2}`;

    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': 'pk' },
      ExpressionAttributeValues: { ':pk': pk },
      ProjectionExpression: 'sk, content, senderId, userId',
    }));

  
    const unwrappedItems = (Items || []).map((item: any) => ({
      sk: item.sk || item.sk?.S,
      content: item.content || item.content?.S,
      senderId: item.senderId || item.senderId?.S,
      userId: item.userId || item.userId?.S,
    }));

    const messages = formatMessages(unwrappedItems); 

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get DMs error:', (error as Error).message);
    res.status(500).json({ success: false, messages: [] });
  }
};