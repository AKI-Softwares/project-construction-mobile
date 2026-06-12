# M-4 — RoomScreen Design

**Data:** 2026-06-08
**Depende de:** M-3 (VisitDetailScreen)
**Próximo:** M-5 (NCForm + fotos)

---

## Contexto

Tela de cômodo. Acessada ao tocar num `RoomCard` tappable na `VisitDetailScreen` (somente status `ONGOING`). Permite avaliar cada item do cômodo como OK ou NOK via bottom sheet.

---

## API consumida

| Endpoint | Quando |
|---|---|
| `GET /visits/:id` | Já em cache (useVisitDetail) — nenhuma chamada nova |
| `PATCH /visit-items/:itemId` | Ao confirmar avaliação no bottom sheet |

### Body de `PATCH /visit-items/:itemId`

```json
{ "status": "OK" }
```

ou

```json
{ "status": "NOK" }
```

### Response `200`

Retorna o `VisitItem` atualizado (shape já definida em `src/types/visit.types.ts`).

### Erros 409

| Mensagem | Causa |
|---|---|
| `"Finish current room before switching."` | Outro cômodo está em progresso (≥1 item non-null e ≥1 null) |
| `"Record non-conformity for all NOK items before proceeding."` | Item NOK sem NC no mesmo cômodo |

Ambos exibidos inline no `EvaluationSheet`. Sheet permanece aberto para correção.

---

## Fluxo de dados

```
RoomScreen
  └─ useVisitDetail(visitId)   ← cache existente, zero chamada extra
       └─ data.rooms.find(r => r.id === roomId)
            └─ ItemRow × room.items.length
                 └─ tap → setSelectedItem(item) → EvaluationSheet abre
                      └─ useEvaluateItem(visitId)
                           └─ PATCH /visit-items/:id
                                └─ onSuccess → invalidate VISIT_DETAIL(visitId) → RoomScreen re-renderiza
```

---

## Serviço — `src/services/visits.service.ts`

Novo método adicionado ao objeto `visitsService`:

```ts
evaluateItem: (itemId: number, status: 'OK' | 'NOK'): Promise<VisitItem> =>
  api.patch<VisitItem>(`/visit-items/${itemId}`, { status }).then((r) => r.data),
```

---

## Hook — `src/hooks/useEvaluateItem.ts`

```ts
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

---

## Componentes novos

Todos com `React.memo`.

### `src/components/visits/ItemRow.tsx`

Props: `item: VisitItem`, `onPress: () => void`

```
[ dot colorido ] [ serviceName (t1, 14px) ]    [ badge status ]
                 [ "Não avaliado" (t3, 12px) se status null ]

dot:   Colors.ok (OK) | Colors.nc (NOK) | Colors.pend (null)
badge: "✓ OK" (ok, 12px) | "✕ NOK" (nc, 12px) | "○" (pend, t3, 12px)
Pressable em toda a linha. paddingVertical: 14, paddingHorizontal: 20.
Separador: borderBottom Colors.border.
```

### `src/components/visits/EvaluationSheet.tsx`

Usa `@gorhom/bottom-sheet`. Props:

```ts
interface Props {
  item: VisitItem | null;   // null = sheet fechado
  visitId: number;
  onClose: () => void;
}
```

Layout interno:

```
[ serviceName (t1, 16px, SemiBold) ]
[ "NC: descrição" (t2, 13px) ]   ← só se item.nonConformity !== null (readonly)

[ ✓  CONFORME  ]   [ ✕  NÃO CONFORME ]   ← dois botões fullWidth
  borda amber se status atual === 'OK'       borda amber se status atual === 'NOK'
  loading spinner no botão ativo durante isPending

[ mensagem de erro 409 (nc, 12px) ]   ← só se error presente
```

Comportamento:
- `item === null` → sheet fechado (snapPoint `0%` ou dismiss)
- tap botão → `mutate({ itemId: item.id, status })` → `onSuccess` → `onClose()`
- erro → sheet permanece aberto, exibe mensagem
- re-avaliação: status atual destacado com borda amber, inspetor pode mudar até finalizar visita

---

## Screen — `src/screens/RoomScreen.tsx`

Props: `visitId: number`, `roomId: number`

```
Loading: <Spinner fullScreen />
Error:   botão "Tentar novamente" → refetch()
Room não encontrado: mensagem + router.back()

<SafeAreaView edges={['top']}>
  <ScrollView>
    ← VOLTAR (router.back())

    [ room.name (t1, 18px, IBMPlexSans_600SemiBold) ]
    [ "X de Y itens avaliados" (t2, 13px) ]

    "ITENS" (label seção, t3, 11px, IBMPlexMono, letterSpacing: 0.6)
    <ItemRow
      key={item.id}
      item={item}
      onPress={() => setSelectedItem(item)}
    />
  </ScrollView>
</SafeAreaView>

<EvaluationSheet
  item={selectedItem}
  visitId={visitId}
  onClose={() => setSelectedItem(null)}
/>
```

Estado local: `selectedItem: VisitItem | null = null`

Contagem de avaliados: `room.items.filter(i => i.status !== null).length` de `room.items.length`.

---

## Rota — `app/(app)/visits/[id]/rooms/[roomId]/index.tsx`

```tsx
export default function RoomRoute() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  return <RoomScreen visitId={Number(id)} roomId={Number(roomId)} />;
}
```

---

## Navegação

```
VisitDetailScreen
  └─ RoomCard (onPress, somente ONGOING)
       └─ router.push(`/(app)/visits/${visitId}/rooms/${roomId}`)
            └─ RoomScreen
                 └─ ItemRow (onPress)
                      └─ setSelectedItem(item) → EvaluationSheet
```

`handleRoomPress` já implementado em `VisitDetailScreen` (M-3) — nenhuma mudança necessária lá.

---

## Arquivos criados / modificados

| Arquivo | Ação |
|---|---|
| `src/services/visits.service.ts` | Adiciona `evaluateItem` |
| `src/hooks/useEvaluateItem.ts` | Novo hook mutation |
| `src/components/visits/ItemRow.tsx` | Novo componente |
| `src/components/visits/EvaluationSheet.tsx` | Novo componente (bottom sheet) |
| `src/components/visits/index.ts` | Barrel exports dos dois novos |
| `src/screens/RoomScreen.tsx` | Nova screen |
| `app/(app)/visits/[id]/rooms/[roomId]/index.tsx` | Nova rota |

---

## Dependência nova

`@gorhom/bottom-sheet` — requer Reanimated e GestureHandler (já presentes no projeto). Será reutilizado em M-5 (NC form).

```bash
npx expo install @gorhom/bottom-sheet
```

Wrappers necessários no `app/_layout.tsx`:
- `GestureHandlerRootView` já presente ✅
- `BottomSheetModalProvider` — adicionar ao root layout

---

## Fora do escopo (M-4)

- Registro de NC (M-5)
- Upload de fotos (M-5)
- Finalização da visita (M-6)
- Suporte offline
