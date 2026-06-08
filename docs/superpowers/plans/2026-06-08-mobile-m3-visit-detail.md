# M-3 — VisitDetailScreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar VisitDetailScreen com preview de cômodos para NOT_STARTED (+ botão iniciar) e cômodos navegáveis com progress bar para ONGOING.

**Architecture:** Tela única com estado condicional por `status` da visita. Tipos `VisitDetail`/`Room`/`VisitItem` estendem os existentes. Hooks `useVisitDetail` (query, staleTime 0) e `useStartVisit` (mutation com invalidação dupla). Componentes `ProgressBar`, `VisitHeader`, `RoomCard` todos com `React.memo`.

**Tech Stack:** Expo SDK 54, Expo Router v6, NativeWind v4, React Query v5, TypeScript strict, axios-mock-adapter (testes), @testing-library/react-native

---

## File Map

| Arquivo | Ação |
|---|---|
| `src/types/visit.types.ts` | Modificar — adiciona `NonConformity`, `VisitItem`, `Room`, `Inspector`, `VisitDetail` |
| `src/services/visits.service.ts` | Modificar — adiciona `getVisitById`, `startVisit` |
| `src/hooks/useVisitDetail.ts` | Criar — React Query hook |
| `src/hooks/useStartVisit.ts` | Criar — mutation hook |
| `src/components/ui/ProgressBar.tsx` | Criar — componente reutilizável |
| `src/components/ui/index.ts` | Modificar — exporta ProgressBar |
| `src/components/visits/VisitHeader.tsx` | Criar — header memo'd |
| `src/components/visits/RoomCard.tsx` | Criar — card de cômodo memo'd |
| `src/screens/VisitDetailScreen.tsx` | Criar — tela principal |
| `app/(app)/visits/[id]/index.tsx` | Modificar — substitui placeholder |
| `__tests__/services/visits.service.test.ts` | Modificar — adiciona testes para novos métodos |
| `__tests__/hooks/useVisitDetail.test.ts` | Criar — testes do hook |
| `__tests__/hooks/useStartVisit.test.ts` | Criar — testes da mutation |

---

### Task 1: Tipos — VisitDetail, Room, VisitItem

**Files:**
- Modify: `src/types/visit.types.ts`

- [ ] **Substituir conteúdo completo do arquivo com os tipos novos adicionados**

`src/types/visit.types.ts`:

```ts
export type VisitStatus = 'NOT_STARTED' | 'ONGOING' | 'FINALIZED';

export interface Building {
  name: string;
}

export interface Apartment {
  identifier: string;
  floor: number;
  block: string;
  building: Building;
}

export interface Visit {
  id: number;
  status: VisitStatus;
  createdAt: string;
  apartment: Apartment;
}

export interface NonConformity {
  id: number;
  description: string;
}

export interface VisitItem {
  id: number;
  serviceId: number;
  serviceName: string;
  status: 'OK' | 'NOK' | null;
  nonConformity: NonConformity | null;
}

export interface Room {
  id: number;
  name: string;
  isComplete: boolean;
  items: VisitItem[];
}

export interface Inspector {
  id: number;
  name: string;
}

export interface VisitDetail extends Visit {
  checklistId: number;
  observations: string | null;
  finalizedAt: string | null;
  inspector: Inspector;
  rooms: Room[];
}
```

- [ ] **Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Commit**

```bash
git add src/types/visit.types.ts
git commit -m "feat(types): add VisitDetail, Room, VisitItem, Inspector types"
```

---

### Task 2: Serviço — getVisitById + startVisit

**Files:**
- Modify: `src/services/visits.service.ts`
- Modify: `__tests__/services/visits.service.test.ts`

- [ ] **Escrever testes — substituir conteúdo completo do arquivo de teste**

`__tests__/services/visits.service.test.ts`:

```ts
import MockAdapter from 'axios-mock-adapter';
import { api } from '../../src/services/api';
import { visitsService } from '../../src/services/visits.service';
import type { VisitDetail } from '../../src/types/visit.types';

const mock = new MockAdapter(api);

const mockVisit = {
  id: 1,
  status: 'NOT_STARTED' as const,
  createdAt: '2026-06-04T10:00:00Z',
  apartment: {
    identifier: '101',
    floor: 1,
    block: 'A',
    building: { name: 'Residencial Aurora' },
  },
};

const mockVisitDetail: VisitDetail = {
  ...mockVisit,
  checklistId: 3,
  observations: null,
  finalizedAt: null,
  inspector: { id: 2, name: 'João' },
  rooms: [
    {
      id: 5,
      name: 'Sala',
      isComplete: false,
      items: [
        { id: 10, serviceId: 3, serviceName: 'Pintura', status: 'NOK', nonConformity: { id: 1, description: 'Risco na parede' } },
        { id: 11, serviceId: 4, serviceName: 'Rejunte', status: null, nonConformity: null },
      ],
    },
  ],
};

describe('visitsService', () => {
  afterEach(() => mock.reset());

  describe('getMyVisits', () => {
    it('retorna array de visitas', async () => {
      mock.onGet('/visits/mine').reply(200, [mockVisit]);
      const result = await visitsService.getMyVisits('NOT_STARTED,ONGOING');
      expect(result).toEqual([mockVisit]);
    });

    it('retorna array vazio quando não há visitas', async () => {
      mock.onGet('/visits/mine').reply(200, []);
      const result = await visitsService.getMyVisits('NOT_STARTED,ONGOING');
      expect(result).toEqual([]);
    });

    it('rejeita promise em erro de rede', async () => {
      mock.onGet('/visits/mine').networkError();
      await expect(visitsService.getMyVisits('NOT_STARTED,ONGOING')).rejects.toThrow();
    });
  });

  describe('getVisitById', () => {
    it('retorna VisitDetail por id', async () => {
      mock.onGet('/visits/1').reply(200, mockVisitDetail);
      const result = await visitsService.getVisitById(1);
      expect(result).toEqual(mockVisitDetail);
    });

    it('rejeita em 404', async () => {
      mock.onGet('/visits/99').reply(404);
      await expect(visitsService.getVisitById(99)).rejects.toThrow();
    });

    it('rejeita em erro de rede', async () => {
      mock.onGet('/visits/1').networkError();
      await expect(visitsService.getVisitById(1)).rejects.toThrow();
    });
  });

  describe('startVisit', () => {
    it('retorna visit com status ONGOING', async () => {
      const started = { ...mockVisit, status: 'ONGOING' as const };
      mock.onPatch('/visits/1/start').reply(200, started);
      const result = await visitsService.startVisit(1);
      expect(result.status).toBe('ONGOING');
    });

    it('rejeita em 409 (visita já iniciada)', async () => {
      mock.onPatch('/visits/1/start').reply(409);
      await expect(visitsService.startVisit(1)).rejects.toThrow();
    });
  });
});
```

- [ ] **Rodar testes — deve falhar nos novos describes**

```bash
npx jest __tests__/services/visits.service.test.ts --no-coverage
```

Expected: FAIL — `visitsService.getVisitById is not a function`

- [ ] **Implementar os dois métodos novos**

`src/services/visits.service.ts`:

```ts
import { api } from './api';
import type { Visit, VisitDetail } from '@/types/visit.types';

type StatusFilter = string & { readonly __brand: 'StatusFilter' };
export const ACTIVE_VISITS_FILTER = 'NOT_STARTED,ONGOING' as StatusFilter;

export const visitsService = {
  getMyVisits: (status?: StatusFilter): Promise<Visit[]> =>
    api.get<Visit[]>('/visits/mine', status ? { params: { status } } : undefined)
      .then((r) => r.data),

  getVisitById: (id: number): Promise<VisitDetail> =>
    api.get<VisitDetail>(`/visits/${id}`).then((r) => r.data),

  startVisit: (id: number): Promise<Visit> =>
    api.patch<Visit>(`/visits/${id}/start`).then((r) => r.data),
};
```

- [ ] **Rodar testes — deve passar**

```bash
npx jest __tests__/services/visits.service.test.ts --no-coverage
```

Expected: PASS (8 testes)

- [ ] **Commit**

```bash
git add src/services/visits.service.ts __tests__/services/visits.service.test.ts
git commit -m "feat(visits): add getVisitById and startVisit service methods"
```

---

### Task 3: Hook — useVisitDetail

**Files:**
- Create: `src/hooks/useVisitDetail.ts`
- Create: `__tests__/hooks/useVisitDetail.test.ts`

- [ ] **Criar arquivo de testes**

`__tests__/hooks/useVisitDetail.test.ts`:

```ts
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVisitDetail } from '../../src/hooks/useVisitDetail';
import { visitsService } from '../../src/services/visits.service';
import type { VisitDetail } from '../../src/types/visit.types';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockVisitDetail: VisitDetail = {
  id: 7,
  checklistId: 3,
  status: 'ONGOING',
  observations: null,
  finalizedAt: null,
  createdAt: '2026-06-01T10:00:00Z',
  inspector: { id: 2, name: 'João' },
  apartment: { identifier: '101', floor: 1, block: 'A', building: { name: 'Residencial Aurora' } },
  rooms: [
    { id: 5, name: 'Sala', isComplete: false, items: [] },
    { id: 6, name: 'Quarto 1', isComplete: true, items: [] },
  ],
};

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useVisitDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('estado loading inicial', () => {
    mockedService.getVisitById.mockResolvedValueOnce(mockVisitDetail);
    const { result } = renderHook(() => useVisitDetail(7), { wrapper: makeWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('retorna VisitDetail com sucesso', async () => {
    mockedService.getVisitById.mockResolvedValueOnce(mockVisitDetail);
    const { result } = renderHook(() => useVisitDetail(7), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockVisitDetail);
    expect(mockedService.getVisitById).toHaveBeenCalledWith(7);
  });

  it('estado de erro em falha', async () => {
    mockedService.getVisitById.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useVisitDetail(7), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

- [ ] **Rodar testes — deve falhar**

```bash
npx jest __tests__/hooks/useVisitDetail.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../src/hooks/useVisitDetail'`

- [ ] **Criar o hook**

`src/hooks/useVisitDetail.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useVisitDetail(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.VISIT_DETAIL(id),
    queryFn: () => visitsService.getVisitById(id),
    staleTime: 0,
  });
}
```

- [ ] **Rodar testes — deve passar**

```bash
npx jest __tests__/hooks/useVisitDetail.test.ts --no-coverage
```

Expected: PASS (3 testes)

- [ ] **Commit**

```bash
git add src/hooks/useVisitDetail.ts __tests__/hooks/useVisitDetail.test.ts
git commit -m "feat(hooks): add useVisitDetail query hook"
```

---

### Task 4: Hook — useStartVisit

**Files:**
- Create: `src/hooks/useStartVisit.ts`
- Create: `__tests__/hooks/useStartVisit.test.ts`

- [ ] **Criar arquivo de testes**

`__tests__/hooks/useStartVisit.test.ts`:

```ts
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStartVisit } from '../../src/hooks/useStartVisit';
import { visitsService } from '../../src/services/visits.service';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockVisit = {
  id: 1,
  status: 'ONGOING' as const,
  createdAt: '2026-06-04T10:00:00Z',
  apartment: { identifier: '101', floor: 1, block: 'A', building: { name: 'Residencial Aurora' } },
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useStartVisit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama startVisit com id correto', async () => {
    mockedService.startVisit.mockResolvedValueOnce(mockVisit);
    const { result } = renderHook(() => useStartVisit(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate(); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.startVisit).toHaveBeenCalledWith(1);
  });

  it('expõe isError em falha da mutation', async () => {
    mockedService.startVisit.mockRejectedValueOnce(new Error('Conflict'));
    const { result } = renderHook(() => useStartVisit(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate(); });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

- [ ] **Rodar testes — deve falhar**

```bash
npx jest __tests__/hooks/useStartVisit.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../src/hooks/useStartVisit'`

- [ ] **Criar o hook**

`src/hooks/useStartVisit.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';

export function useStartVisit(visitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => visitsService.startVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
    },
  });
}
```

- [ ] **Rodar testes — deve passar**

```bash
npx jest __tests__/hooks/useStartVisit.test.ts --no-coverage
```

Expected: PASS (2 testes)

- [ ] **Rodar suite completa**

```bash
npx jest --no-coverage
```

Expected: PASS (16+ testes — todos os anteriores + 5 novos)

- [ ] **Commit**

```bash
git add src/hooks/useStartVisit.ts __tests__/hooks/useStartVisit.test.ts
git commit -m "feat(hooks): add useStartVisit mutation hook"
```

---

### Task 5: Componente — ProgressBar

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Criar o componente**

`src/components/ui/ProgressBar.tsx`:

```tsx
import { memo } from 'react';
import { View } from 'react-native';
import { Colors } from '@/theme/colors';

interface Props {
  value: number; // 0–1
}

export const ProgressBar = memo(function ProgressBar({ value }: Props) {
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View
      style={{
        height: 4,
        borderRadius: 99,
        backgroundColor: Colors.bg4,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          backgroundColor: Colors.amber,
          borderRadius: 99,
        }}
      />
    </View>
  );
});
```

- [ ] **Adicionar ProgressBar ao barrel export**

`src/components/ui/index.ts`:

```ts
export { Button } from './Button';
export { Input } from './Input';
export { Spinner } from './Spinner';
export { Badge } from './Badge';
export { ProgressBar } from './ProgressBar';
```

- [ ] **Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Commit**

```bash
git add src/components/ui/ProgressBar.tsx src/components/ui/index.ts
git commit -m "feat(ui): add ProgressBar component"
```

---

### Task 6: Componente — VisitHeader

**Files:**
- Create: `src/components/visits/VisitHeader.tsx`

- [ ] **Criar o componente**

`src/components/visits/VisitHeader.tsx`:

```tsx
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
```

- [ ] **Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Commit**

```bash
git add src/components/visits/VisitHeader.tsx
git commit -m "feat(visits): add VisitHeader component"
```

---

### Task 7: Componente — RoomCard

**Files:**
- Create: `src/components/visits/RoomCard.tsx`

- [ ] **Criar o componente**

`src/components/visits/RoomCard.tsx`:

```tsx
import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Colors } from '@/theme/colors';
import type { Room } from '@/types/visit.types';

interface Props {
  room: Room;
  onPress?: () => void;
}

export const RoomCard = memo(function RoomCard({ room, onPress }: Props) {
  const borderColor = onPress
    ? room.isComplete ? Colors.ok : Colors.pend
    : Colors.pend;

  const serviceCount = room.items.length;

  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: borderColor,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  };

  const label = (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: Colors.t1,
          fontSize: 14,
          fontFamily: 'IBMPlexSans_600SemiBold',
          marginBottom: 2,
        }}
      >
        {room.name}
      </Text>
      <Text
        style={{
          color: Colors.t2,
          fontSize: 12,
          fontFamily: 'IBMPlexSans_400Regular',
        }}
      >
        {serviceCount} {serviceCount === 1 ? 'serviço' : 'serviços'}
      </Text>
    </View>
  );

  if (!onPress) {
    return <View style={containerStyle}>{label}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...containerStyle,
        backgroundColor: pressed ? Colors.bg3 : Colors.bg2,
      })}
    >
      {label}
      <Text
        style={{
          color: room.isComplete ? Colors.ok : Colors.t3,
          fontSize: 16,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      >
        {room.isComplete ? '✓' : '○'}
      </Text>
    </Pressable>
  );
});
```

- [ ] **Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Commit**

```bash
git add src/components/visits/RoomCard.tsx
git commit -m "feat(visits): add RoomCard component"
```

---

### Task 8: Screen — VisitDetailScreen

**Files:**
- Create: `src/screens/VisitDetailScreen.tsx`

- [ ] **Criar a screen**

`src/screens/VisitDetailScreen.tsx`:

```tsx
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
```

- [ ] **Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Commit**

```bash
git add src/screens/VisitDetailScreen.tsx
git commit -m "feat(screens): add VisitDetailScreen"
```

---

### Task 9: Rota — wire VisitDetailScreen

**Files:**
- Modify: `app/(app)/visits/[id]/index.tsx`

- [ ] **Substituir placeholder pela rota real**

`app/(app)/visits/[id]/index.tsx`:

```tsx
import { useLocalSearchParams } from 'expo-router';
import { VisitDetailScreen } from '@/screens/VisitDetailScreen';

export default function VisitDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VisitDetailScreen id={Number(id)} />;
}
```

- [ ] **Rodar suite completa de testes**

```bash
npx jest --no-coverage
```

Expected: PASS (todos os testes)

- [ ] **Verificar TypeScript sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Commit**

```bash
git add app/(app)/visits/[id]/index.tsx
git commit -m "feat(routes): wire VisitDetailScreen to /visits/[id]"
```
