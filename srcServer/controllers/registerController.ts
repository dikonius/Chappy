import type { Request, Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { loginSchema } from '../data/validation.js';
import type { User, LoginResponse, JwtPayload } from '../data/types.js';  
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';  

const jwtSecret = process.env.JWT_SECRET!;

export const registerUser = async (req: Request, res: Response<LoginResponse>) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map(e => ({ path: e.path.join('.'), message: e.message }));
        return res.status(400).json({ errors });
    }

    const { name, password } = result.data;

    try {
        const { Items } = await db.send(new QueryCommand({
            TableName: tableName,
            IndexName: 'GSIType-name-index-v2',
            KeyConditionExpression: '#pk = :pk AND #sk = :sk',
            ExpressionAttributeNames: { '#pk': 'GSIType', '#sk': 'name' },
            ExpressionAttributeValues: { ':pk': 'USER', ':sk': name },
        }));

        if (Items && Items.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `u${crypto.randomBytes(3).readUIntBE(0, 3)}`;  // Generate unique ID

        const newUser: User = {
            pk: `USER#${userId}`,
            sk: 'PROFILE',
            name,
            password: hashedPassword,
            userId,
            GSIType: 'USER',
        };

        await db.send(new PutCommand({ TableName: tableName, Item: newUser }));

        // Auto-login: Generate JWT token immediately after registration
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 60 * 60;  // 1 hour, like login
        const payload: JwtPayload = { userId, exp };
        const token = jwt.sign(payload, jwtSecret);

        res.status(201).json({ success: true, token, user: { id: userId, name } });
    } catch (error) {
        console.error('Registration error:', (error as Error).message);
        res.status(500).json({ success: false });
    }
};