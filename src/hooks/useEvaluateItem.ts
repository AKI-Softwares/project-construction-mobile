import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { visitsService } from '@/services/visits.service';

export function useEvaluateItem(visitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: 'OK' | 'NOK' }) =>
      visitsService.evaluateItem(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });
}
