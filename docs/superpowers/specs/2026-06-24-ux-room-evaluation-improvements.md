# UX — Room Evaluation Improvements

**Data:** 2026-06-24  
**Status:** Aprovado — aguardando implementação  
**Scope:** Mobile app (project-construction-mobile)

---

## Contexto

Melhorias de UX no fluxo de avaliação de cômodos, cobrindo quatro áreas: safe area do tab bar, sistema de toasts, atalho "marcar todos como OK" e navegação sequencial entre cômodos.

> **Nota de design:** O design visual do app será atualizado para seguir um novo protótipo (cores, tipografia, tokens). As implementações abaixo devem usar os tokens atuais do design system. Quando o novo design for entregue, apenas os tokens serão substituídos — a estrutura de componentes permanece.

---

## 1. Tab Bar — Safe Area Dinâmica

**Arquivo:** `app/(app)/(tabs)/_layout.tsx`

**Problema:** `paddingBottom: 28` e `height: 72` estão hardcoded. Em dispositivos Android com barra de navegação virtual (3 botões, ~48dp), a tab bar fica parcialmente coberta, tornando os botões inacessíveis.

**Fix:** Injetar `useSafeAreaInsets()` no `TabsLayout` e tornar os valores dinâmicos:

```ts
paddingBottom = insets.bottom + 8
height        = 56 + insets.bottom
```

Funciona corretamente em todos os cenários: gesture navigation, barra de 3 botões, sem barra (insets.bottom = 0).

---

## 2. Sistema de Toasts

### Biblioteca

`react-native-toast-message` — compatível com Expo SDK 54 e Reanimated 4.x já presentes no projeto.

### Componente custom

Arquivo novo: `src/components/ui/Toast.tsx`

- Fundo `bg3` (`#1E2C40`), borda `border`, `borderRadius: 6`
- Ícone + mensagem: sucesso → cor `ok`, erro → cor `nc`, info → cor `amber`
- Fontes `IBMPlexSans_400Regular`
- Posição: `top` (evita conflito com tab bar e navbar do sistema)
- Duração: 2.5s sucesso / 4s erro

### Helper global

Arquivo novo: `src/lib/toast.ts`

```ts
export function showToast(type: 'success' | 'error' | 'info', message: string): void
```

### Montagem global

`<Toast />` adicionado ao final de `app/(app)/_layout.tsx` — ativo durante toda a sessão autenticada.

### Ações cobertas

| Ação | Toast sucesso | Toast erro |
|------|--------------|------------|
| Iniciar vistoria | "Vistoria iniciada" | "Não foi possível iniciar" |
| Finalizar vistoria | "Vistoria finalizada" | "Finalize todos os itens primeiro" |
| Assumir re-inspeção | "Re-inspeção assumida" | "Não foi possível assumir" |
| Marcar todos OK | "Todos os itens marcados como OK" | "Erro ao marcar itens" |
| Salvar NC | "Não conformidade salva" | "Não foi possível salvar" |
| Adicionar foto | "Foto adicionada" | "Erro ao adicionar foto" |
| Remover foto | "Foto removida" | "Erro ao remover foto" |
| Salvar assinatura | "Assinatura salva" | "Não foi possível salvar a assinatura" |
| Baixar relatório | "Relatório baixado" | "Erro ao gerar relatório" |
| Alterar senha | "Senha alterada com sucesso" | "Não foi possível alterar a senha" |

**Não recebe toast:** avaliação individual de item (OK/NOK) — feedback já é visual imediato no `ItemRow` e o sheet muda de estado.

**Substitui:** todos os `Alert.alert` de erro existentes nas screens de vistoria.

---

## 3. "Marcar todos como OK"

**Arquivo:** `src/screens/RoomScreen.tsx`

### Layout

A linha do label "ITENS" vira uma `View` com `flexDirection: 'row'`, `justifyContent: 'space-between'`:

```
ITENS                         [✓ TODOS OK]
```

### Visibilidade

Aparece apenas quando:
- `visit.status === 'ONGOING'`
- `room.items.some(i => i.status === null)` (existe ao menos um item pendente)

### Comportamento

1. Ao pressionar: botão exibe spinner e fica desabilitado
2. Coleta todos os itens com `status === null`
3. Envia `PATCH /visits/:id/items/:itemId { status: 'OK' }` de forma **sequencial** (evita conflitos com Guard 1 e Guard 2 do backend)
4. Ao concluir: invalida `QUERY_KEYS.VISIT_DETAIL(visitId)` e exibe toast de sucesso
5. Em caso de erro em qualquer item: interrompe a sequência e exibe toast de erro

### Implementação

Sem hook separado — lógica inline via `useCallback` + `useQueryClient` na `RoomScreen`. Usa `visitsService.evaluateItem` diretamente.

---

## 4. Botão "Próximo cômodo"

**Arquivo:** `src/screens/RoomScreen.tsx`

### Visibilidade

Aparece no rodapé (fora do `ScrollView`) quando:
- `visit.status === 'ONGOING'`
- `evaluated === total && total > 0` (todos os itens avaliados)

### Labels e ações

| Condição | Label | Ação |
|----------|-------|------|
| Existe próximo cômodo | `PRÓXIMO CÔMODO → [nome]` | `router.replace(/(app)/visits/[id]/rooms/[nextRoomId])` |
| Último cômodo | `← VOLTAR À VISTORIA` | `router.back()` |

`router.replace` (não `push`) evita empilhar histórico desnecessário ao navegar entre cômodos.

### Determinação do próximo cômodo

```ts
const roomIndex = visit.rooms.findIndex(r => r.id === roomId);
const nextRoom  = visit.rooms[roomIndex + 1] ?? null;
```

### Safe area

`paddingBottom: Math.max(insets.bottom, 16)` — consistente com os outros rodapés do app (`VisitDetailScreen`).

---

## Arquivos modificados

| Arquivo | Tipo | O que muda |
|---------|------|-----------|
| `app/(app)/(tabs)/_layout.tsx` | edit | `useSafeAreaInsets()` + height/padding dinâmicos |
| `app/(app)/_layout.tsx` | edit | `<Toast />` global |
| `src/components/ui/Toast.tsx` | novo | Componente custom do toast |
| `src/components/ui/index.ts` | edit | Export do Toast |
| `src/lib/toast.ts` | novo | Helper `showToast()` |
| `src/screens/RoomScreen.tsx` | edit | Botão "todos OK" + botão "próximo cômodo" |
| `src/screens/VisitDetailScreen.tsx` | edit | Toasts em start/finalize/claim/signature/PDF |
| `src/components/visits/EvaluationSheet.tsx` | edit | Toasts em save NC |
| `src/components/visits/NCForm.tsx` | edit | Toasts em add/remove foto |
| `src/screens/ChangePasswordScreen.tsx` | edit | Toast em alterar senha |

## Dependências novas

```
react-native-toast-message
```
