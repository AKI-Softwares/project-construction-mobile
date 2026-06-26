import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VisitStatusConfig } from '@/theme/colors';
import { useTheme } from '@/hooks/useTheme';
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

function isOverdue(scheduledFor: string | null, status: Visit['status']): boolean {
  if (!scheduledFor || status === 'FINALIZED') return false;
  return new Date(scheduledFor) < new Date();
}

export function VisitCard({ visit, onPress }: Props) {
  const { colors } = useTheme();
  const cfg = VisitStatusConfig[visit.status] ?? VisitStatusConfig.NOT_STARTED;
  const isReinspection = visit.type === 'REINSPECTION';
  const overdue = isOverdue(visit.scheduledFor, visit.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.surfacePressed : colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderLeftColor: cfg.color,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name={cfg.icon} size={16} color={cfg.color} />
          <Text style={{ color: cfg.color, fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold' }}>
            {cfg.label}
          </Text>
          {isReinspection && (
            <View style={{ backgroundColor: colors.tealDim, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: colors.teal, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold' }}>
                RE-INSPEÇÃO
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: colors.t3, fontSize: 12, fontFamily: 'IBMPlexMono_400Regular' }}>
          {formatDate(visit.createdAt)}
        </Text>
      </View>
      <Text style={{ color: colors.t1, fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', marginBottom: 3 }}>
        {visit.apartment.building.name}
      </Text>
      <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
        {`Apt ${visit.apartment.identifier} · Bloco ${visit.apartment.block} · ${visit.apartment.floor}º andar`}
      </Text>
      {visit.scheduledFor && (
        <Text style={{ color: overdue ? colors.nc : colors.t3, fontSize: 11, fontFamily: 'IBMPlexMono_400Regular', marginTop: 6 }}>
          {overdue ? '⚠ Em atraso · ' : 'Prevista: '}
          {formatDate(visit.scheduledFor)}
        </Text>
      )}
    </Pressable>
  );
}
