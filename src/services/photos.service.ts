import { api } from './api';
import type { Photo } from '@/types/visit.types';
import type { LocalPhoto } from '@/types/nc.types';

interface UploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  transformation: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

async function getUploadParams(ncId: number): Promise<UploadParams> {
  return api
    .get<UploadParams>(`/non-conformities/${ncId}/photos/upload-params`)
    .then((r) => r.data);
}

async function uploadToCloudinary(params: UploadParams, photo: LocalPhoto): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', { uri: photo.uri, name: photo.fileName ?? 'photo.jpg', type: photo.mimeType ?? 'image/jpeg' } as unknown as Blob);
  formData.append('api_key', params.apiKey);
  formData.append('timestamp', String(params.timestamp));
  formData.append('signature', params.signature);
  formData.append('folder', params.folder);
  formData.append('transformation', params.transformation);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );
  if (!response.ok) throw new Error(`Cloudinary upload failed: ${response.status}`);
  return response.json() as Promise<CloudinaryUploadResult>;
}

export const photosService = {
  add: async (nonConformityId: number, photo: LocalPhoto): Promise<Photo> => {
    const params = await getUploadParams(nonConformityId);
    const result = await uploadToCloudinary(params, photo);
    return api
      .post<Photo>(`/non-conformities/${nonConformityId}/photos/confirm`, {
        url: result.secure_url,
        publicId: result.public_id,
      })
      .then((r) => r.data);
  },

  remove: (nonConformityId: number, photoId: number): Promise<void> =>
    api.delete(`/non-conformities/${nonConformityId}/photos/${photoId}`).then(() => undefined),
};
