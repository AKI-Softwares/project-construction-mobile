import { memo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
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
  const statusColor = room.isComplete ? Colors.ok : Colors.t2;
  const statusLabel = room.isComplete ? 'CONCLUÍDO' : 'PENDENTE';

  const rowStyle = [
    styles.row,
    { borderLeftColor: borderColor },
  ];

  if (!onPress) {
    return (
      <View style={rowStyle}>
        <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
        <Text style={styles.count}>
          {serviceCount} {serviceCount === 1 ? 'serviço' : 'serviços'}
        </Text>
        <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowStyle,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
      <Text style={styles.count}>
        {serviceCount} {serviceCount === 1 ? 'serviço' : 'serviços'}
      </Text>
      <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.pend,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  pressed: {
    backgroundColor: Colors.bg3,
  },
  name: {
    flex: 1,
    color: Colors.t1,
    fontSize: 14,
    fontFamily: 'IBMPlexSans_600SemiBold',
  },
  count: {
    color: Colors.t2,
    fontSize: 12,
    fontFamily: 'IBMPlexMono_400Regular',
    marginLeft: 12,
  },
  status: {
    fontSize: 12,
    fontFamily: 'IBMPlexMono_400Regular',
    marginLeft: 12,
  },
});
