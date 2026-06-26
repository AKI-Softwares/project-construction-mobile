import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemStatusConfig } from '@/theme/colors';
import { useTheme } from '@/hooks/useTheme';
import type { VisitItem } from '@/types/visit.types';

interface Props {
  item: VisitItem;
  onPress?: () => void;
}

export const ItemRow = memo(function ItemRow({ item, onPress }: Props) {
  const { colors } = useTheme();
  const key = item.status === 'OK' ? 'OK' : item.status === 'NOK' ? 'NOK' : 'NA';
  const cfg = ItemStatusConfig[key];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: pressed && onPress ? colors.surfacePressed : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 12,
        opacity: onPress ? 1 : 0.5,
      })}
    >
      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      <Text
        style={{ flex: 1, color: colors.t1, fontSize: 15, fontFamily: 'IBMPlexSans_400Regular' }}
        numberOfLines={2}
      >
        {item.serviceName}
      </Text>
      <Text style={{ color: cfg.color, fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold' }}>
        {cfg.label}
      </Text>
    </Pressable>
  );
});
