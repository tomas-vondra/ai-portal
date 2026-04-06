import Redis from 'ioredis';
import { config } from './config.js';

let redis: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redis) {
    redis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return redis;
}

/** Create a new connection for Pub/Sub subscribers (each subscriber needs its own) */
export function createRedisSubscriber(): Redis {
  return new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
}
