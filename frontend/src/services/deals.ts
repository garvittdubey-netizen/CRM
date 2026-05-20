import api from './api';
import type { Deal, DealsResponse, CreateDealData, UpdateDealData } from '@/types';

export interface DealListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedAgentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const dealsApi = {
  list: (params: DealListParams) =>
    api.get<DealsResponse>('/api/deals', { params }).then((r) => r.data),

  get: (id: string) => api.get<Deal>(`/api/deals/${id}`).then((r) => r.data),

  create: (data: CreateDealData) => api.post<Deal>('/api/deals', data).then((r) => r.data),

  update: (id: string, data: UpdateDealData) =>
    api.put<Deal>(`/api/deals/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/deals/${id}`),
};
