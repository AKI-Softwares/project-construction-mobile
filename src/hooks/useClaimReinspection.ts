import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useClaimReinspection(visitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => visitsService.claimReinspection(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REINSPECTIONS_AVAILABLE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });
}
