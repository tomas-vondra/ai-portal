import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = 'admin@ai-portal.local';
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1);

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await db.insert(users).values({
      email: adminEmail,
      name: 'Admin',
      passwordHash,
      role: 'admin',
    });
    console.log(`Created admin user: ${adminEmail} / admin123`);
  } else {
    console.log('Admin user already exists');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
