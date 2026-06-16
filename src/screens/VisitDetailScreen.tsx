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
import { useFinalizeVisit } from '@/hooks/useFinalizeVisit';
import { useClaimReinspection } from '@/hooks/useClaimReinspection';

interface Props {
  id: number;
}

export function VisitDetailScreen({ id }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: visit, isLoading, isError, refetch } = useVisitDetail(id);
  const { mutate: startVisit, isPending: isStartPending } = useStartVisit(id);
  const { mutate: finalizeVisit, isPending: isFinalizePending } = useFinalizeVisit(id);
  const { mutate: claimReinspection, isPending: isClaimPending } = useClaimReinspection(id);

  const handleStart = useCallback(() => startVisit(), [startVisit]);
  const handleFinalize = useCallback(() => finalizeVisit(), [finalizeVisit]);
  const handleClaim = useCallback(() => claimReinspection(), [claimReinspection]);

  const handleRoomPress = useCallback(
    (roomId: number) => router.push(`/(app)/visits/${id}/rooms/${roomId}` as any),
    [id, router],
  );

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !visit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
            Erro ao carregar vistoria
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text style={{ color: Colors.t1, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.88, textTransform: 'uppercase' }}>
              TENTAR NOVAMENTE
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isNotStarted = visit.status === 'NOT_STARTED';
  const isOngoing = visit.status === 'ONGOING';
  const isFinalized = visit.status === 'FINALIZED';
  const isReinspection = visit.type === 'REINSPECTION';
  const isAvailable = isReinspection && visit.inspector === null;

  const completed = visit.rooms.filter((r) => r.isComplete).length;
  const total = visit.rooms.length;

  const allEvaluated = visit.rooms
    .flatMap((r) => r.items)
    .every((i) => i.status !== null);

  const showBottomBar = isAvailable || isNotStarted || isOngoing;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }} edges={['top']}>
      <Pressable
        onPress={() => router.back()}
        style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}
        hitSlop={8}
      >
        <Text style={{ color: Colors.amber, fontSize: 13, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.6 }}>
          ← VOLTAR
        </Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingBottom: showBottomBar ? 0 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        <VisitHeader visit={visit} />

        {isReinspection && (
          <View style={{ marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.amberDim, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 }}>
            <Text style={{ color: Colors.amber, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.72 }}>
              ◆ RE-INSPEÇÃO
            </Text>
            <Text style={{ color: Colors.t2, fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', flex: 1 }}>
              {isAvailable ? 'Disponível para assumir' : `Itens com NC da vistoria anterior`}
            </Text>
          </View>
        )}

        {(isOngoing || isFinalized) && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: Colors.t2, fontSize: 12, fontFamily: 'IBMPlexMono_400Regular', marginBottom: 8 }}>
              {completed} de {total} ambientes concluídos
            </Text>
            <ProgressBar value={total > 0 ? completed / total : 0} />
          </View>
        )}

        <Text style={{ color: Colors.t3, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 1.08, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 }}>
          AMBIENTES
        </Text>

        <View style={{ paddingHorizontal: 20 }}>
          {visit.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onPress={!isAvailable && (isOngoing || isFinalized) ? () => handleRoomPress(room.id) : undefined}
            />
          ))}
        </View>
      </ScrollView>

      {isAvailable && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: Colors.border }}>
          <Button
            label="ASSUMIR RE-INSPEÇÃO"
            onPress={handleClaim}
            loading={isClaimPending}
            fullWidth
          />
        </View>
      )}

      {!isAvailable && isNotStarted && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: Colors.border }}>
          <Button
            label={isReinspection ? 'INICIAR RE-INSPEÇÃO' : 'INICIAR VISTORIA'}
            onPress={handleStart}
            loading={isStartPending}
            fullWidth
          />
        </View>
      )}

      {isOngoing && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: Colors.border }}>
          <Button
            label={isReinspection ? 'FINALIZAR RE-INSPEÇÃO' : 'FINALIZAR VISTORIA'}
            onPress={handleFinalize}
            loading={isFinalizePending}
            disabled={!allEvaluated}
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}
