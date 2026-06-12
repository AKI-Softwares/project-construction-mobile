import { memo } from 'react';
import { View } from 'react-native';
import { Colors } from '@/theme/colors';

interface Props {
  value: number; // 0–1
}

export const ProgressBar = memo(function ProgressBar({ value }: Props) {
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View
      style={{
        height: 4,
        borderRadius: 99,
        backgroundColor: Colors.bg4,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          backgroundColor: Colors.amber,
          borderRadius: 99,
        }}
      />
    </View>
  );
});
