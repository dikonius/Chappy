import type { Request, Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { MESSAGE_TYPES } from '../data/types.js';

export const getChannels = async (req: Request, res: Response) => {
  try {
    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'GSIType-name-index-v2',  
      KeyConditionExpression: '#gsiType = :channelType',
      ExpressionAttributeNames: {
        '#gsiType': 'GSIType',
        '#sk': 'sk',
        '#n': 'name',
      },
      ExpressionAttributeValues: {
        ':channelType': MESSAGE_TYPES.CHANNEL,
      },
      ProjectionExpression: 'pk, #sk, #n, isLocked, creatorId',
    }));

    // Unwrap (plain strings/boolean)
    const unwrappedItems = (Items || []).map((item: any) => ({
      pk: item.pk,
      sk: item.sk,
      name: item.name,
      isLocked: item.isLocked,
      creatorId: item.creatorId,
    }));

    const channels = unwrappedItems
      .filter((item) => item.sk === 'META' || (item.name && item.creatorId))
      .map((item) => ({
        id: item.pk.split('#')[1],
        name: item.name,
        isLocked: Boolean(item.isLocked),
        creatorId: item.creatorId,
      }));

    res.json({ success: true, channels });
  } catch (error) {
    console.error('Get channels error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};