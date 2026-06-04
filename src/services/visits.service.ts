import { api } from './api';
import type { Visit } from '@/types/visit.types';

export const visitsService = {
  getMyVisits: (status?: string): Promise<Visit[]> =>
    api.get<Visit[]>('/visits/mine', status ? { params: { status } } : undefined)
      .then((r) => r.data),
};
