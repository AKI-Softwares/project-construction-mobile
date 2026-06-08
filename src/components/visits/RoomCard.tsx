import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Colors } from '@/theme/colors';
import type { Room } from '@/types/visit.types';

interface Props {
  room: Room;
  onPress?: () => void;
}

export const RoomCard = memo(function RoomCard({ room, onPress }: Props) {
  const borderColor = onPress
    ? room.isComplete ? Colors.ok : Colors.pend
    : Colors.pend;

  const serviceCount = room.items.length;

  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: borderColor,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  };

  const label = (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: Colors.t1,
          fontSize: 14,
          fontFamily: 'IBMPlexSans_600SemiBold',
          marginBottom: 2,
        }}
      >
        {room.name}
      </Text>
      <Text
        style={{
          color: Colors.t2,
          fontSize: 12,
          fontFamily: 'IBMPlexSans_400Regular',
        }}
      >
        {serviceCount} {serviceCount === 1 ? 'serviço' : 'serviços'}
      </Text>
    </View>
  );

  if (!onPress) {
    return <View style={containerStyle}>{label}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...containerStyle,
        backgroundColor: pressed ? Colors.bg3 : Colors.bg2,
      })}
    >
      {label}
      <Text
        style={{
          color: room.isComplete ? Colors.ok : Colors.t3,
          fontSize: 16,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      >
        {room.isComplete ? '✓' : '○'}
      </Text>
    </Pressable>
  );
});
