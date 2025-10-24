import express from 'express';
import authRouter from './routes/auth.js'; 
import jwt from 'jsonwebtoken';
import type { JwtPayload } from './data/types.js'; 
import { sendDM } from './controllers/sendDmController.js';
import { getDMs } from './controllers/getDmController.js';
import { getChannels } from './controllers/getAllChannelsController.js';
import { getChannelMessages } from './controllers/getChannelMsgController.js';
import { sendChannelMessage } from './controllers/sendChannelMsgController.js';

const port: number = Number(process.env.PORT) || 1339;
const app = express();

// Middleware
app.use(express.json()); 
app.use(express.static('./dist/'));

// Auth middleware (verifies JWT and sets req.user)
export const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid token' });
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = { userId: payload.userId }; // Extend req with user
    next();
  } catch (error) {
    console.error('Auth middleware error:', (error as Error).message);
    res.status(401).json({ success: false, message: 'Invalid JWT' });
  }
};

// Routes
app.use('/api', authRouter);

// DM routes (protected)
app.post('/api/dm/send', authMiddleware, sendDM);
app.get('/api/dm/:receiverId', authMiddleware, getDMs);

// Channel routes (mixed: send allows guests in public, others public)
app.post('/api/channel/:channelName/send', sendChannelMessage);
app.get('/api/channel/:channelName', getChannelMessages);
app.get('/api/channels', getChannels);

app.listen(Number(port), () => {
  console.log(`Server running on port ${port}`);
});