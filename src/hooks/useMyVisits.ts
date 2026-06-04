import { useQuery } from '@tanstack/react-query';
import { visitsService, ACTIVE_VISITS_FILTER } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useMyVisits() {
  return useQuery({
    queryKey: [...QUERY_KEYS.VISITS_MINE, 'NOT_STARTED,ONGOING'],
    queryFn: () => visitsService.getMyVisits(ACTIVE_VISITS_FILTER),
    staleTime: 30_000,
  });
}
