import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  SESSION_SECRET: z.string().min(16),
  ANTHROPIC_API_KEY: z.string().optional(),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(50),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;
