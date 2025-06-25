import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

await redisClient.connect();

//export { redisClient };

export async function saveConversation(userId, messagesArray) {
  const key = `chat:${userId}`;
  await redisClient.set(key, JSON.stringify(messagesArray));
}

export async function getConversation(userId) {
  const key = `chat:${userId}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : [];
}
