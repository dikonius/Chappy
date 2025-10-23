import type { Request, Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { JwtPayload } from '../data/types.js';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.slice(7).trim();
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }
    const payload = decoded as JwtPayload;

    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'GSIType-name-index',
      KeyConditionExpression: '#gsi_pk = :gsi_pk',
      ExpressionAttributeNames: { '#gsi_pk': 'GSIType' },
      ExpressionAttributeValues: { ':gsi_pk': 'USER' },
      ProjectionExpression: 'userId, name'
    }));

    const users = Items?.map(item => ({ id: item.userId, name: item.name })) || [];

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};