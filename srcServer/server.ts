import express from 'express';
import authRouter from './routes/auth.js'; 
import { sendDM } from './controllers/sendDmController.js';
import { getDMs } from './controllers/getDmController.js';
import { getChannelMessages } from './controllers/getChannelMsgController.js';
import { sendChannelMessage } from './controllers/sendChannelMsgController.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { getChannels } from './controllers/getAllChannelsController.js';


const port: number = Number(process.env.PORT) || 1339;
const app = express();

//logger
app.use((req, res, next) => { 
  console.log(`${req.method} ${req.path}`); 
  next(); 
});

// Middleware
app.use(express.json()); 
app.use(express.static('./dist/'));

// Routes
app.use('/api', authRouter);

// DM routes (protected)
app.post('/api/dm/send', authMiddleware, sendDM);
app.get('/api/dm/:receiverId', authMiddleware, getDMs);

// Channel routes 
app.post('/api/channel/:channelName/send',  authMiddleware, sendChannelMessage);
app.get('/api/channel/:channelName', authMiddleware, getChannelMessages);
app.get('/api/channels', getChannels );

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});