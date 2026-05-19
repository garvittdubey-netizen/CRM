import api from './api';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  search?: string;
  role?: 'ADMIN' | 'AGENT' | 'ALL';
  isActive?: 'true' | 'false' | 'ALL';
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'AGENT';
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  role?: 'ADMIN' | 'AGENT';
  isActive?: boolean;
  password?: string;
}

export const usersApi = {
  list: (params: UserListParams = {}) => {
    const query: Record<string, string> = {};
    if (params.search?.trim()) query.search = params.search.trim();
    if (params.role && params.role !== 'ALL') query.role = params.role;
    if (params.isActive && params.isActive !== 'ALL') query.isActive = params.isActive;
    return api.get<ManagedUser[]>('/api/users', { params: query }).then((r) => r.data);
  },

  create: (payload: CreateUserPayload) =>
    api.post<ManagedUser>('/api/users', payload).then((r) => r.data),

  update: (id: string, payload: UpdateUserPayload) =>
    api.put<ManagedUser>(`/api/users/${id}`, payload).then((r) => r.data),
};
