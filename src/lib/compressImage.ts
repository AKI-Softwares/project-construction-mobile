import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import type { LocalPhoto } from '@/types/nc.types';

const MAX_BYTES = 10 * 1024 * 1024;

export async function compressImage(uri: string): Promise<LocalPhoto> {
  const makeResult = (resultUri: string): LocalPhoto => ({
    uri: resultUri,
    fileName: 'photo.jpg',
    mimeType: 'image/jpeg',
  });

  const getSize = async (fileUri: string): Promise<number> => {
    const info = await FileSystem.getInfoAsync(fileUri, { size: true });
    return (info as FileSystem.FileInfo & { size?: number }).size ?? 0;
  };

  const size = await getSize(uri);
  if (size <= MAX_BYTES) return makeResult(uri);

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
  const half = Math.floor(result.width / 2);
  result = await ImageManipulator.manipulateAsync(
    result.uri,
    [{ resize: { width: half } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
  );
  return makeResult(result.uri);
}
