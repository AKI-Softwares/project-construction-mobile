import { useState, useCallback } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/theme/colors';
import { compressImage } from '@/lib/compressImage';
import type { LocalPhoto } from '@/types/nc.types';
import type { Photo } from '@/types/visit.types';

const MAX_PHOTOS = 5;
const THUMB = 62;

interface Props {
  local: LocalPhoto[];
  existing: Photo[];
  onAdd: (photo: LocalPhoto) => void;
  onRemoveLocal: (index: number) => void;
  onRemoveExisting: (id: number) => void;
  disabled?: boolean;
}

export function PhotoGrid({
  local,
  existing,
  onAdd,
  onRemoveLocal,
  onRemoveExisting,
  disabled = false,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const total = local.length + existing.length;
  const canAdd = !disabled && total < MAX_PHOTOS;

  const pickImage = useCallback(
    async (source: 'camera' | 'gallery') => {
      setIsLoading(true);
      try {
        let pickerResult: ImagePicker.ImagePickerResult;

        if (source === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Permita acesso à câmera nas configurações.');
            return;
          }
          pickerResult = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false });
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Permita acesso à galeria nas configurações.');
            return;
          }
          pickerResult = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false });
        }

        if (!pickerResult.canceled && pickerResult.assets[0]) {
          const compressed = await compressImage(pickerResult.assets[0].uri);
          onAdd(compressed);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onAdd],
  );

  const handleAddPress = useCallback(() => {
    Alert.alert('Adicionar foto', '', [
      { text: 'Câmera', onPress: () => pickImage('camera') },
      { text: 'Galeria', onPress: () => pickImage('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, [pickImage]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {existing.map((photo) => (
        <View key={`e-${photo.id}`} style={{ width: THUMB, height: THUMB }}>
          <Image
            source={{ uri: photo.url }}
            style={{ width: THUMB, height: THUMB, borderRadius: 4 }}
          />
          {!disabled && (
            <Pressable
              onPress={() => onRemoveExisting(photo.id)}
              hitSlop={6}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: Colors.nc,
                borderRadius: 8,
                width: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'IBMPlexSans_700Bold' }}>
                ✕
              </Text>
            </Pressable>
          )}
        </View>
      ))}

      {local.map((photo, index) => (
        <View key={`l-${index}`} style={{ width: THUMB, height: THUMB }}>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: THUMB, height: THUMB, borderRadius: 4 }}
          />
          {!disabled && (
            <Pressable
              onPress={() => onRemoveLocal(index)}
              hitSlop={6}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: Colors.nc,
                borderRadius: 8,
                width: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'IBMPlexSans_700Bold' }}>
                ✕
              </Text>
            </Pressable>
          )}
        </View>
      ))}

      {canAdd && (
        <Pressable
          onPress={handleAddPress}
          disabled={isLoading}
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: Colors.border,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.bg3,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.amber} />
          ) : (
            <Text
              style={{
                color: Colors.amber,
                fontSize: 22,
                fontFamily: 'IBMPlexSans_400Regular',
                lineHeight: 26,
              }}
            >
              ＋
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
