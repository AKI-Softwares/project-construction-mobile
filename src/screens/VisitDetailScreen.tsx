import { useCallback } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spinner, Button, ProgressBar } from '@/components/ui';
import { VisitHeader } from '@/components/visits/VisitHeader';
import { RoomCard } from '@/components/visits/RoomCard';
import { useVisitDetail } from '@/hooks/useVisitDetail';
import { useStartVisit } from '@/hooks/useStartVisit';

interface Props {
  id: number;
}

export function VisitDetailScreen({ id }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: visit, isLoading, isError, refetch } = useVisitDetail(id);
  const { mutate: startVisit, isPending } = useStartVisit(id);

  const handleStart = useCallback(() => startVisit(), [startVisit]);

  const handleRoomPress = useCallback(
    (roomId: number) => router.push(`/(app)/visits/${id}/rooms/${roomId}` as any),
    [id, router],
  );

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !visit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text
            style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}
          >
            Erro ao carregar vistoria
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 6,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                color: Colors.t1,
                fontSize: 11,
                fontFamily: 'IBMPlexMono_600SemiBold',
                letterSpacing: 0.88,
                textTransform: 'uppercase',
              }}
            >
              TENTAR NOVAMENTE
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isOngoing = visit.status === 'ONGOING';
  const isNotStarted = visit.status === 'NOT_STARTED';
  const completed = visit.rooms.filter((r) => r.isComplete).length;
  const total = visit.rooms.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }} edges={['top']}>
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}
        hitSlop={8}
      >
        <Text
          style={{
            color: Colors.amber,
            fontSize: 13,
            fontFamily: 'IBMPlexMono_600SemiBold',
            letterSpacing: 0.6,
          }}
        >
          ← VOLTAR
        </Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingBottom: isNotStarted ? 0 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        <VisitHeader visit={visit} />

        {/* Progress bar — só ONGOING */}
        {isOngoing && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text
              style={{
                color: Colors.t2,
                fontSize: 12,
                fontFamily: 'IBMPlexMono_400Regular',
                marginBottom: 8,
              }}
            >
              {completed} de {total} ambientes concluídos
            </Text>
            <ProgressBar value={total > 0 ? completed / total : 0} />
          </View>
        )}

        {/* Label de seção */}
        <Text
          style={{
            color: Colors.t3,
            fontSize: 9,
            fontFamily: 'IBMPlexMono_600SemiBold',
            letterSpacing: 1.08,
            textTransform: 'uppercase',
            paddingHorizontal: 20,
            marginBottom: 8,
          }}
        >
          AMBIENTES
        </Text>

        {/* Lista de cômodos */}
        <View style={{ paddingHorizontal: 20 }}>
          {visit.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onPress={isOngoing ? () => handleRoomPress(room.id) : undefined}
            />
          ))}
        </View>
      </ScrollView>

      {/* Botão fixo — só NOT_STARTED */}
      {isNotStarted && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          }}
        >
          <Button
            label="INICIAR VISTORIA"
            onPress={handleStart}
            loading={isPending}
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}
