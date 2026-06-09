import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { QUERY_KEYS } from '@/lib/constants';
import { visitsService } from '@/services/visits.service';

export function useFinalizeVisit(visitId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => visitsService.finalizeVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      router.replace('/(app)/(tabs)/visits');
    },
  });
}
