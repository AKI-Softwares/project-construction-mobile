import { useMemo, useState, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { NavColors } from '@/theme/colors';
import { Spinner, Button } from '@/components/ui';
import { VisitCard } from '@/components/visits';
import { useMyVisits } from '@/hooks/useMyVisits';
import { useMyFinalizedVisits } from '@/hooks/useMyFinalizedVisits';
import { useAvailableReinspections } from '@/hooks/useAvailableReinspections';
import { useAuthStore } from '@/store/auth.store';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';
import type { VisitStatus } from '@/types/visit.types';

type FilterKey = 'all' | VisitStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'TODAS' },
  { key: 'NOT_STARTED', label: 'PENDENTES' },
  { key: 'ONGOING', label: 'EM ANDAMENTO' },
  { key: 'FINALIZED', label: 'FINALIZADAS' },
];

function getEmptyMessage(filter: FilterKey): string {
  if (filter === 'NOT_STARTED') return 'Nenhuma vistoria pendente';
  if (filter === 'ONGOING') return 'Nenhuma vistoria em andamento';
  if (filter === 'FINALIZED') return 'Nenhuma vistoria finalizada';
  return 'Nenhuma vistoria atribuída';
}

export function VisitListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();

  const handleVisitPress = useCallback((id: number) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.VISIT_DETAIL(id),
      queryFn: () => visitsService.getVisitById(id),
      staleTime: 30_000,
    });
    router.push(`/(app)/visits/${String(id)}` as any);
  }, [queryClient, router]);
  const user = useAuthStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const { data: visits = [], isLoading, isError, isFetching, refetch } = useMyVisits();
  const {
    data: finalizedVisits = [],
    isLoading: isLoadingFinalized,
    isFetching: isFetchingFinalized,
    refetch: refetchFinalized,
  } = useMyFinalizedVisits(activeFilter === 'FINALIZED' || activeFilter === 'all');
  const { data: availableReinspections = [] } = useAvailableReinspections();

  const filtered = useMemo(() => {
    if (activeFilter === 'FINALIZED') return finalizedVisits;
    if (activeFilter === 'all') return [...visits, ...finalizedVisits];
    return visits.filter((v) => v.status === activeFilter);
  }, [visits, finalizedVisits, activeFilter]);

  const showingFinalized = activeFilter === 'FINALIZED' || activeFilter === 'all';
  if (isLoading || (showingFinalized && isLoadingFinalized)) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header — dark navy fixo */}
      <View style={{ backgroundColor: NavColors.navBg, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ color: NavColors.teal, fontSize: 24, fontFamily: 'IBMPlexSans_700Bold' }}>Check</Text>
          <Text style={{ color: NavColors.tNav, fontSize: 24, fontFamily: 'IBMPlexSans_700Bold' }}>Obra</Text>
        </View>
        <Text style={{ color: NavColors.teal, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', marginTop: 2 }}>
          Vistoria técnica{user ? ` — Olá, ${user.name.split(' ')[0]}!` : ''}
        </Text>
      </View>

      {/* Filter chips */}
      <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: active ? colors.teal : colors.border,
                  backgroundColor: active ? colors.tealDim : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: active ? colors.teal : colors.t2,
                    fontSize: 12,
                    fontFamily: 'IBMPlexSans_600SemiBold',
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Error state */}
      {isError && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
          <Text
            style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}
          >
            Erro ao carregar vistorias
          </Text>
          <Button label="TENTAR NOVAMENTE" onPress={() => refetch()} variant="outline" />
        </View>
      )}

      {/* Visit list */}
      {!isError && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 }}
          refreshing={(isFetching && !isLoading) || (showingFinalized && isFetchingFinalized && !isLoadingFinalized)}
          onRefresh={() => { refetch(); if (showingFinalized) refetchFinalized(); }}
          renderItem={({ item }) => (
            <VisitCard
              visit={item}
              onPress={() => handleVisitPress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 60,
              }}
            >
              <Text
                style={{
                  color: colors.t3,
                  fontSize: 24,
                  fontFamily: 'IBMPlexMono_400Regular',
                  marginBottom: 8,
                }}
              >
                ○
              </Text>
              <Text
                style={{
                  color: colors.t3,
                  fontSize: 10,
                  fontFamily: 'IBMPlexMono_600SemiBold',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                NENHUMA VISTORIA
              </Text>
              <Text
                style={{
                  color: colors.t3,
                  fontSize: 12,
                  fontFamily: 'IBMPlexSans_400Regular',
                }}
              >
                {getEmptyMessage(activeFilter)}
              </Text>
            </View>
          }
          ListFooterComponent={
            availableReinspections.length > 0 ? (
              <View style={{ marginTop: 24 }}>
                <Text
                  style={{
                    color: colors.t3,
                    fontSize: 9,
                    fontFamily: 'IBMPlexMono_600SemiBold',
                    letterSpacing: 1.08,
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  RE-INSPEÇÕES DISPONÍVEIS
                </Text>
                {availableReinspections.map((item) => (
                  <VisitCard
                    key={item.id}
                    visit={item}
                    onPress={() => handleVisitPress(item.id)}
                  />
                ))}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
