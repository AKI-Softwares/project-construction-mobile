import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';
import { showToast } from '@/lib/toast';

export function useStartVisit(visitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => visitsService.startVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      showToast('success', 'Vistoria iniciada');
    },
    onError: () => showToast('error', 'Não foi possível iniciar'),
  });
}
