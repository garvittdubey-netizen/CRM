import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  listLeads,
  getOneLead,
  addLead,
  editLead,
  removeLead,
  assignLead,
} from '../controllers/lead.controller';

export const leadRouter = Router();

leadRouter.get('/', authenticate, listLeads);
leadRouter.post('/', authenticate, addLead);
leadRouter.get('/:id', authenticate, getOneLead);
leadRouter.put('/:id', authenticate, editLead);
leadRouter.delete('/:id', authenticate, requireRole('ADMIN'), removeLead);
leadRouter.patch('/:id/assign', authenticate, requireRole('ADMIN'), assignLead);
