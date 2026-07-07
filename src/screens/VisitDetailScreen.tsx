import { useCallback, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/ui/AppHeader';
import { Spinner, Button, ProgressBar } from '@/components/ui';
import { VisitHeader } from '@/components/visits/VisitHeader';
import { RoomCard } from '@/components/visits/RoomCard';
import { SignatureSheet } from '@/components/visits/SignatureSheet';
import { useVisitDetail } from '@/hooks/useVisitDetail';
import { useStartVisit } from '@/hooks/useStartVisit';
import { useFinalizeVisit } from '@/hooks/useFinalizeVisit';
import { useClaimReinspection } from '@/hooks/useClaimReinspection';
import { reportService } from '@/services/visits.service';
import { showToast, apiErrorMessage } from '@/lib/toast';


interface Props {
  id: number;
}

export function VisitDetailScreen({ id }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: visit, isLoading, isError, refetch } = useVisitDetail(id);
  const { mutate: startVisit, isPending: isStartPending } = useStartVisit(id);
  const { mutate: finalizeVisit, isPending: isFinalizePending } = useFinalizeVisit(id, {
    onSuccess: () => setShowSignature(true),
  });
  const { mutate: claimReinspection, isPending: isClaimPending } = useClaimReinspection(id);
  const [showSignature, setShowSignature] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleStart = useCallback(() => startVisit(), [startVisit]);
  const handleFinalize = useCallback(() => finalizeVisit(), [finalizeVisit]);
  const handleClaim = useCallback(() => claimReinspection(), [claimReinspection]);

  const handleSignatureSaved = useCallback(
    (_url: string) => {
      setShowSignature(false);
      showToast('success', 'Assinatura salva');
      router.replace('/(app)/(tabs)/visits' as any);
    },
    [router],
  );

  const handleDownloadReport = useCallback(async () => {
    setIsDownloading(true);
    try {
      const base64 = await reportService.downloadReport(id);
      const path = `${FileSystem.documentDirectory}vistoria-${id}.pdf`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar Relatório' });
      showToast('success', 'Relatório baixado');
    } catch (err) {
      showToast('error', apiErrorMessage(err, 'Não foi possível gerar o relatório'));
    } finally {
      setIsDownloading(false);
    }
  }, [id]);

  const handleRoomPress = useCallback(
    (roomId: number) => router.push(`/(app)/visits/${id}/rooms/${roomId}` as any),
    [id, router],
  );

  if (isLoading) return <Spinner fullScreen />;

  if (isError || !visit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
            Erro ao carregar vistoria
          </Text>
          <Button label="TENTAR NOVAMENTE" onPress={() => refetch()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const isNotStarted = visit.status === 'NOT_STARTED';
  const isOngoing = visit.status === 'ONGOING';
  const isFinalized = visit.status === 'FINALIZED';
  const isReinspection = visit.type === 'REINSPECTION';
  const isAvailable = isReinspection && visit.inspector === null;

  const completed = visit.rooms.filter((r) => r.isComplete).length;
  const total = visit.rooms.length;

  const allEvaluated = visit.rooms
    .flatMap((r) => r.items)
    .every((i) => i.status !== null);

  const showBottomBar = isAvailable || isNotStarted || isOngoing;

  return (
    <>
    <Modal visible={showSignature} animationType="slide" onRequestClose={() => setShowSignature(false)}>
      <SignatureSheet
        visitId={id}
        onSaved={handleSignatureSaved}
        onCancel={() => setShowSignature(false)}
      />
    </Modal>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <AppHeader title={`Apt. ${visit.apartment.identifier}`} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: showBottomBar ? 0 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        <VisitHeader visit={visit} />

        {isReinspection && (
          <View style={{
            marginHorizontal: 20, marginBottom: 12,
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: colors.tealDim,
            borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
          }}>
            <Text style={{ color: colors.teal, fontSize: 11, fontFamily: 'IBMPlexMono_600SemiBold' }}>
              ◆ RE-INSPEÇÃO
            </Text>
            <Text style={{ color: colors.t2, fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', flex: 1 }}>
              {isAvailable ? 'Disponível para assumir' : `Itens com NC da vistoria anterior`}
            </Text>
          </View>
        )}

        {(isOngoing || isFinalized) && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: colors.t2, fontSize: 12, fontFamily: 'IBMPlexMono_400Regular', marginBottom: 8 }}>
              {completed} de {total} ambientes concluídos
            </Text>
            <ProgressBar value={total > 0 ? completed / total : 0} />
          </View>
        )}

        <Text style={{ color: colors.t3, fontSize: 9, fontFamily: 'IBMPlexMono_600SemiBold', letterSpacing: 1.08, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 }}>
          AMBIENTES
        </Text>

        <View style={{ paddingHorizontal: 20 }}>
          {visit.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onPress={!isAvailable && (isOngoing || isFinalized) ? () => handleRoomPress(room.id) : undefined}
            />
          ))}
        </View>
      </ScrollView>

      {isAvailable && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button
            label="ASSUMIR RE-INSPEÇÃO"
            onPress={handleClaim}
            loading={isClaimPending}
            fullWidth
          />
        </View>
      )}

      {!isAvailable && isNotStarted && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button
            label={isReinspection ? 'INICIAR RE-INSPEÇÃO' : 'INICIAR VISTORIA'}
            onPress={handleStart}
            loading={isStartPending}
            fullWidth
          />
        </View>
      )}

      {isOngoing && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button
            label={isReinspection ? 'FINALIZAR RE-INSPEÇÃO' : 'FINALIZAR VISTORIA'}
            onPress={handleFinalize}
            loading={isFinalizePending}
            disabled={!allEvaluated}
            fullWidth
          />
        </View>
      )}

      {isFinalized && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
          {!visit.signatureUrl ? (
            <Button label="ASSINAR VISTORIA" onPress={() => setShowSignature(true)} fullWidth />
          ) : (
            <Pressable
              onPress={handleDownloadReport}
              disabled={isDownloading}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.border, borderRadius: 50,
                paddingVertical: 14, gap: 8, opacity: isDownloading ? 0.5 : 1,
              }}
            >
              {isDownloading
                ? <ActivityIndicator size="small" color={colors.t2} />
                : <Text style={{ color: colors.t1, fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold' }}>
                    ✓ Baixar relatório assinado
                  </Text>
              }
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
    </>
  );
}
