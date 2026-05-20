import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listDeals,
  getOneDeal,
  addDeal,
  editDeal,
  removeDeal,
} from '../controllers/deal.controller';

export const dealRouter = Router();

dealRouter.get('/', authenticate, listDeals);
dealRouter.post('/', authenticate, addDeal);
dealRouter.get('/:id', authenticate, getOneDeal);
dealRouter.put('/:id', authenticate, editDeal);
dealRouter.delete('/:id', authenticate, removeDeal);
