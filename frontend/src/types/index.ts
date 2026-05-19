// Core application types

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}

export type UserRole = 'ADMIN' | 'AGENT';

// ── Lead Module ──────────────────────────────────────────────────────────────

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATING' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  budget: number | null;
  preferredLocation: string | null;
  bhk: string | null;
  propertyType: string | null;
  status: LeadStatus;
  tags: string[];
  notes: string | null;
  assignedAgentId: string | null;
  assignedAgent: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateLeadData {
  fullName: string;
  phone?: string;
  email?: string;
  budget?: number | null;
  preferredLocation?: string;
  bhk?: string;
  propertyType?: string;
  status?: LeadStatus;
  tags?: string[];
  notes?: string;
  assignedAgentId?: string | null;
}

export type UpdateLeadData = Partial<CreateLeadData>;

// ── Follow-Up Module ─────────────────────────────────────────────────────────

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

export interface FollowUp {
  id: string;
  leadId: string;
  lead: {
    id: string;
    fullName: string;
    status: LeadStatus;
    phone: string | null;
  };
  assignedAgentId: string;
  assignedAgent: { id: string; name: string; email: string };
  followUpDate: string;
  reminderDate: string | null;
  status: FollowUpStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpsResponse {
  followUps: FollowUp[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateFollowUpData {
  leadId: string;
  assignedAgentId: string;
  followUpDate: string;
  reminderDate?: string | null;
  status?: FollowUpStatus;
  notes?: string | null;
}

export type UpdateFollowUpData = Partial<CreateFollowUpData>;

export interface FollowUpDashboardStats {
  today: number;
  overdue: number;
  upcoming: number;
}
