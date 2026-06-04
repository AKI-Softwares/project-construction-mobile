import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { Spinner } from '@/components/ui';
import { VisitCard } from '@/components/visits';
import { useMyVisits } from '@/hooks/useMyVisits';
import { useAuthStore } from '@/store/auth.store';
import type { VisitStatus } from '@/types/visit.types';

type FilterKey = 'all' | VisitStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'TODAS' },
  { key: 'NOT_STARTED', label: 'PENDENTES' },
  { key: 'ONGOING', label: 'EM ANDAMENTO' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getEmptyMessage(filter: FilterKey): string {
  if (filter === 'NOT_STARTED') return 'Nenhuma vistoria pendente';
  if (filter === 'ONGOING') return 'Nenhuma vistoria em andamento';
  return 'Nenhuma vistoria atribuída';
}

export function VisitListScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const { data: visits = [], isLoading, isError, isFetching, refetch } = useMyVisits();

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return visits;
    return visits.filter((v) => v.status === activeFilter);
  }, [visits, activeFilter]);

  if (isLoading) return <Spinner fullScreen />;

  return (
    <SafeAreaView className="flex-1 bg-bg1">
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={{ color: Colors.t1, fontSize: 20, fontFamily: 'IBMPlexSans_700Bold' }}
          >
            Check
          </Text>
          <Text
            style={{ color: Colors.amber, fontSize: 20, fontFamily: 'IBMPlexSans_700Bold' }}
          >
            Obra
          </Text>
        </View>
        <Text
          style={{
            color: Colors.t3,
            fontSize: 9,
            fontFamily: 'IBMPlexMono_400Regular',
            letterSpacing: 1.08,
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          ◆ VISTORIA TÉCNICA
        </Text>
        {user && (
          <Text
            style={{
              color: Colors.t2,
              fontSize: 12,
              fontFamily: 'IBMPlexSans_400Regular',
              marginTop: 8,
            }}
          >
            {getGreeting()}, {user.name}
          </Text>
        )}
      </View>

      {/* Filter chips */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: active ? Colors.amber : Colors.border,
                backgroundColor: active ? Colors.amber : 'transparent',
              }}
            >
              <Text
                style={{
                  color: active ? '#0F1520' : Colors.t3,
                  fontSize: 9,
                  fontFamily: 'IBMPlexMono_600SemiBold',
                  letterSpacing: 0.72,
                  textTransform: 'uppercase',
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Error state */}
      {isError && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
          <Text
            style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}
          >
            Erro ao carregar vistorias
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
      )}

      {/* Visit list */}
      {!isError && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 }}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <VisitCard
              visit={item}
              onPress={() => router.push(`/(app)/visits/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 60,
              }}
            >
              <Text
                style={{
                  color: Colors.t3,
                  fontSize: 24,
                  fontFamily: 'IBMPlexMono_400Regular',
                  marginBottom: 8,
                }}
              >
                ○
              </Text>
              <Text
                style={{
                  color: Colors.t3,
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
                  color: Colors.t3,
                  fontSize: 12,
                  fontFamily: 'IBMPlexSans_400Regular',
                }}
              >
                {getEmptyMessage(activeFilter)}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
