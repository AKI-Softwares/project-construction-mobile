import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spinner } from '@/components/ui';
import { ItemRow } from '@/components/visits/ItemRow';
import { EvaluationSheet } from '@/components/visits/EvaluationSheet';
import { useVisitDetail } from '@/hooks/useVisitDetail';
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

          <Text style={{ color: Colors.t3, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 1.08, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 }}>
            ITENS
          </Text>

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
