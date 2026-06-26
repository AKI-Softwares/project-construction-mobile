import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { Room } from '@/types/visit.types';

interface Props {
  room: Room;
  onPress?: () => void;
}

function getRoomStatus(room: Room): { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] } {
  const hasNok = room.items.some((i) => i.status === 'NOK');
  if (hasNok) return { label: 'Pendência', color: '#F57C00', icon: 'alert-circle' };
  if (room.isComplete) return { label: 'Concluído', color: '#22C4CC', icon: 'checkmark-circle' };
  return { label: 'Aguardando', color: '#8A9BAD', icon: 'time-outline' };
}

export const RoomCard = memo(function RoomCard({ room, onPress }: Props) {
  const { colors } = useTheme();
  const status = getRoomStatus(room);

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
      }}
    >
      <Ionicons name={status.icon} size={22} color={status.color} />
      <Text
        style={{ flex: 1, color: colors.t1, fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold' }}
        numberOfLines={1}
      >
        {room.name}
      </Text>
      <Text style={{ color: status.color, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
        {status.label}
      </Text>
    </View>
  );

  const cardStyle = {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  };

  if (!onPress) return <View style={cardStyle}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && { backgroundColor: colors.surfacePressed }]}
    >
      {content}
    </Pressable>
  );
});
