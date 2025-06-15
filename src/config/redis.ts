// src/config/redis.ts
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPassword = process.env.REDIS_PASSWORD;

const redisClient: RedisClientType = createClient({
  url: `redis://${redisPassword ? `:${redisPassword}@` : ''}${redisHost}:${redisPort}`
});

// IMPORTANT: Define an async function to connect the Redis client
export async function initializeRedis(): Promise<void> {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis!');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    // You might want to re-throw the error or exit the process if Redis is critical
    throw err;
  }
}

// Optional: Add event listeners for connection status logging (still good to have)
redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

// Export the client itself for use in app.ts and services
export default redisClient;