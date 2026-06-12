import type { Photo } from './visit.types';

export interface LocalPhoto {
  uri: string;
  fileName?: string;
  mimeType?: string;
}

export interface NCDraft {
  description: string;
  localPhotos: LocalPhoto[];
  existingPhotos: Photo[];
  removedPhotoIds: number[];
}
