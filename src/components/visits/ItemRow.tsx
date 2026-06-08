import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Colors } from '@/theme/colors';
import type { VisitItem } from '@/types/visit.types';

interface Props {
  item: VisitItem;
  onPress: () => void;
}

export const ItemRow = memo(function ItemRow({ item, onPress }: Props) {
  const dotColor =
    item.status === 'OK' ? Colors.ok :
    item.status === 'NOK' ? Colors.nc :
    Colors.pend;

  const badgeColor =
    item.status === 'OK' ? Colors.ok :
    item.status === 'NOK' ? Colors.nc :
    Colors.t2;

  const badgeLabel =
    item.status === 'OK' ? '✓ OK' :
    item.status === 'NOK' ? '✕ NOK' :
    'PENDENTE';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: pressed ? Colors.bg3 : Colors.bg2,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      })}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dotColor,
          marginRight: 12,
        }}
      />
      <Text
        style={{
          flex: 1,
          color: Colors.t1,
          fontSize: 15,
          fontFamily: 'IBMPlexSans_400Regular',
        }}
        numberOfLines={2}
      >
        {item.serviceName}
      </Text>
      <Text
        style={{
          color: badgeColor,
          fontSize: 13,
          fontFamily: 'IBMPlexMono_400Regular',
          marginLeft: 12,
        }}
      >
        {badgeLabel}
      </Text>
    </Pressable>
  );
});
