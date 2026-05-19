import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

/**
 * GET /api/users — full user listing.
 * Restricted to ADMIN to avoid exposing admin accounts/emails to agents.
 */
usersRouter.get('/', authenticate, requireRole('ADMIN'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
