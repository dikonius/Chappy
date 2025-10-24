import type { Request, Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';


//  List all channels (public endpoint, no auth needed)
export const getChannels = async (req: Request, res: Response) => {
  try {
    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'GSIType-name-index', // Assuming GSI on GSIType and name
      KeyConditionExpression: '#gsi_pk = :gsi_pk',
      ExpressionAttributeNames: { '#gsi_pk': 'GSIType' },
      ExpressionAttributeValues: { ':gsi_pk': 'CHANNEL' },
      ProjectionExpression: 'pk, name, isLocked, creatorId',
    }));

    // Filter META items only
    const channels = (Items || [])
      .filter((item: any) => item.sk === 'META')
      .map((item: any) => ({
        id: item.pk.split('#')[1], // e.g., 'public-random'
        name: item.name,
        isLocked: item.isLocked === 'true',
        creatorId: item.creatorId,
      }));

    res.json({ success: true, channels });
  } catch (error) {
    console.error('Get channels error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};