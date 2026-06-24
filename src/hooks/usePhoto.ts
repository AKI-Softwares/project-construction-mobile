import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { photosService } from '@/services/photos.service';
import { showToast } from '@/lib/toast';
import type { LocalPhoto } from '@/types/nc.types';

export function usePhoto(visitId: number) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({ ncId, photo }: { ncId: number; photo: LocalPhoto }) =>
      photosService.add(ncId, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Foto adicionada');
    },
    onError: () => showToast('error', 'Erro ao adicionar foto'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ ncId, photoId }: { ncId: number; photoId: number }) =>
      photosService.remove(ncId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Foto removida');
    },
    onError: () => showToast('error', 'Erro ao remover foto'),
  });

  return { addMutation, deleteMutation };
}
