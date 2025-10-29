import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { AuthRequest, MessagesResponse } from '../data/types.js';
import { formatMessages } from '../utils/Messages.js';


export const getDMs = async (
  req: AuthRequest<{ receiverId: string }, MessagesResponse>,
  res: Response<MessagesResponse>
) => {
  try {
    const { receiverId } = req.params;
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, messages: [] } as MessagesResponse);
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
      ProjectionExpression: 'sk, content, senderId, userId',
    }));

    const messages = formatMessages(Items);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get DMs error:', (error as Error).message);
    res.status(500).json({ success: false, messages: [] } as MessagesResponse);
  }
};