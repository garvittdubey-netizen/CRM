import { Request, Response } from 'express';
import * as dealService from '../services/deal.service';

function validateRequired(body: Record<string, unknown>): string | null {
  const required: Array<[string, string]> = [
    ['title', 'Title'],
    ['propertyId', 'Property'],
    ['clientId', 'Client'],
  ];
  for (const [k, label] of required) {
    const v = body[k];
    if (typeof v !== 'string' || !v.trim()) return `${label} is required`;
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be a positive number';
  return null;
}

export async function listDeals(req: Request, res: Response): Promise<void> {
  try {
    const result = await dealService.listDeals({
      page: req.query.page ? Math.max(1, Number(req.query.page)) : 1,
      limit: req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 20,
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      assignedAgentId: req.query.assignedAgentId as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      userId: req.user!.id,
      userRole: req.user!.role,
    });
    res.json(result);
  } catch (e) {
    console.error('listDeals:', e);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
}

export async function getOneDeal(req: Request, res: Response): Promise<void> {
  try {
    const deal = await dealService.getDealById(req.params.id);
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    if (req.user!.role !== 'ADMIN' && deal.assignedAgentId !== req.user!.id) {
      res.status(403).json({ error: 'You do not have access to this deal' });
      return;
    }
    res.json(deal);
  } catch (e) {
    console.error('getOneDeal:', e);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
}

export async function addDeal(req: Request, res: Response): Promise<void> {
  const validationError = validateRequired(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  try {
    // RBAC mirrors Leads/Properties/Clients:
    //   - AGENT can only create deals owned by themselves (any other id is
    //     silently coerced to their own).
    //   - ADMIN may assign any agent. Explicit `null` is honoured as "owner
    //     omitted"; we fall back to the admin themselves. Deals must have an
    //     owner (the schema requires assignedAgentId), so we never persist null.
    const assignedAgentId =
      req.user!.role === 'ADMIN'
        ? req.body.assignedAgentId || req.user!.id
        : req.user!.id;

    const deal = await dealService.createDeal({
      ...req.body,
      assignedAgentId,
    });
    res.status(201).json(deal);
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    // Foreign-key violation: bad propertyId / clientId / assignedAgentId.
    if (err.code === 'P2003' || err.code === 'P2025') {
      res.status(400).json({ error: 'Invalid property, client or agent reference' });
      return;
    }
    res.status(400).json({ error: err.message || 'Failed to create deal' });
  }
}

export async function editDeal(req: Request, res: Response): Promise<void> {
  try {
    const existing = await dealService.getDealById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    // AGENT may edit only their own deals and may NOT change `assignedAgentId`
    // (admin-only re-assignment, matching the Lead/Client pattern).
    if (req.user!.role !== 'ADMIN') {
      if (existing.assignedAgentId !== req.user!.id) {
        res.status(403).json({ error: 'You can only edit deals assigned to you' });
        return;
      }
      if (
        req.body.assignedAgentId !== undefined &&
        req.body.assignedAgentId !== req.user!.id
      ) {
        res.status(403).json({ error: 'Only an admin can reassign deals' });
        return;
      }
    }

    const deal = await dealService.updateDeal(req.params.id, req.body);
    res.json(deal);
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: 'Invalid property, client or agent reference' });
      return;
    }
    res.status(400).json({ error: err.message || 'Failed to update deal' });
  }
}

export async function removeDeal(req: Request, res: Response): Promise<void> {
  try {
    const existing = await dealService.getDealById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    if (req.user!.role !== 'ADMIN' && existing.assignedAgentId !== req.user!.id) {
      res.status(403).json({ error: 'You can only delete deals assigned to you' });
      return;
    }
    await dealService.deleteDeal(req.params.id);
    res.status(204).send();
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete deal' });
  }
}
