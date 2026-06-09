import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { photosService } from '@/services/photos.service';
import type { LocalPhoto } from '@/types/nc.types';

export function usePhoto(visitId: number) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({ ncId, photo }: { ncId: number; photo: LocalPhoto }) =>
      photosService.add(ncId, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: number) => photosService.remove(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });

  return { addMutation, deleteMutation };
}
