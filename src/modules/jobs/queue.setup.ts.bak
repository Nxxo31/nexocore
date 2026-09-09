import { Queue } from 'bullmq';
import type { RedisOptions } from 'ioredis';

// Redis connection options
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
};

// Email job queue
export const emailQueue = new Queue('email', {
  connection: redisOptions,
});

// Invoice generation job queue
export const invoiceQueue = new Queue('invoice-generation', {
  connection: redisOptions,
});

// Data export job queue
export const dataExportQueue = new Queue('data-export', {
  connection: redisOptions,
});

// Job processors will be defined in consumer.ts