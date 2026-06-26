import { memo, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { PhotoGrid } from './PhotoGrid';
import type { NCDraft } from '@/types/nc.types';
import type { LocalPhoto } from '@/types/nc.types';

interface Props {
  value: NCDraft;
  onChange: (draft: NCDraft) => void;
  disabled?: boolean;
}

export const NCForm = memo(function NCForm({ value, onChange, disabled = false }: Props) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();

  const handleAddPhoto = (photo: LocalPhoto) => {
    onChange({ ...value, localPhotos: [...value.localPhotos, photo] });
  };

  const handleRemoveLocal = (index: number) => {
    onChange({ ...value, localPhotos: value.localPhotos.filter((_, i) => i !== index) });
  };

  const handleRemoveExisting = (id: number) => {
    onChange({
      ...value,
      existingPhotos: value.existingPhotos.filter((p) => p.id !== id),
      removedPhotoIds: [...value.removedPhotoIds, id],
    });
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text
        style={{
          color: colors.t3,
          fontSize: 9,
          fontFamily: 'IBMPlexMono_600SemiBold',
          letterSpacing: 1.08,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        DESCRIÇÃO
      </Text>
      <TextInput
        value={value.description}
        onChangeText={(text) => onChange({ ...value, description: text })}
        editable={!disabled}
        multiline
        numberOfLines={4}
        placeholder="Descreva a não conformidade..."
        placeholderTextColor={colors.t3}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: focused && !disabled ? colors.teal : 'transparent',
          borderRadius: 6,
          padding: 12,
          color: colors.t1,
          fontSize: 14,
          fontFamily: 'IBMPlexSans_400Regular',
          minHeight: 96,
          textAlignVertical: 'top',
        }}
      />

      <Text
        style={{
          color: colors.t3,
          fontSize: 9,
          fontFamily: 'IBMPlexMono_600SemiBold',
          letterSpacing: 1.08,
          textTransform: 'uppercase',
          marginTop: 16,
          marginBottom: 6,
        }}
      >
        FOTOS
      </Text>
      <PhotoGrid
        local={value.localPhotos}
        existing={value.existingPhotos}
        onAdd={handleAddPhoto}
        onRemoveLocal={handleRemoveLocal}
        onRemoveExisting={handleRemoveExisting}
        disabled={disabled}
      />
    </View>
  );
});
