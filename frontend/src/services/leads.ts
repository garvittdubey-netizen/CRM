import api from './api';
import type { Lead, LeadsResponse, CreateLeadData, UpdateLeadData, User } from '@/types';

interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  propertyType?: string;
  bhk?: string;
  assignedAgentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const leadsApi = {
  list: (params: LeadListParams) =>
    api.get<LeadsResponse>('/api/leads', { params }).then((r) => r.data),

  get: (id: string) => api.get<Lead>(`/api/leads/${id}`).then((r) => r.data),

  create: (data: CreateLeadData) => api.post<Lead>('/api/leads', data).then((r) => r.data),

  update: (id: string, data: UpdateLeadData) =>
    api.put<Lead>(`/api/leads/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/leads/${id}`),

  assign: (id: string, agentId: string | null) =>
    api.patch<Lead>(`/api/leads/${id}/assign`, { agentId }).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get<User[]>('/api/users').then((r) => r.data),
};
