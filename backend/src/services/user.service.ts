import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';

/**
 * User-management service (ADMIN only). Mirrors the patterns used by
 * lead.service / followup.service: returns DTOs without password hashes,
 * applies safety guards before destructive role/status changes, and never
 * trusts the caller for the actor identity (controller passes `actor`).
 */

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface UserListOptions {
  search?: string;
  role?: string; // 'ADMIN' | 'AGENT' | 'ALL'
  isActive?: boolean | 'ALL';
}

export async function listUsers(opts: UserListOptions) {
  const where: Prisma.UserWhereInput = {};

  if (opts.search?.trim()) {
    where.OR = [
      { name:  { contains: opts.search.trim(), mode: 'insensitive' } },
      { email: { contains: opts.search.trim(), mode: 'insensitive' } },
    ];
  }
  if (opts.role && opts.role !== 'ALL') {
    where.role = opts.role as Role;
  }
  if (opts.isActive !== undefined && opts.isActive !== 'ALL') {
    where.isActive = opts.isActive;
  }

  return prisma.user.findMany({
    where,
    select: USER_SELECT,
    orderBy: { name: 'asc' },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: USER_SELECT });
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'AGENT';
  isActive?: boolean;
}

export async function createUser(input: CreateUserInput) {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('A user with this email already exists');
    (err as Error & { code?: string }).code = 'EMAIL_TAKEN';
    throw err;
  }

  if (!input.password || input.password.length < 8) {
    const err = new Error('Password must be at least 8 characters');
    (err as Error & { code?: string }).code = 'WEAK_PASSWORD';
    throw err;
  }

  const hashed = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: hashed,
      role: input.role,
      isActive: input.isActive ?? true,
    },
    select: USER_SELECT,
  });
}

export interface UpdateUserInput {
  name?: string;
  role?: 'ADMIN' | 'AGENT';
  isActive?: boolean;
  password?: string; // optional — only updated when non-empty
}

/**
 * Edits a user. Email is intentionally immutable to avoid breaking foreign
 * keys and audit history; create a new user instead if a swap is needed.
 *
 * Safety rules enforced here (NOT in the controller) so direct service
 * callers can never bypass them:
 *   - An ADMIN can't disable themselves.
 *   - An ADMIN can't demote themselves to AGENT if they are the last ADMIN.
 *   - Last remaining ADMIN cannot be disabled either.
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
  actorId: string,
) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    const err = new Error('User not found');
    (err as Error & { code?: string }).code = 'NOT_FOUND';
    throw err;
  }

  const isSelf = id === actorId;

  // Self-disable guard
  if (input.isActive === false && isSelf) {
    const err = new Error('You cannot disable your own account');
    (err as Error & { code?: string }).code = 'CANNOT_DISABLE_SELF';
    throw err;
  }

  // Last-admin guards (covers self-demotion AND self-disable, plus admin
  // demoting/disabling another admin when they're the only one left).
  const isDemotingAdmin = target.role === 'ADMIN' && input.role === 'AGENT';
  const isDisablingAdmin = target.role === 'ADMIN' && input.isActive === false;
  if (isDemotingAdmin || isDisablingAdmin) {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN', isActive: true },
    });
    if (adminCount <= 1) {
      const msg = isDemotingAdmin
        ? 'Cannot demote the last active admin'
        : 'Cannot disable the last active admin';
      const err = new Error(msg);
      (err as Error & { code?: string }).code = 'LAST_ADMIN';
      throw err;
    }
  }

  const data: Record<string, unknown> = {};
  if (input.name !== undefined)     data.name     = input.name.trim();
  if (input.role !== undefined)     data.role     = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) {
    if (input.password.length < 8) {
      const err = new Error('Password must be at least 8 characters');
      (err as Error & { code?: string }).code = 'WEAK_PASSWORD';
      throw err;
    }
    data.password = await bcrypt.hash(input.password, 12);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
}
