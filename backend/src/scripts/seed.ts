import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

/**
 * Seeds the admin user on first run. Idempotent — safe to call on every startup.
 */
export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL || 'admin@realestate.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@2036';
  const name = 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hashed, role: 'ADMIN' },
    });
    console.log(`✅ Admin user seeded: ${email}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${email}`);
  }
}
