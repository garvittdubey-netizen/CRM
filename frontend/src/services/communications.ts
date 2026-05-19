import api from './api';
import type {
  Communication,
  CommunicationsResponse,
  ConversationSummary,
  LogCallPayload,
  SendWhatsAppPayload,
  WhatsAppTemplate,
} from '@/types';

export interface ListCommunicationsParams {
  leadId?: string;
  type?: 'WHATSAPP' | 'CALL';
  page?: number;
  limit?: number;
}

export const communicationsApi = {
  list: (params: ListCommunicationsParams = {}) =>
    api.get<CommunicationsResponse>('/api/communications', { params }).then((r) => r.data),

  conversations: () =>
    api
      .get<{ conversations: ConversationSummary[] }>('/api/communications/conversations')
      .then((r) => r.data.conversations),

  sendWhatsApp: (data: SendWhatsAppPayload) =>
    api.post<Communication>('/api/communications/whatsapp/send', data).then((r) => r.data),

  logCall: (data: LogCallPayload) =>
    api.post<Communication>('/api/communications/calls', data).then((r) => r.data),

  templates: () =>
    api
      .get<{ templates: WhatsAppTemplate[] }>('/api/communications/templates')
      .then((r) => r.data.templates),
};
