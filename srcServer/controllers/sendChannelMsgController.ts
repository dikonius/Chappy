import type { Response } from 'express';
import { db, tableName } from '../data/dynamoDB.js';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ERROR_MESSAGES, MESSAGE_TYPES, type AuthRequest } from '../data/types.js';
import { generateMessageSK } from '../utils/Messages.js';

export const sendChannelMessage = async (
  req: AuthRequest<{ channelName: string }, {}, { content: string }>,
  res: Response
) => {
  try {
    const { content } = req.body;
    const channelName = req.params.channelName;

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: ERROR_MESSAGES.CONTENT_REQUIRED });
    }

    const senderId = req.user?.userId ?? 'guest';
    const pk = `CHANNEL#${channelName}`;
    const sk = generateMessageSK();

    // --- Check channel lock state ---
    const { Item: meta } = await db.send(
      new GetCommand({
        TableName: tableName,
        Key: { pk, sk: 'META' },
      })
    );

    const isLocked = meta?.isLocked === 'true';

    // --- Guests cannot send to locked channels ---
    if (isLocked === true && senderId === 'guest') {
      return res
        .status(403)
        .json({ success: false, message: ERROR_MESSAGES.LOCKED_CHANNEL });
    }

    // --- Store message ---
    const messageItem = {
      pk,
      sk,
      content: content.trim(),
      GSIType: MESSAGE_TYPES.CHANNEL,
      senderId,
      userId: senderId,
    };

    await db.send(
      new PutCommand({
        TableName: tableName,
        Item: messageItem,
      })
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      timestamp: sk,
    });
  } catch (error) {
    console.error('Send channel message error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
