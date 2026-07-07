import { useQuery } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useVisitDetail(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.VISIT_DETAIL(id),
    queryFn: () => visitsService.getVisitById(id),
    staleTime: 30_000,
    refetchInterval: (query) =>
      query.state.data?.status === 'ONGOING' ? 30_000 : false,
  });
}
