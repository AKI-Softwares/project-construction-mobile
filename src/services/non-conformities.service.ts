import { api } from './api';
import type { NonConformity } from '@/types/visit.types';

export const nonConformitiesService = {
  create: (visitItemId: number, description: string): Promise<NonConformity> =>
    api.post<NonConformity>('/non-conformities', { visitItemId, description }).then((r) => r.data),

  patch: (id: number, description: string): Promise<NonConformity> =>
    api.patch<NonConformity>(`/non-conformities/${id}`, { description }).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/non-conformities/${id}`).then(() => undefined),
};
