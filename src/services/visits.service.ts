import { api } from './api';
import type { Visit, VisitDetail, VisitItem } from '@/types/visit.types';

type StatusFilter = string & { readonly __brand: 'StatusFilter' };
export const ACTIVE_VISITS_FILTER = 'NOT_STARTED,ONGOING' as StatusFilter;

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

export const pushService = {
  saveToken: (token: string): Promise<void> =>
    api.post('/users/me/push-token', { token, platform: 'android' }).then(() => undefined),

  removeToken: (): Promise<void> =>
    api.delete('/users/me/push-token').then(() => undefined),
};
