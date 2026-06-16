import { Pressable, Text, View } from 'react-native';
import { Colors, VisitStatusConfig } from '@/theme/colors';
import { VisitStatusBadge } from './VisitStatusBadge';
import type { Visit } from '@/types/visit.types';

interface Props {
  visit: Visit;
  onPress: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatApt(apt: Visit['apartment']): string {
  return `Apt ${apt.identifier} · Bloco ${apt.block} · ${apt.floor}º Andar`;
}

export function VisitCard({ visit, onPress }: Props) {
  const statusColor = VisitStatusConfig[visit.status]?.color ?? Colors.pend;
  const isReinspection = visit.type === 'REINSPECTION';

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
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <VisitStatusBadge status={visit.status} />
          {isReinspection && (
            <View style={{ backgroundColor: Colors.amberDim, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: Colors.amber, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.72 }}>
                RE-INSPEÇÃO
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            color: Colors.t3,
            fontSize: 12,
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
          fontSize: 15,
          fontFamily: 'IBMPlexSans_600SemiBold',
          marginBottom: 3,
        }}
      >
        {visit.apartment.building.name}
      </Text>
      <Text
        style={{
          color: Colors.t2,
          fontSize: 13,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      >
        {formatApt(visit.apartment)}
      </Text>
    </Pressable>
  );
}
