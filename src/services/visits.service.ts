import { api } from './api';
import type { Visit, VisitDetail, VisitItem } from '@/types/visit.types';

type StatusFilter = string & { readonly __brand: 'StatusFilter' };
export const ACTIVE_VISITS_FILTER = 'NOT_STARTED,ONGOING' as StatusFilter;
export const FINALIZED_VISITS_FILTER = 'FINALIZED' as StatusFilter;

export const visitsService = {
  getMyVisits: (status?: StatusFilter): Promise<Visit[]> =>
    api.get<Visit[]>('/visits/mine', status ? { params: { status } } : undefined)
      .then((r) => r.data),

  getVisitById: (id: number): Promise<VisitDetail> =>
    api.get<VisitDetail>(`/visits/${id}`).then((r) => r.data),

  startVisit: (id: number): Promise<Visit> =>
    api.patch<Visit>(`/visits/${id}/start`).then((r) => r.data),

  evaluateItem: (visitId: number, itemId: number, status: 'OK' | 'NOK' | null): Promise<VisitItem> =>
    api.patch<VisitItem>(`/visits/${visitId}/items/${itemId}`, { status }).then((r) => r.data),

  finalizeVisit: (id: number): Promise<Visit> =>
    api.patch<Visit>(`/visits/${id}`, { status: 'FINALIZED' }).then((r) => r.data),

  getAvailableReinspections: (): Promise<Visit[]> =>
    api.get<Visit[]>('/visits/available-reinspections').then((r) => r.data),

  claimReinspection: (id: number): Promise<Visit> =>
    api.patch<Visit>(`/visits/${id}/claim`).then((r) => r.data),
};

export const reportService = {
  saveSignature: (id: number, imageBase64: string): Promise<{ id: number; signatureUrl: string | null }> =>
    api.post(`/visits/${id}/signature`, { imageBase64 }).then((r) => r.data),

  downloadReport: async (id: number): Promise<string> => {
    const res = await api.get<ArrayBuffer>(`/visits/${id}/report`, { responseType: 'arraybuffer' });
    const data = new Uint8Array(res.data);
    let binary = '';
    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    return btoa(binary);
  },
};

export const pushService = {
  saveToken: (token: string): Promise<void> =>
    api.post('/users/me/push-token', { token, platform: 'android' }).then(() => undefined),

  removeToken: (): Promise<void> =>
    api.delete('/users/me/push-token').then(() => undefined),
};
