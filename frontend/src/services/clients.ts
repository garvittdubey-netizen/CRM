import api from './api';
import type {
  Client,
  ClientsResponse,
  CreateClientData,
  UpdateClientData,
  ClientTimelineItem,
} from '@/types';

export interface ClientListParams {
  page?: number;
  limit?: number;
  search?: string;
  assignedAgentId?: string;
  linkedLeadId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const clientsApi = {
  list: (params: ClientListParams) =>
    api.get<ClientsResponse>('/api/clients', { params }).then((r) => r.data),

  get: (id: string) => api.get<Client>(`/api/clients/${id}`).then((r) => r.data),

  create: (data: CreateClientData) =>
    api.post<Client>('/api/clients', data).then((r) => r.data),

  update: (id: string, data: UpdateClientData) =>
    api.put<Client>(`/api/clients/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/clients/${id}`),

  assign: (id: string, agentId: string | null) =>
    api.patch<Client>(`/api/clients/${id}/assign`, { agentId }).then((r) => r.data),

  timeline: (id: string) =>
    api.get<{ items: ClientTimelineItem[] }>(`/api/clients/${id}/timeline`).then((r) => r.data.items),
};
