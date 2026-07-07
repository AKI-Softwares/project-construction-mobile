import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { QUERY_KEYS } from '@/lib/constants';
import { visitsService } from '@/services/visits.service';
import { showToast } from '@/lib/toast';

export function useFinalizeVisit(visitId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => visitsService.finalizeVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      showToast('success', 'Vistoria finalizada');
      router.replace('/(app)/(tabs)/visits' as any);
    },
    onError: () => showToast('error', 'Não foi possível finalizar'),
  });
}
