import { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: number; // 0–1  ← interface preservada
}

export const ProgressBar = memo(function ProgressBar({ value }: Props) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View
      style={{
        height: 5,
        borderRadius: 99,
        backgroundColor: colors.progressTrack,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          backgroundColor: colors.progressFill,
          borderRadius: 99,
        }}
      />
    </View>
  );
});
