import express from 'express';
import authRouter from './routes/auth.js'; 
import { sendDM } from './controllers/sendDmController.js';
import { getDMs } from './controllers/getDmController.js';
import { getChannels } from './controllers/getAllChannelsController.js';
import { getChannelMessages } from './controllers/getChannelMsgController.js';
import { sendChannelMessage } from './controllers/sendChannelMsgController.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const port: number = Number(process.env.PORT) || 1339;
const app = express();

// Middleware
app.use(express.json()); 
app.use(express.static('./dist/'));

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