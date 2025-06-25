import express from 'express';
import dotenv from 'dotenv';
import { redisClient } from './redisService.js';
import { handleChat } from './chatController.js';
import { saveConversation } from './redisService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  await redisClient.set('testKey', 'Hello Redis');
  const value = await redisClient.get('testKey');
  console.log('Redis test value:', value);
  res.send(`Redis says: ${value}`);
});

app.post('/reset', async (req, res) => {
  try {
    await saveConversation('testUser', []);
    res.json({ message: 'Chat history reset' });
  } catch (err) {
    console.error('Error resetting conversation:', err);
    res.status(500).json({ error: 'Failed to reset chat history' });
  }
});

//  This now uses your modular controller
app.post('/chat', handleChat);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  socket.on('chat', async ({ userId, message }) => {
   const response = await handleChatSocket(userId, message);
   socket.emit('reply', response);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
