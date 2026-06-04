import { Pressable, Text, View } from 'react-native';
import { Colors, VisitStatusConfig } from '@/theme/colors';
import { VisitStatusBadge } from './VisitStatusBadge';
import type { Visit } from '@/types/visit.types';

interface Props {
  visit: Visit;
  onPress: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function formatApt(apt: Visit['apartment']): string {
  return `Apt ${apt.identifier} · Bloco ${apt.block} · ${apt.floor}º Andar`;
}

export function VisitCard({ visit, onPress }: Props) {
  const statusColor = VisitStatusConfig[visit.status]?.color ?? Colors.pend;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? Colors.bg3 : Colors.bg2,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: statusColor,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginBottom: 8,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}
      >
        <VisitStatusBadge status={visit.status} />
        <Text
          style={{
            color: Colors.t3,
            fontSize: 10,
            fontFamily: 'IBMPlexMono_400Regular',
            letterSpacing: 0.6,
          }}
        >
          {formatDate(visit.createdAt)}
        </Text>
      </View>
      <Text
        style={{
          color: Colors.t1,
          fontSize: 13,
          fontFamily: 'IBMPlexSans_600SemiBold',
          marginBottom: 2,
        }}
      >
        {visit.apartment.building.name}
      </Text>
      <Text
        style={{
          color: Colors.t2,
          fontSize: 11,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      >
        {formatApt(visit.apartment)}
      </Text>
    </Pressable>
  );
}
