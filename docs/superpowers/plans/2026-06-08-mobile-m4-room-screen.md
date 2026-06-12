# M-4 RoomScreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar `RoomScreen` com lista de itens e `EvaluationSheet` (bottom sheet) para avaliar cada item como OK ou NOK via `PATCH /visit-items/:id`.

**Architecture:** `RoomScreen` lê dados do cache existente de `useVisitDetail(visitId)` — sem nova chamada de API. O hook `useEvaluateItem` executa `PATCH /visit-items/:itemId` e invalida `VISIT_DETAIL(visitId)` no sucesso, atualizando a tela automaticamente. `EvaluationSheet` é um componente filho de `RoomScreen` usando `@gorhom/bottom-sheet`.

**Tech Stack:** React Native, Expo Router v3, TanStack React Query v5, TypeScript strict, `@gorhom/bottom-sheet`, Reanimated (já instalado), GestureHandler (já instalado), IBMPlexSans/IBMPlexMono fonts.

---

## Contexto do projeto

- **Spec:** `docs/superpowers/specs/2026-06-08-m4-room-screen-design.md`
- **Tipos existentes:** `src/types/visit.types.ts` — `VisitItem`, `Room`, `VisitDetail`, `NonConformity` já definidos
- **Serviço existente:** `src/services/visits.service.ts` — adicionar `evaluateItem`
- **Hook existente:** `src/hooks/useVisitDetail.ts` — já implementado, reutilizado sem alteração
- **Query key:** `QUERY_KEYS.VISIT_DETAIL(visitId)` em `src/lib/constants.ts`
- **Colors:** `src/theme/colors.ts` — `Colors.ok` (#22C55E), `Colors.nc` (#EF4444), `Colors.pend` (#475569), `Colors.bg1/bg2/bg3`, `Colors.t1/t2/t3`, `Colors.border`, `Colors.amber`
- **Padrão de hooks:** ver `src/hooks/useStartVisit.ts`
- **Padrão de testes de serviço:** ver `__tests__/services/visits.service.test.ts`
- **Padrão de testes de hook:** ver `__tests__/hooks/useStartVisit.test.ts`
- **Padrão de tela:** ver `src/screens/VisitDetailScreen.tsx`
- **GestureHandlerRootView:** já presente em `app/_layout.tsx` ✅

---

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/services/visits.service.ts` | Modificar — adicionar `evaluateItem` |
| `__tests__/services/visits.service.test.ts` | Modificar — adicionar 3 testes de `evaluateItem` |
| `src/hooks/useEvaluateItem.ts` | Criar |
| `__tests__/hooks/useEvaluateItem.test.ts` | Criar |
| `src/components/visits/ItemRow.tsx` | Criar |
| `src/components/visits/EvaluationSheet.tsx` | Criar |
| `src/components/visits/index.ts` | Modificar — barrel exports |
| `src/screens/RoomScreen.tsx` | Criar |
| `app/(app)/visits/[id]/rooms/[roomId]/index.tsx` | Criar |

---

## Task 1: Instalar @gorhom/bottom-sheet

**Files:**
- (sem arquivos editados — instalação de pacote)

- [ ] **Step 1: Instalar pacote**

```bash
npx expo install @gorhom/bottom-sheet
```

Expected output: pacote adicionado ao `package.json` sem erros.

- [ ] **Step 2: Verificar instalação**

```bash
npx tsc --noEmit
```

Expected: zero erros de TypeScript (pacote inclui tipos).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): install @gorhom/bottom-sheet"
```

---

## Task 2: evaluateItem — serviço + testes

**Files:**
- Modify: `src/services/visits.service.ts`
- Modify: `__tests__/services/visits.service.test.ts`

### Background

O serviço existente tem `getMyVisits`, `getVisitById`, `startVisit`. Adicionar `evaluateItem` seguindo o mesmo padrão.

Endpoint: `PATCH /visit-items/:itemId` com body `{ status: 'OK' | 'NOK' }`. Retorna o `VisitItem` atualizado.

Erros possíveis:
- 409 `"Finish current room before switching."` — outro cômodo em progresso
- 409 `"Record non-conformity for all NOK items before proceeding."` — NOK sem NC no cômodo

- [ ] **Step 1: Escrever os testes que falham**

Abrir `__tests__/services/visits.service.test.ts`. Adicionar o describe `evaluateItem` **dentro** do describe `visitsService` existente, após o último `describe` atual:

```ts
describe('evaluateItem', () => {
  it('retorna VisitItem com status atualizado', async () => {
    const updated = {
      id: 10,
      serviceId: 3,
      serviceName: 'Pintura',
      status: 'OK' as const,
      nonConformity: null,
    };
    mock.onPatch('/visit-items/10').reply(200, updated);
    const result = await visitsService.evaluateItem(10, 'OK');
    expect(result.status).toBe('OK');
  });

  it('rejeita em 409 (guard de cômodo)', async () => {
    mock.onPatch('/visit-items/10').reply(409);
    await expect(visitsService.evaluateItem(10, 'NOK')).rejects.toThrow();
  });

  it('rejeita em erro de rede', async () => {
    mock.onPatch('/visit-items/10').networkError();
    await expect(visitsService.evaluateItem(10, 'OK')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Rodar testes e confirmar falha**

```bash
npx jest __tests__/services/visits.service.test.ts --no-coverage
```

Expected: FAIL — `visitsService.evaluateItem is not a function`

- [ ] **Step 3: Implementar evaluateItem**

Abrir `src/services/visits.service.ts`. Adicionar `evaluateItem` ao objeto `visitsService`:

```ts
import { api } from './api';
import type { Visit, VisitDetail, VisitItem } from '@/types/visit.types';

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

  evaluateItem: (itemId: number, status: 'OK' | 'NOK'): Promise<VisitItem> =>
    api.patch<VisitItem>(`/visit-items/${itemId}`, { status }).then((r) => r.data),
};
```

- [ ] **Step 4: Rodar testes e confirmar pass**

```bash
npx jest __tests__/services/visits.service.test.ts --no-coverage
```

Expected: PASS — todos os describes passam.

- [ ] **Step 5: Commit**

```bash
git add src/services/visits.service.ts __tests__/services/visits.service.test.ts
git commit -m "feat(service): add evaluateItem to visitsService"
```

---

## Task 3: useEvaluateItem — hook + testes

**Files:**
- Create: `src/hooks/useEvaluateItem.ts`
- Create: `__tests__/hooks/useEvaluateItem.test.ts`

### Background

Mutation hook seguindo o padrão de `useStartVisit`. Recebe `visitId` para saber qual query invalidar no sucesso. A `mutationFn` recebe `{ itemId, status }`.

- [ ] **Step 1: Escrever testes que falham**

Criar `__tests__/hooks/useEvaluateItem.test.ts`:

```ts
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvaluateItem } from '../../src/hooks/useEvaluateItem';
import { visitsService } from '../../src/services/visits.service';

jest.mock('../../src/services/visits.service');
const mockedService = visitsService as jest.Mocked<typeof visitsService>;

const mockItem = {
  id: 10,
  serviceId: 3,
  serviceName: 'Pintura',
  status: 'OK' as const,
  nonConformity: null,
};

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('useEvaluateItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('chama evaluateItem com itemId e status corretos', async () => {
    mockedService.evaluateItem.mockResolvedValueOnce(mockItem);
    const { result } = renderHook(() => useEvaluateItem(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate({ itemId: 10, status: 'OK' }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.evaluateItem).toHaveBeenCalledWith(10, 'OK');
  });

  it('expõe isError em falha da mutation', async () => {
    mockedService.evaluateItem.mockRejectedValueOnce(new Error('Conflict'));
    const { result } = renderHook(() => useEvaluateItem(1), { wrapper: makeWrapper() });
    await act(async () => { result.current.mutate({ itemId: 10, status: 'NOK' }); });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

- [ ] **Step 2: Rodar testes e confirmar falha**

```bash
npx jest __tests__/hooks/useEvaluateItem.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../src/hooks/useEvaluateItem'`

- [ ] **Step 3: Implementar hook**

Criar `src/hooks/useEvaluateItem.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { visitsService } from '@/services/visits.service';

export function useEvaluateItem(visitId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: 'OK' | 'NOK' }) =>
      visitsService.evaluateItem(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
    },
  });
}
```

- [ ] **Step 4: Rodar testes e confirmar pass**

```bash
npx jest __tests__/hooks/useEvaluateItem.test.ts --no-coverage
```

Expected: PASS — 2 testes passam.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useEvaluateItem.ts __tests__/hooks/useEvaluateItem.test.ts
git commit -m "feat(hooks): add useEvaluateItem mutation hook"
```

---

## Task 4: ItemRow — componente

**Files:**
- Create: `src/components/visits/ItemRow.tsx`
- Modify: `src/components/visits/index.ts`

### Background

Linha de item na lista do cômodo. Sempre `Pressable`. Mostra: dot colorido (status), nome do serviço, badge de status. Segue padrão de `RoomCard.tsx` — `React.memo`, inline styles com `Colors`.

- [ ] **Step 1: Criar componente**

Criar `src/components/visits/ItemRow.tsx`:

```tsx
import { memo } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Colors } from '@/theme/colors';
import type { VisitItem } from '@/types/visit.types';

interface Props {
  item: VisitItem;
  onPress: () => void;
}

export const ItemRow = memo(function ItemRow({ item, onPress }: Props) {
  const dotColor =
    item.status === 'OK' ? Colors.ok :
    item.status === 'NOK' ? Colors.nc :
    Colors.pend;

  const badgeColor =
    item.status === 'OK' ? Colors.ok :
    item.status === 'NOK' ? Colors.nc :
    Colors.t3;

  const badgeLabel =
    item.status === 'OK' ? '✓ OK' :
    item.status === 'NOK' ? '✕ NOK' :
    '○';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: pressed ? Colors.bg3 : Colors.bg2,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      })}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dotColor,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: Colors.t1,
            fontSize: 14,
            fontFamily: 'IBMPlexSans_400Regular',
          }}
        >
          {item.serviceName}
        </Text>
        {item.status === null && (
          <Text
            style={{
              color: Colors.t3,
              fontSize: 12,
              fontFamily: 'IBMPlexSans_400Regular',
              marginTop: 2,
            }}
          >
            Não avaliado
          </Text>
        )}
      </View>
      <Text
        style={{
          color: badgeColor,
          fontSize: 12,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      >
        {badgeLabel}
      </Text>
    </Pressable>
  );
});
```

- [ ] **Step 2: Adicionar ao barrel export**

Abrir `src/components/visits/index.ts`. Conteúdo atual:

```ts
export { VisitStatusBadge } from './VisitStatusBadge';
export { VisitCard } from './VisitCard';
```

Adicionar linha:

```ts
export { VisitStatusBadge } from './VisitStatusBadge';
export { VisitCard } from './VisitCard';
export { ItemRow } from './ItemRow';
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/visits/ItemRow.tsx src/components/visits/index.ts
git commit -m "feat(visits): add ItemRow component"
```

---

## Task 5: EvaluationSheet — bottom sheet de avaliação

**Files:**
- Create: `src/components/visits/EvaluationSheet.tsx`
- Modify: `src/components/visits/index.ts`

### Background

Bottom sheet que abre quando `item !== null` e fecha quando `item` volta a `null`. Usa `@gorhom/bottom-sheet` (v4/v5 compatível). Dois botões grandes: CONFORME (ok) e NÃO CONFORME (nc). Botão do status atual recebe borda amber. Loading state no botão ativo. Erros 409 exibidos inline abaixo dos botões.

`GestureHandlerRootView` já está presente em `app/_layout.tsx` — sem setup extra.

- [ ] **Step 1: Criar componente**

Criar `src/components/visits/EvaluationSheet.tsx`:

```tsx
import { memo, useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { AxiosError } from 'axios';
import { Colors } from '@/theme/colors';
import { useEvaluateItem } from '@/hooks/useEvaluateItem';
import type { VisitItem } from '@/types/visit.types';

interface Props {
  item: VisitItem | null;
  visitId: number;
  onClose: () => void;
}

export const EvaluationSheet = memo(function EvaluationSheet({ item, visitId, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);
  const { mutate, isPending, error, reset } = useEvaluateItem(visitId);
  const [pendingStatus, setPendingStatus] = useState<'OK' | 'NOK' | null>(null);

  useEffect(() => {
    if (item) {
      reset();
      setPendingStatus(null);
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [item, reset]);

  const handleEvaluate = useCallback(
    (status: 'OK' | 'NOK') => {
      if (!item || isPending) return;
      setPendingStatus(status);
      mutate(
        { itemId: item.id, status },
        {
          onSuccess: () => {
            setPendingStatus(null);
            onClose();
          },
          onError: () => setPendingStatus(null),
        },
      );
    },
    [item, mutate, isPending, onClose],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  const apiError = error as AxiosError<{ message: string }> | null;
  const errorMessage = apiError?.response?.data?.message ?? null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.bg2 }}
      handleIndicatorStyle={{ backgroundColor: Colors.t3 }}
    >
      <BottomSheetView
        style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
      >
        <Text
          style={{
            color: Colors.t1,
            fontSize: 16,
            fontFamily: 'IBMPlexSans_600SemiBold',
            marginBottom: 4,
          }}
        >
          {item?.serviceName ?? ''}
        </Text>

        {item?.nonConformity != null && (
          <Text
            style={{
              color: Colors.t2,
              fontSize: 13,
              fontFamily: 'IBMPlexSans_400Regular',
              marginBottom: 4,
            }}
          >
            NC: {item.nonConformity.description}
          </Text>
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          {/* Botão CONFORME */}
          <Pressable
            onPress={() => handleEvaluate('OK')}
            disabled={isPending}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 6,
              backgroundColor: Colors.bg3,
              borderWidth: 1.5,
              borderColor: item?.status === 'OK' ? Colors.amber : Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPending && pendingStatus === 'OK' ? (
              <ActivityIndicator size="small" color={Colors.ok} />
            ) : (
              <Text
                style={{
                  color: Colors.ok,
                  fontSize: 15,
                  fontFamily: 'IBMPlexSans_600SemiBold',
                }}
              >
                ✓  CONFORME
              </Text>
            )}
          </Pressable>

          {/* Botão NÃO CONFORME */}
          <Pressable
            onPress={() => handleEvaluate('NOK')}
            disabled={isPending}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 6,
              backgroundColor: Colors.bg3,
              borderWidth: 1.5,
              borderColor: item?.status === 'NOK' ? Colors.amber : Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPending && pendingStatus === 'NOK' ? (
              <ActivityIndicator size="small" color={Colors.nc} />
            ) : (
              <Text
                style={{
                  color: Colors.nc,
                  fontSize: 15,
                  fontFamily: 'IBMPlexSans_600SemiBold',
                }}
              >
                ✕  NÃO CONFORME
              </Text>
            )}
          </Pressable>
        </View>

        {errorMessage != null && (
          <Text
            style={{
              color: Colors.nc,
              fontSize: 12,
              fontFamily: 'IBMPlexSans_400Regular',
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </Text>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});
```

- [ ] **Step 2: Adicionar ao barrel export**

Abrir `src/components/visits/index.ts`. Adicionar linha:

```ts
export { VisitStatusBadge } from './VisitStatusBadge';
export { VisitCard } from './VisitCard';
export { ItemRow } from './ItemRow';
export { EvaluationSheet } from './EvaluationSheet';
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/visits/EvaluationSheet.tsx src/components/visits/index.ts
git commit -m "feat(visits): add EvaluationSheet bottom sheet component"
```

---

## Task 6: RoomScreen + rota

**Files:**
- Create: `src/screens/RoomScreen.tsx`
- Create: `app/(app)/visits/[id]/rooms/[roomId]/index.tsx`

### Background

`RoomScreen` lê `useVisitDetail(visitId)` (cache existente), encontra o `room` pelo `roomId`, renderiza lista de `ItemRow`. Tap num item abre `EvaluationSheet` via estado local `selectedItem`. Padrão idêntico a `VisitDetailScreen` — `SafeAreaView edges={['top']}`, botão `← VOLTAR`, error state com retry.

**Três estados de erro:**
1. `isLoading` → `<Spinner fullScreen />`
2. `isError || !visit` → mensagem + botão retry
3. `!room` (roomId não encontrado nos dados) → mensagem + botão voltar

**Rota:** Expo Router extrai `id` e `roomId` como strings dos params — parsear para `number` antes de passar para a screen.

- [ ] **Step 1: Criar RoomScreen**

Criar `src/screens/RoomScreen.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
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

  const handleItemPress = useCallback((item: VisitItem) => setSelectedItem(item), []);
  const handleSheetClose = useCallback(() => setSelectedItem(null), []);

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !visit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text
            style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}
          >
            Erro ao carregar cômodo
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

  const room = visit.rooms.find((r) => r.id === roomId);

  if (!room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text
            style={{ color: Colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}
          >
            Cômodo não encontrado
          </Text>
          <Pressable
            onPress={() => router.back()}
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
              VOLTAR
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const evaluated = room.items.filter((i) => i.status !== null).length;
  const total = room.items.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg1 }} edges={['top']}>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <Text
            style={{
              color: Colors.t1,
              fontSize: 18,
              fontFamily: 'IBMPlexSans_600SemiBold',
              marginBottom: 4,
            }}
          >
            {room.name}
          </Text>
          <Text
            style={{
              color: Colors.t2,
              fontSize: 13,
              fontFamily: 'IBMPlexSans_400Regular',
            }}
          >
            {evaluated} de {total} itens avaliados
          </Text>
        </View>

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
          ITENS
        </Text>

        <View
          style={{
            backgroundColor: Colors.bg2,
            borderRadius: 6,
            marginHorizontal: 20,
            overflow: 'hidden',
          }}
        >
          {room.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </View>
      </ScrollView>

      <EvaluationSheet
        item={selectedItem}
        visitId={visitId}
        onClose={handleSheetClose}
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Criar diretório e arquivo de rota**

Criar `app/(app)/visits/[id]/rooms/[roomId]/index.tsx`:

```tsx
import { useLocalSearchParams } from 'expo-router';
import { RoomScreen } from '@/screens/RoomScreen';

export default function RoomRoute() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  return <RoomScreen visitId={Number(id)} roomId={Number(roomId)} />;
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero erros.

- [ ] **Step 4: Rodar toda a suite de testes**

```bash
npx jest --no-coverage
```

Expected: todos os testes passam (incluindo os novos de Tasks 2 e 3).

- [ ] **Step 5: Commit**

```bash
git add src/screens/RoomScreen.tsx "app/(app)/visits/[id]/rooms/[roomId]/index.tsx"
git commit -m "feat(screens): add RoomScreen with EvaluationSheet"
```

---

## Self-Review

**Spec coverage:**
- ✅ `evaluateItem` service + testes (Task 2)
- ✅ `useEvaluateItem` hook + invalidação (Task 3)
- ✅ `ItemRow` componente com dot, nome, badge (Task 4)
- ✅ `EvaluationSheet` com OK/NOK, status destacado, loading, erro 409 inline (Task 5)
- ✅ `RoomScreen` com loading/error/not-found states, lista de items, sheet (Task 6)
- ✅ Rota `/(app)/visits/[id]/rooms/[roomId]` (Task 6)
- ✅ Re-avaliação: `item?.status === 'OK'` destaca borda amber no botão atual
- ✅ Cache: `useVisitDetail` reutilizado sem chamada extra
- ✅ Invalidação no sucesso → RoomScreen re-renderiza com novo status

**Fora do escopo (M-5):**
- Registro de NC após NOK
- Upload de fotos
