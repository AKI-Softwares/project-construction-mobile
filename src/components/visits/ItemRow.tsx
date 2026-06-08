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
    Colors.t3;

  const badgeLabel =
    item.status === 'OK' ? '✓ OK' :
    item.status === 'NOK' ? '✕ NOK' :
    '○';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
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
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: Colors.t1,
            fontSize: 14,
            fontFamily: 'IBMPlexSans_400Regular',
          }}
        >
          {item.serviceName}
        </Text>
        {item.status === null && (
          <Text
            style={{
              color: Colors.t3,
              fontSize: 12,
              fontFamily: 'IBMPlexSans_400Regular',
              marginTop: 2,
            }}
          >
            Não avaliado
          </Text>
        )}
      </View>
      <Text
        style={{
          color: badgeColor,
          fontSize: 12,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      >
        {badgeLabel}
      </Text>
    </Pressable>
  );
});
