# UX — Room Evaluation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir safe area do tab bar, adicionar sistema de toasts globais e dois novos controles na RoomScreen (marcar todos como OK e navegação para próximo cômodo).

**Architecture:** Toast system centralizado em `src/lib/toast.ts` + componente custom em `src/components/ui/Toast.tsx`, montado uma vez em `app/(app)/_layout.tsx`. Todos os hooks de mutação emitem toasts via `onSuccess`/`onError`. RoomScreen recebe dois novos comportamentos inline sem hooks extras.

**Tech Stack:** Expo SDK 54, React Native, NativeWind v4, TanStack Query v5, `react-native-toast-message`, `react-native-safe-area-context` (já instalado)

## Global Constraints

- Expo SDK 54 — usar `npx expo install` para novas dependências
- Fontes: `IBMPlexSans_400Regular`, `IBMPlexMono_600SemiBold`
- Cores: sempre via `Colors` de `@/theme/colors` — nunca hardcoded
- Zero novos hooks de mutação — lógica inline onde pontual
- Arquivos abaixo de 500 linhas
- Commits em português no estilo convencional (`feat:`, `fix:`)

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `app/(app)/(tabs)/_layout.tsx` | Modificar | Safe area dinâmica no tab bar |
| `src/lib/toast.ts` | Criar | Helper `showToast()` |
| `src/components/ui/Toast.tsx` | Criar | Componente custom dark-themed |
| `src/components/ui/index.ts` | Modificar | Export do `toastConfig` |
| `app/(app)/_layout.tsx` | Modificar | Montar `<Toast>` global |
| `src/hooks/useStartVisit.ts` | Modificar | Toast start |
| `src/hooks/useFinalizeVisit.ts` | Modificar | Toast finalize |
| `src/hooks/useClaimReinspection.ts` | Modificar | Toast claim |
| `src/hooks/useNonConformity.ts` | Modificar | Toast NC save |
| `src/hooks/usePhoto.ts` | Modificar | Toast foto add/remove |
| `src/components/visits/SignatureSheet.tsx` | Modificar | Substituir Alert por toast |
| `src/screens/VisitDetailScreen.tsx` | Modificar | Toasts PDF + assinatura |
| `src/screens/ChangePasswordScreen.tsx` | Modificar | Substituir Alert por toast |
| `src/screens/RoomScreen.tsx` | Modificar | Botão "todos OK" + rodapé "próximo" |

---

## Task 1: Tab bar — safe area dinâmica

**Files:**
- Modify: `app/(app)/(tabs)/_layout.tsx`

**Interfaces:**
- Produz: tab bar com altura correta em todos os dispositivos Android

- [ ] **Passo 1: Atualizar `_layout.tsx`**

Substituir o conteúdo inteiro do arquivo:

```tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: active ? Colors.amber : Colors.t3 }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg1,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: insets.bottom + 8,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.amber,
        tabBarInactiveTintColor: Colors.t3,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: 'IBMPlexSans_400Regular',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visitas',
          tabBarIcon: ({ focused }) => <TabIcon label="◫" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon label="◉" active={focused} />,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Passo 2: Verificar manualmente**

Abrir o app em dispositivo/emulador Android com barra de navegação virtual (3 botões). Confirmar que a tab bar aparece acima dos botões do sistema sem sobreposição.

- [ ] **Passo 3: Commit**

```bash
git add app/(app)/(tabs)/_layout.tsx
git commit -m "fix(tabs): usar safe area dinâmica para altura do tab bar"
```

---

## Task 2: Toast — foundation

**Files:**
- Create: `src/lib/toast.ts`
- Create: `src/components/ui/Toast.tsx`
- Modify: `src/components/ui/index.ts`
- Modify: `app/(app)/_layout.tsx`

**Interfaces:**
- Produz: `showToast(type, message)` importável de `@/lib/toast`
- Produz: `toastConfig` importável de `@/components/ui/Toast`

- [ ] **Passo 1: Instalar dependência**

```bash
npx expo install react-native-toast-message
```

Resultado esperado: `react-native-toast-message` aparece em `package.json` em `dependencies`.

- [ ] **Passo 2: Criar `src/lib/toast.ts`**

```ts
import Toast from 'react-native-toast-message';

export function showToast(type: 'success' | 'error' | 'info', message: string): void {
  Toast.show({
    type,
    text1: message,
    visibilityTime: type === 'error' ? 4000 : 2500,
    position: 'top',
  });
}
```

- [ ] **Passo 3: Criar `src/components/ui/Toast.tsx`**

```tsx
import { BaseToast, type BaseToastProps } from 'react-native-toast-message';
import { Colors } from '@/theme/colors';

const text1Style = {
  fontSize: 13,
  fontFamily: 'IBMPlexSans_400Regular',
  color: Colors.t1,
  flexShrink: 1 as const,
};

const baseContainer = {
  borderRadius: 6,
  backgroundColor: Colors.bg3,
  borderLeftWidth: 4,
  minHeight: 48,
  height: undefined as undefined,
};

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ ...baseContainer, borderLeftColor: Colors.ok }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={text1Style}
      text2={undefined}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ ...baseContainer, borderLeftColor: Colors.nc }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={text1Style}
      text2={undefined}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ ...baseContainer, borderLeftColor: Colors.amber }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={text1Style}
      text2={undefined}
    />
  ),
};
```

- [ ] **Passo 4: Atualizar `src/components/ui/index.ts`**

```ts
export { Button } from './Button';
export { Input } from './Input';
export { Spinner } from './Spinner';
export { Badge } from './Badge';
export { ProgressBar } from './ProgressBar';
export { toastConfig } from './Toast';
```

- [ ] **Passo 5: Atualizar `app/(app)/_layout.tsx`**

```tsx
import { Redirect, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Spinner } from '@/components/ui/Spinner';
import { toastConfig } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function AppLayoutInner() {
  usePushNotifications();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} topOffset={60} />
    </>
  );
}

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return <Spinner fullScreen />;
  if (!token) return <Redirect href="/(auth)/login" />;

  return <AppLayoutInner />;
}
```

- [ ] **Passo 6: Verificar manualmente**

No app, chamar `showToast('success', 'Teste')` via um botão temporário ou breakpoint. Confirmar que o toast aparece no topo com fundo escuro e borda verde.

- [ ] **Passo 7: Commit**

```bash
git add src/lib/toast.ts src/components/ui/Toast.tsx src/components/ui/index.ts app/(app)/_layout.tsx package.json package-lock.json
git commit -m "feat(toast): adicionar react-native-toast-message com tema escuro customizado"
```

---

## Task 3: Toasts nos hooks de mutação

**Files:**
- Modify: `src/hooks/useStartVisit.ts`
- Modify: `src/hooks/useFinalizeVisit.ts`
- Modify: `src/hooks/useClaimReinspection.ts`
- Modify: `src/hooks/useNonConformity.ts`
- Modify: `src/hooks/usePhoto.ts`

**Interfaces:**
- Consome: `showToast` de `@/lib/toast` (Task 2)
- Produz: toasts automáticos em todos os consumidores desses hooks

- [ ] **Passo 1: Atualizar `src/hooks/useStartVisit.ts`**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';
import { showToast } from '@/lib/toast';

export function useStartVisit(visitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => visitsService.startVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      showToast('success', 'Vistoria iniciada');
    },
    onError: () => showToast('error', 'Não foi possível iniciar'),
  });
}
```

- [ ] **Passo 2: Atualizar `src/hooks/useFinalizeVisit.ts`**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { QUERY_KEYS } from '@/lib/constants';
import { visitsService } from '@/services/visits.service';
import { showToast } from '@/lib/toast';

export function useFinalizeVisit(visitId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => visitsService.finalizeVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      showToast('success', 'Vistoria finalizada');
      router.replace('/(app)/(tabs)/visits' as any);
    },
    onError: () => showToast('error', 'Não foi possível finalizar'),
  });
}
```

- [ ] **Passo 3: Atualizar `src/hooks/useClaimReinspection.ts`**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsService } from '@/services/visits.service';
import { QUERY_KEYS } from '@/lib/constants';
import { showToast } from '@/lib/toast';

export function useClaimReinspection(visitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => visitsService.claimReinspection(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REINSPECTIONS_AVAILABLE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISITS_MINE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Re-inspeção assumida');
    },
    onError: () => showToast('error', 'Não foi possível assumir a re-inspeção'),
  });
}
```

- [ ] **Passo 4: Atualizar `src/hooks/useNonConformity.ts`**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { nonConformitiesService } from '@/services/non-conformities.service';
import { showToast } from '@/lib/toast';

export function useNonConformity(visitId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ visitItemId, description }: { visitItemId: number; description: string }) =>
      nonConformitiesService.create(visitItemId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Não conformidade salva');
    },
    onError: () => showToast('error', 'Não foi possível salvar a não conformidade'),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, description }: { id: number; description: string }) =>
      nonConformitiesService.patch(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Não conformidade salva');
    },
    onError: () => showToast('error', 'Não foi possível salvar a não conformidade'),
  });

  return { createMutation, patchMutation };
}
```

- [ ] **Passo 5: Atualizar `src/hooks/usePhoto.ts`**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { photosService } from '@/services/photos.service';
import { showToast } from '@/lib/toast';
import type { LocalPhoto } from '@/types/nc.types';

export function usePhoto(visitId: number) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({ ncId, photo }: { ncId: number; photo: LocalPhoto }) =>
      photosService.add(ncId, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Foto adicionada');
    },
    onError: () => showToast('error', 'Erro ao adicionar foto'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ ncId, photoId }: { ncId: number; photoId: number }) =>
      photosService.remove(ncId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      showToast('success', 'Foto removida');
    },
    onError: () => showToast('error', 'Erro ao remover foto'),
  });

  return { addMutation, deleteMutation };
}
```

- [ ] **Passo 6: Verificar manualmente**

Iniciar uma vistoria e confirmar toast verde "Vistoria iniciada". Tentar finalizar sem todos os itens avaliados e confirmar toast vermelho.

- [ ] **Passo 7: Commit**

```bash
git add src/hooks/useStartVisit.ts src/hooks/useFinalizeVisit.ts src/hooks/useClaimReinspection.ts src/hooks/useNonConformity.ts src/hooks/usePhoto.ts
git commit -m "feat(toast): adicionar toasts de sucesso e erro nos hooks de mutação"
```

---

## Task 4: Substituir Alert.alert por toasts nas screens

**Files:**
- Modify: `src/components/visits/SignatureSheet.tsx`
- Modify: `src/screens/VisitDetailScreen.tsx`
- Modify: `src/screens/ChangePasswordScreen.tsx`

**Interfaces:**
- Consome: `showToast` de `@/lib/toast` (Task 2)

- [ ] **Passo 1: Atualizar `src/components/visits/SignatureSheet.tsx`**

Substituir os dois `Alert.alert` e adicionar import:

```tsx
import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';
import { reportService } from '@/services/visits.service';
import { showToast } from '@/lib/toast';

type Props = {
  visitId: number;
  onSaved: (signatureUrl: string) => void;
  onCancel: () => void;
};

export function SignatureSheet({ visitId, onSaved, onCancel }: Props) {
  const ref = useRef<SignatureViewRef>(null);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const HEADER_HEIGHT = 52;
  const FOOTER_HEIGHT = 72;
  const canvasHeight = screenHeight - insets.top - insets.bottom - HEADER_HEIGHT - FOOTER_HEIGHT;

  function handleOk(signature: string) {
    const base64 = signature.replace(/^data:image\/png;base64,/, '');
    setSaving(true);
    reportService
      .saveSignature(visitId, base64)
      .then((res) => {
        onSaved(res.signatureUrl ?? '');
      })
      .catch(() => showToast('error', 'Não foi possível salvar a assinatura'))
      .finally(() => setSaving(false));
  }

  function handleConfirm() {
    ref.current?.readSignature();
  }

  function handleClear() {
    ref.current?.clearSignature();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
      }}>
        <TouchableOpacity onPress={onCancel} hitSlop={12}>
          <Text style={{ fontSize: 16, color: '#737373' }}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1a1a1a' }}>Assinar vistoria</Text>
        <TouchableOpacity onPress={handleClear} hitSlop={12}>
          <Text style={{ fontSize: 16, color: '#737373' }}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: canvasHeight }}>
        <SignatureCanvas
          ref={ref}
          onOK={handleOk}
          onEmpty={() => showToast('info', 'Por favor, assine antes de confirmar')}
          descriptionText=""
          clearText="Limpar"
          confirmText="Confirmar"
          webStyle={`.m-signature-pad { box-shadow: none; border: none; width: 100%; height: 100%; } .m-signature-pad--footer { display: none; }`}
        />
      </View>

      <View style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 16),
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
      }}>
        {saving ? (
          <ActivityIndicator size="small" />
        ) : (
          <TouchableOpacity
            onPress={handleConfirm}
            style={{ backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Confirmar assinatura</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
```

- [ ] **Passo 2: Atualizar `src/screens/VisitDetailScreen.tsx` — toasts assinatura e PDF**

Adicionar import de `showToast`:
```tsx
import { showToast } from '@/lib/toast';
```

Substituir `handleSignatureSaved`:
```tsx
const handleSignatureSaved = useCallback(
  (_url: string) => {
    setPersistedSigned(true);
    setShowSignature(false);
    markSigned(id);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(id) });
    showToast('success', 'Assinatura salva');
  },
  [id, queryClient],
);
```

Substituir `handleDownloadReport`:
```tsx
const handleDownloadReport = useCallback(async () => {
  setIsDownloading(true);
  try {
    const base64 = await reportService.downloadReport(id);
    const path = `${FileSystem.documentDirectory}vistoria-${id}.pdf`;
    await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar Relatório' });
    showToast('success', 'Relatório baixado');
  } catch {
    showToast('error', 'Não foi possível gerar o relatório');
  } finally {
    setIsDownloading(false);
  }
}, [id]);
```

- [ ] **Passo 3: Atualizar `src/screens/ChangePasswordScreen.tsx`**

Adicionar import e substituir os dois `Alert.alert`:

```tsx
import { showToast } from '@/lib/toast';
```

Substituir o bloco `onSubmit`:
```tsx
const onSubmit = async (data: FormData) => {
  try {
    await authService.changePassword(data.currentPassword, data.newPassword);
    clearMustChangePassword();
    showToast('success', 'Senha alterada com sucesso');
    if (isVoluntary) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/visits');
    }
  } catch (error: unknown) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 401) {
      showToast('error', 'Senha atual incorreta');
    } else {
      showToast('error', 'Não foi possível alterar a senha');
    }
  }
};
```

- [ ] **Passo 4: Verificar manualmente**

Assinar uma vistoria finalizada e confirmar toast "Assinatura salva". Tentar baixar o PDF e confirmar toast "Relatório baixado". Alterar senha com senha incorreta e confirmar toast de erro.

- [ ] **Passo 5: Commit**

```bash
git add src/components/visits/SignatureSheet.tsx src/screens/VisitDetailScreen.tsx src/screens/ChangePasswordScreen.tsx
git commit -m "feat(toast): substituir Alert.alert por toasts nas screens"
```

---

## Task 5: Botão "Marcar todos como OK"

**Files:**
- Modify: `src/screens/RoomScreen.tsx`

**Interfaces:**
- Consome: `showToast` de `@/lib/toast` (Task 2)
- Consome: `visitsService.evaluateItem` de `@/services/visits.service`
- Consome: `QUERY_KEYS` de `@/lib/constants`
- Consome: `useQueryClient` de `@tanstack/react-query`

- [ ] **Passo 1: Atualizar imports em `src/screens/RoomScreen.tsx`**

```tsx
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
```

- [ ] **Passo 2: Adicionar state e handler em `RoomScreen`**

Dentro da função `RoomScreen`, após `const handleSheetClose`:

```tsx
const queryClient = useQueryClient();
const [markingAll, setMarkingAll] = useState(false);

const pendingItems = room?.items.filter((i) => i.status === null) ?? [];

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
```

- [ ] **Passo 3: Substituir linha "ITENS" por row com botão**

Substituir:
```tsx
<Text style={{ color: Colors.t3, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 1.08, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 }}>
  ITENS
</Text>
```

Por:
```tsx
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
```

- [ ] **Passo 4: Verificar manualmente**

Abrir um cômodo de vistoria ONGOING com itens pendentes. Confirmar que "✓ TODOS OK" aparece na linha do label. Pressionar e confirmar spinner durante e toast "Todos os itens marcados como OK" ao concluir.

- [ ] **Passo 5: Commit**

```bash
git add src/screens/RoomScreen.tsx
git commit -m "feat(room): adicionar botão de marcar todos os itens como OK"
```

---

## Task 6: Botão "Próximo cômodo"

**Files:**
- Modify: `src/screens/RoomScreen.tsx`

**Interfaces:**
- Consome: `useSafeAreaInsets` de `react-native-safe-area-context`
- Consome: `Button` de `@/components/ui`

- [ ] **Passo 1: Adicionar imports necessários em `src/screens/RoomScreen.tsx`**

Adicionar aos imports existentes (resultado das Tasks anteriores):
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
```

- [ ] **Passo 2: Calcular valores para o rodapé**

Dentro da função `RoomScreen`, após os valores já existentes (`isFinalized`, `evaluated`, `total`):

```tsx
const insets = useSafeAreaInsets();
const isOngoing = visit.status === 'ONGOING';
const allEvaluated = room.items.length > 0 && room.items.every((i) => i.status !== null);
const roomIndex = visit.rooms.findIndex((r) => r.id === roomId);
const nextRoom = visit.rooms[roomIndex + 1] ?? null;
```

- [ ] **Passo 3: Adicionar rodapé no JSX**

O `return` atual tem `<View style={styles.root}>` com `<SafeAreaView>` e `<EvaluationSheet>`. Adicionar o rodapé entre eles:

```tsx
return (
  <View style={styles.root}>
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ... conteúdo existente ... */}
    </SafeAreaView>

    {isOngoing && allEvaluated && (
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 16),
        borderTopWidth: 1,
        borderTopColor: Colors.border,
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
```

- [ ] **Passo 4: Verificar manualmente**

Avaliar todos os itens de um cômodo (todos como OK ou NOK+NC). Confirmar que o botão "PRÓXIMO CÔMODO → [Nome]" aparece no rodapé. Pressionar e confirmar navegação para o próximo cômodo sem empilhar histórico (pressionar voltar no próximo cômodo vai para VisitDetail, não para o cômodo anterior). No último cômodo, confirmar que o botão mostra "← VOLTAR À VISTORIA" e navega de volta.

- [ ] **Passo 5: Commit**

```bash
git add src/screens/RoomScreen.tsx
git commit -m "feat(room): adicionar botão de próximo cômodo no rodapé"
```

---

## Self-review

**Cobertura da spec:**
- ✅ Tab bar safe area dinâmica (Task 1)
- ✅ Toast system com componente dark-themed (Task 2)
- ✅ Toasts em todas as ações listadas na spec (Tasks 3, 4)
- ✅ "Marcar todos como OK" na linha do label ITENS, só em ONGOING (Task 5)
- ✅ "Próximo cômodo" no rodapé quando todos avaliados em ONGOING (Task 6)
- ✅ `router.replace` (não `push`) na navegação entre cômodos (Task 6)
- ✅ Safe area no rodapé "próximo cômodo" com `Math.max(insets.bottom, 16)` (Task 6)

**Placeholders:** nenhum encontrado — todas as etapas têm código completo.

**Consistência de tipos:** `showToast` definido em Task 2, consumido identicamente em Tasks 3, 4, 5. `pendingItems` definido em Task 5 Passo 2 e consumido no Passo 3. `nextRoom`, `allEvaluated`, `insets` definidos em Task 6 Passo 2 e consumidos no Passo 3.
