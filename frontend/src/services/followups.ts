import api from './api';
import type {
  FollowUp,
  FollowUpsResponse,
  CreateFollowUpData,
  UpdateFollowUpData,
  FollowUpDashboardStats,
} from '@/types';

export interface FollowUpListParams {
  leadId?: string;
  assignedAgentId?: string;
  status?: string;
  window?: 'upcoming' | 'overdue' | 'today';
  page?: number;
  limit?: number;
}

export const followUpsApi = {
  list: (params: FollowUpListParams = {}) =>
    api.get<FollowUpsResponse>('/api/followups', { params }).then((r) => r.data),

  get: (id: string) => api.get<FollowUp>(`/api/followups/${id}`).then((r) => r.data),

  create: (data: CreateFollowUpData) =>
    api.post<FollowUp>('/api/followups', data).then((r) => r.data),

  update: (id: string, data: UpdateFollowUpData) =>
    api.put<FollowUp>(`/api/followups/${id}`, data).then((r) => r.data),

  complete: (id: string) =>
    api.patch<FollowUp>(`/api/followups/${id}/complete`).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/followups/${id}`),

  stats: () => api.get<FollowUpDashboardStats>('/api/followups/stats').then((r) => r.data),
};
