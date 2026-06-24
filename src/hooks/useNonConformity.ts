import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { nonConformitiesService } from '@/services/non-conformities.service';
import { showToast } from '@/lib/toast';

export function useNonConformity(visitId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ visitItemId, description }: { visitItemId: number; description: string }) =>
      nonConformitiesService.create(visitItemId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Não conformidade salva');
    },
    onError: () => showToast('error', 'Não foi possível salvar a não conformidade'),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, description }: { id: number; description: string }) =>
      nonConformitiesService.patch(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Não conformidade salva');
    },
    onError: () => showToast('error', 'Não foi possível salvar a não conformidade'),
  });

  return { createMutation, patchMutation };
}
