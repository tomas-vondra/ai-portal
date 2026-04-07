import 'dotenv/config';
import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
import { SYSTEM_USER_ID } from '../config.js';

async function seed() {
  console.log('Seeding database...');

  // Create system user for MVP (single-user, no auth)
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, SYSTEM_USER_ID)).limit(1);

  if (existing.length === 0) {
    await db.insert(users).values({
      id: SYSTEM_USER_ID,
      email: 'system@ai-portal.local',
      name: 'System',
    });
    console.log('Created system user');
  } else {
    console.log('System user already exists');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
