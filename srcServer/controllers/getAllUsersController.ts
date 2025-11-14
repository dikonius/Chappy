import type { Request, Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { JwtPayload } from '../data/types.js';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let payload: JwtPayload | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      try {
        const decoded = jwt.verify(token, jwtSecret);
        if (typeof decoded !== 'string') {
          payload = decoded as JwtPayload;
        }
      } catch (err) {
        console.warn('Invalid or expired token, proceeding as guest');
      }
    }

    const { Items } = await db.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'GSIType-name-index-v2',
      KeyConditionExpression: '#gsi_pk = :gsi_pk',
      ExpressionAttributeNames: { 
        '#gsi_pk': 'GSIType',
        '#n': 'name'  
      },
      ExpressionAttributeValues: { ':gsi_pk': 'USER' },
      ProjectionExpression: 'userId, #n'  
    }));

    const users = Items?.map(item => ({ id: item.userId, name: item.name })) || [];

    res.json({ 
      success: true, 
      users, 
      user: payload ? payload.userId : null  
    });
  } catch (error) {
    console.error('Get all users error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
