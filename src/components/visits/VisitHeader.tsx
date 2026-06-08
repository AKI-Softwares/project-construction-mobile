import { memo } from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/theme/colors';
import { VisitStatusBadge } from './VisitStatusBadge';
import type { VisitDetail } from '@/types/visit.types';

interface Props {
  visit: VisitDetail;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const VisitHeader = memo(function VisitHeader({ visit }: Props) {
  const { apartment } = visit;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            color: Colors.t1,
            fontSize: 18,
            fontFamily: 'IBMPlexSans_600SemiBold',
            flex: 1,
            marginRight: 12,
          }}
          numberOfLines={2}
        >
          {apartment.building.name}
        </Text>
        <VisitStatusBadge status={visit.status} />
      </View>
      <Text
        style={{
          color: Colors.t2,
          fontSize: 13,
          fontFamily: 'IBMPlexMono_400Regular',
          marginBottom: 4,
        }}
      >
        {`Apt ${apartment.identifier} · Bloco ${apartment.block} · ${apartment.floor}º andar`}
      </Text>
      <Text
        style={{
          color: Colors.t3,
          fontSize: 11,
          fontFamily: 'IBMPlexMono_400Regular',
          letterSpacing: 0.6,
        }}
      >
        {formatDate(visit.createdAt)}
      </Text>
    </View>
  );
});
