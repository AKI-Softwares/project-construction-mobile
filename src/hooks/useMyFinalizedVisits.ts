import { useQuery } from '@tanstack/react-query';
import { visitsService, FINALIZED_VISITS_FILTER } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useMyFinalizedVisits(enabled: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.VISITS_MINE, 'FINALIZED'],
    queryFn: () => visitsService.getMyVisits(FINALIZED_VISITS_FILTER),
    enabled,
    staleTime: 30_000,
  });
}
