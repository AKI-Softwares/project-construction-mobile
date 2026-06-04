import { useQuery } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useMyVisits() {
  return useQuery({
    queryKey: QUERY_KEYS.VISITS_MINE,
    queryFn: () => visitsService.getMyVisits('NOT_STARTED,ONGOING'),
    staleTime: 30_000,
  });
}
