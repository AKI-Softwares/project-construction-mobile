import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { nonConformitiesService } from '@/services/non-conformities.service';

export function useNonConformity(visitId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ visitItemId, description }: { visitItemId: number; description: string }) =>
      nonConformitiesService.create(visitItemId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, description }: { id: number; description: string }) =>
      nonConformitiesService.patch(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });

  return { createMutation, patchMutation };
}
