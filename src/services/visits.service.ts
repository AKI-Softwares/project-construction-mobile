import { api } from './api';
import type { Visit } from '@/types/visit.types';

type StatusFilter = string & { readonly __brand: 'StatusFilter' };
export const ACTIVE_VISITS_FILTER = 'NOT_STARTED,ONGOING' as StatusFilter;

export const visitsService = {
  getMyVisits: (status?: StatusFilter): Promise<Visit[]> =>
    api.get<Visit[]>('/visits/mine', status ? { params: { status } } : undefined)
      .then((r) => r.data),
};
