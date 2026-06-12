# M-3 — VisitDetailScreen Design

**Data:** 2026-06-07
**Depende de:** M-1 (foundation), M-2 (VisitListScreen)
**Próximo:** M-4 (RoomScreen)

---

## Contexto

Tela de detalhe de visita. Acessada ao tocar num `VisitCard` na `VisitListScreen`. Comportamento condicional por `status` da visita:

- `NOT_STARTED` → preview de cômodos + botão "INICIAR VISTORIA"
- `ONGOING` → progress bar + cômodos tappable para `RoomScreen`

---

## API consumida

| Endpoint | Quando |
|---|---|
| `GET /visits/:id` | Ao montar a tela |
| `PATCH /visits/:id/start` | Ao tocar "INICIAR VISTORIA" |

### Shape de `GET /visits/:id`

```json
{
  "id": 7,
  "checklistId": 3,
  "status": "ONGOING",
  "observations": null,
  "finalizedAt": null,
  "createdAt": "2026-06-01T10:00:00Z",
  "inspector": { "id": 2, "name": "João" },
  "apartment": {
    "identifier": "101",
    "floor": 1,
    "block": "A",
    "building": { "name": "Residencial Aurora" }
  },
  "rooms": [
    {
      "id": 5,
      "name": "Sala",
      "isComplete": false,
      "items": [
        { "id": 10, "serviceId": 3, "serviceName": "Pintura", "status": "NOK", "nonConformity": { "id": 1, "description": "..." } },
        { "id": 11, "serviceId": 4, "serviceName": "Rejunte", "status": null, "nonConformity": null }
      ]
    }
  ]
}
```

---

## Tipos novos — `src/types/visit.types.ts`

Adicionados sem quebrar tipos existentes (`Visit`, `Apartment`, `Building`, `VisitStatus`):

```ts
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

---

## Serviços — `src/services/visits.service.ts`

Duas funções novas adicionadas ao objeto `visitsService`:

```ts
getVisitById(id: number): Promise<VisitDetail>  // GET /visits/:id
startVisit(id: number): Promise<Visit>           // PATCH /visits/:id/start
```

---

## Hooks

### `src/hooks/useVisitDetail.ts`

React Query. `staleTime: 0` porque dados mudam ao iniciar a visita.

```ts
queryKey: [...QUERY_KEYS.VISIT_DETAIL, id]
queryFn: () => visitsService.getVisitById(id)
```

### `src/hooks/useStartVisit.ts`

Mutation. Ao sucesso, invalida dois queries:

1. `QUERY_KEYS.VISIT_DETAIL(id)` — refetch da tela atual
2. `QUERY_KEYS.VISITS_MINE` — atualiza status na lista ao voltar

---

## Componentes novos

Todos com `React.memo` para evitar re-renders desnecessários.

### `src/components/ui/ProgressBar.tsx`

Reutilizável. Props: `value: number` (0–1).

```
bg: bg4 · height: 4px · borderRadius: 99px
fill: amber · largura = value * 100%
```

### `src/components/visits/VisitHeader.tsx`

Props: `visit: VisitDetail`

```
Linha 1: nome do edifício (t1, 18px, bold) + VisitStatusBadge
Linha 2: "Apt 101 · Bloco A · 2º andar" (t2, 13px)
Linha 3: data de criação formatada (IBMPlexMono, t3, 11px)
```

### `src/components/visits/RoomCard.tsx`

Props: `room: Room`, `onPress?: () => void`

- `onPress` definido (ONGOING) → Pressable, borda-esquerda: `ok` se `isComplete`, `pend` se não
- `onPress` undefined (NOT_STARTED) → View estática, borda-esquerda: `pend`
- Conteúdo: nome do cômodo (t1, 14px) + `X serviços` (t2, 12px)
- ONGOING: ícone direito `✓` (ok) ou `○` (t3) por `isComplete`

---

## Screen — `src/screens/VisitDetailScreen.tsx`

Props: `id: number`

### Estado

```ts
const { data: visit, isLoading, isError } = useVisitDetail(id)
const { mutate: startVisit, isPending } = useStartVisit()
const handleStart = useCallback(() => startVisit(id), [id, startVisit])
const handleRoomPress = useCallback((roomId: number) => {
  router.push(`/(app)/visits/${id}/rooms/${roomId}` as any)
}, [id, router])
```

### Layout

```
<SafeAreaView edges={['top']}>
  <ScrollView>
    ← botão voltar (top-left)
    <VisitHeader visit={visit} />

    {ONGOING && (
      <View>  ← seção de progresso
        <Text>X de Y ambientes concluídos</Text>
        <ProgressBar value={completed / total} />
      </View>
    )}

    <SectionLabel>AMBIENTES</SectionLabel>

    {rooms.map(room => (
      <RoomCard
        key={room.id}
        room={room}
        onPress={isOngoing ? () => handleRoomPress(room.id) : undefined}
      />
    ))}
  </ScrollView>

  {NOT_STARTED && (
    <View style={bottomPad}>   ← fora do scroll, fixo no bottom
      <Button
        label="INICIAR VISTORIA"
        onPress={handleStart}
        loading={isPending}
        fullWidth
      />
    </View>
  )}
</SafeAreaView>
```

`ScrollView` em vez de `FlatList` — rooms são poucos (5–10), header precisa scrollar junto.

### Navegação para RoomScreen

`handleRoomPress` prepara a rota `/(app)/visits/:id/rooms/:roomId`. Rota ainda não existe (M-4). Por ora navega sem efeito — será implementada em M-4.

---

## Rota — `app/(app)/visits/[id]/index.tsx`

Rota pura. Extrai `id` dos params, parseia para `number`, renderiza `VisitDetailScreen`.

---

## Arquivos criados/modificados

| Arquivo | Ação |
|---|---|
| `src/types/visit.types.ts` | Adiciona `NonConformity`, `VisitItem`, `Room`, `Inspector`, `VisitDetail` |
| `src/services/visits.service.ts` | Adiciona `getVisitById`, `startVisit` |
| `src/hooks/useVisitDetail.ts` | Novo hook React Query |
| `src/hooks/useStartVisit.ts` | Nova mutation |
| `src/components/ui/ProgressBar.tsx` | Novo componente |
| `src/components/visits/VisitHeader.tsx` | Novo componente |
| `src/components/visits/RoomCard.tsx` | Novo componente |
| `src/screens/VisitDetailScreen.tsx` | Nova screen |
| `app/(app)/visits/[id]/index.tsx` | Substitui placeholder |

---

## Fora do escopo (M-3)

- Navegação para RoomScreen (M-4)
- Avaliação de itens (M-4)
- NC Form e fotos (M-5)
- Finalização da visita (M-6)
- Suporte offline
