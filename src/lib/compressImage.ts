import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import type { LocalPhoto } from '@/types/nc.types';

const MAX_BYTES = 2 * 1024 * 1024;

export async function compressImage(uri: string): Promise<LocalPhoto> {
  const makeResult = (resultUri: string): LocalPhoto => ({
    uri: resultUri,
    fileName: 'photo.jpg',
    mimeType: 'image/jpeg',
  });

  const getSize = async (fileUri: string): Promise<number> => {
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      return (info as FileSystem.FileInfo & { size?: number }).size ?? 0;
    } catch {
      return 0;
    }
  };

  const size = await getSize(uri);
  if (size <= MAX_BYTES) return makeResult(uri);

  try {
    // quality 0.6
    let result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    if ((await getSize(result.uri)) <= MAX_BYTES) return makeResult(result.uri);

    // quality 0.4
    result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.4,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    if ((await getSize(result.uri)) <= MAX_BYTES) return makeResult(result.uri);

    // resize 50% + quality 0.5
    const half = Math.max(1, Math.floor((result.width ?? 1920) / 2));
    result = await ImageManipulator.manipulateAsync(
      result.uri,
      [{ resize: { width: half } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
    );
    return makeResult(result.uri);
  } catch {
    // compression failed — return original and let backend enforce the size limit
    return makeResult(uri);
  }
}
