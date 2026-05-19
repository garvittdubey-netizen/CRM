import { Request, Response } from 'express';
import * as userService from '../services/user.service';

/** Maps service-level error codes to HTTP responses consistently. */
function handleError(e: unknown, res: Response, fallback = 'Request failed'): void {
  const err = e as { code?: string; message?: string };
  const map: Record<string, number> = {
    EMAIL_TAKEN: 409,
    WEAK_PASSWORD: 400,
    NOT_FOUND: 404,
    CANNOT_DISABLE_SELF: 400,
    LAST_ADMIN: 400,
  };
  const status = err.code && map[err.code] ? map[err.code] : 500;
  res.status(status).json({ error: err.message || fallback });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const isActive =
      req.query.isActive === 'true'  ? true
      : req.query.isActive === 'false' ? false
      : 'ALL';
    const users = await userService.listUsers({
      search: req.query.search as string | undefined,
      role: req.query.role as string | undefined,
      isActive,
    });
    res.json(users);
  } catch (e) {
    console.error('listUsers:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, isActive } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !role) {
    res.status(400).json({ error: 'name, email, password, and role are required' });
    return;
  }
  if (role !== 'ADMIN' && role !== 'AGENT') {
    res.status(400).json({ error: 'role must be ADMIN or AGENT' });
    return;
  }

  try {
    const user = await userService.createUser({
      name: String(name),
      email: String(email),
      password: String(password),
      role,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });
    res.status(201).json(user);
  } catch (e) {
    handleError(e, res, 'Failed to create user');
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { name, role, isActive, password } = req.body;

  if (role !== undefined && role !== 'ADMIN' && role !== 'AGENT') {
    res.status(400).json({ error: 'role must be ADMIN or AGENT' });
    return;
  }

  try {
    const user = await userService.updateUser(
      req.params.id,
      {
        name,
        role,
        isActive,
        password: password ? String(password) : undefined,
      },
      req.user!.id,
    );
    res.json(user);
  } catch (e) {
    handleError(e, res, 'Failed to update user');
  }
}
