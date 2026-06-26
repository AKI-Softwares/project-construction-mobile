import { memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VisitStatusConfig } from '@/theme/colors';
import { useTheme } from '@/hooks/useTheme';
import type { VisitDetail } from '@/types/visit.types';

interface Props { visit: VisitDetail; }

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const VisitHeader = memo(function VisitHeader({ visit }: Props) {
  const { colors } = useTheme();
  const { apartment } = visit;
  const cfg = VisitStatusConfig[visit.status] ?? VisitStatusConfig.NOT_STARTED;
  const overdue = visit.status !== 'FINALIZED' && !!visit.scheduledFor && new Date(visit.scheduledFor) < new Date();

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text
          style={{ color: colors.t1, fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', flex: 1, marginRight: 12 }}
          numberOfLines={2}
        >
          {apartment.building.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name={cfg.icon} size={14} color={cfg.color} />
          <Text style={{ color: cfg.color, fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold' }}>
            {cfg.label}
          </Text>
        </View>
      </View>
      <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', marginBottom: 2 }}>
        {`Apt ${apartment.identifier} · Bloco ${apartment.block} · ${apartment.floor}º andar`}
      </Text>
      <Text style={{ color: colors.t3, fontSize: 11, fontFamily: 'IBMPlexMono_400Regular' }}>
        {formatDate(visit.createdAt)}
      </Text>
      {visit.scheduledFor && (
        <Text style={{ color: overdue ? colors.nc : colors.t2, fontSize: 11, fontFamily: 'IBMPlexMono_400Regular', marginTop: 4 }}>
          {overdue ? '⚠ Em atraso · ' : 'Prevista: '}
          {formatDate(visit.scheduledFor)}
        </Text>
      )}
    </View>
  );
});
