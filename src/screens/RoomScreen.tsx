import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/theme/colors';
import { Spinner } from '@/components/ui';
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

  const handleMarkAllOk = useCallback(async () => {
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
  }, [pendingItems, visitId, queryClient]);

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !visit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
            Erro ao carregar cômodo
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

  const room = visit.rooms.find((r) => r.id === roomId);

  if (!room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
            Cômodo não encontrado
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <Text style={{ color: Colors.t1, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.88, textTransform: 'uppercase' }}>
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

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}
          hitSlop={8}
        >
          <Text style={{ color: Colors.amber, fontSize: 13, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.6 }}>
            ← VOLTAR
          </Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
            <Text style={{ color: Colors.t1, fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', marginBottom: 4 }}>
              {room.name}
            </Text>
            <Text style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
              {evaluated} de {total} itens avaliados
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 }}>
            <Text style={{ color: Colors.t3, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 1.08, textTransform: 'uppercase' }}>
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
                  <ActivityIndicator size="small" color={Colors.ok} />
                ) : (
                  <Text style={{ color: Colors.ok, fontSize: 10, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 0.72 }}>
                    ✓ TODOS OK
                  </Text>
                )}
              </Pressable>
            )}
          </View>

          <View style={{ backgroundColor: Colors.bg2, borderRadius: 6, marginHorizontal: 20, overflow: 'hidden' }}>
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

      <EvaluationSheet
        item={selectedItem}
        visitId={visitId}
        onClose={handleSheetClose}
        isFinalized={isFinalized}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg1 },
  safeArea: { flex: 1 },
});
