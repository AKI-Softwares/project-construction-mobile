import { api } from './api';
import type { Photo } from '@/types/visit.types';
import type { LocalPhoto } from '@/types/nc.types';

export const photosService = {
  add: (nonConformityId: number, photo: LocalPhoto): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      name: photo.fileName ?? 'photo.jpg',
      type: photo.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
    return api
      .post<Photo>(`/non-conformities/${nonConformityId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  remove: (id: number): Promise<void> =>
    api.delete(`/photos/${id}`).then(() => undefined),
};
