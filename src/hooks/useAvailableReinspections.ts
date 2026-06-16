import { useQuery } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useAvailableReinspections() {
  return useQuery({
    queryKey: QUERY_KEYS.REINSPECTIONS_AVAILABLE,
    queryFn: () => visitsService.getAvailableReinspections(),
    staleTime: 30_000,
  });
}
