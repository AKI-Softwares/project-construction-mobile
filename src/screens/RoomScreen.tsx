import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { Spinner, Button } from '@/components/ui';
import { AppHeader } from '@/components/ui/AppHeader';
import { ItemRow } from '@/components/visits/ItemRow';
import { EvaluationSheet } from '@/components/visits/EvaluationSheet';
import { useVisitDetail } from '@/hooks/useVisitDetail';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';
import { showToast } from '@/lib/toast';
import type { VisitItem } from '@/types/visit.types';

interface Props {
  visitId: number;
  roomId: number;
}

export function RoomScreen({ visitId, roomId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: visit, isLoading, isError, refetch } = useVisitDetail(visitId);
  const [selectedItem, setSelectedItem] = useState<VisitItem | null>(null);

  const handleItemPress = useCallback((item: VisitItem) => {
    refetch();
    setSelectedItem(item);
  }, [refetch]);
  const handleSheetClose = useCallback(() => setSelectedItem(null), []);

  const queryClient = useQueryClient();
  const [markingAll, setMarkingAll] = useState(false);

  const pendingItems = visit?.rooms.find((r) => r.id === roomId)?.items.filter((i) => i.status === null) ?? [];

  const handleMarkAllOk = async () => {
    if (pendingItems.length === 0) return;
    setMarkingAll(true);
    try {
      for (const item of pendingItems) {
        await visitsService.evaluateItem(visitId, item.id, 'OK');
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Todos os itens marcados como OK');
    } catch {
      showToast('error', 'Erro ao marcar itens');
    } finally {
      setMarkingAll(false);
    }
  };

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !visit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
            Erro ao carregar cômodo
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text style={{ color: colors.t1, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.88, textTransform: 'uppercase' }}>
              TENTAR NOVAMENTE
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const room = visit.rooms.find((r) => r.id === roomId);

  if (!room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
            Cômodo não encontrado
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text style={{ color: colors.t1, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.88, textTransform: 'uppercase' }}>
              VOLTAR
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFinalized = visit.status === 'FINALIZED';
  const evaluated = room.items.filter((i) => i.status !== null).length;
  const total = room.items.length;

  const isOngoing = visit.status === 'ONGOING';
  const allEvaluated = room.items.length > 0 && room.items.every((i) => i.status !== null);
  const roomIndex = visit.rooms.findIndex((r) => r.id === roomId);
  const nextRoom = visit.rooms[roomIndex + 1] ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AppHeader title={room?.name ?? 'Cômodo'} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
            <Text style={{ color: colors.t1, fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', marginBottom: 4 }}>
              {room.name}
            </Text>
            <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
              {evaluated} de {total} itens avaliados
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 }}>
            <Text style={{ color: colors.t3, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 1.08, textTransform: 'uppercase' }}>
              ITENS
            </Text>
            {!isFinalized && pendingItems.length > 0 && (
              <Pressable
                onPress={handleMarkAllOk}
                disabled={markingAll}
                hitSlop={8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: markingAll ? 0.5 : 1 }}
              >
                {markingAll ? (
                  <ActivityIndicator size="small" color={colors.ok} />
                ) : (
                  <Text style={{ color: colors.ok, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.72 }}>
                    ✓ TODOS OK
                  </Text>
                )}
              </Pressable>
            )}
          </View>

          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 10,
            marginHorizontal: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {room.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onPress={
                  !isFinalized || item.status === 'NOK'
                    ? () => handleItemPress(item)
                    : undefined
                }
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {isOngoing && allEvaluated && (
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <Button
            label={nextRoom ? `PRÓXIMO CÔMODO → ${nextRoom.name}` : '← VOLTAR À VISTORIA'}
            onPress={() => {
              if (nextRoom) {
                router.replace(`/(app)/visits/${visitId}/rooms/${nextRoom.id}` as any);
              } else {
                router.back();
              }
            }}
            fullWidth
          />
        </View>
      )}

      <EvaluationSheet
        item={selectedItem}
        visitId={visitId}
        onClose={handleSheetClose}
        isFinalized={isFinalized}
      />
    </View>
  );
}
