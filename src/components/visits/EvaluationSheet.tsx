import { memo, useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/theme/colors';
import { Button } from '@/components/ui';
import { NCForm } from './NCForm';
import { useEvaluateItem } from '@/hooks/useEvaluateItem';
import { nonConformitiesService } from '@/services/non-conformities.service';
import { photosService } from '@/services/photos.service';
import { QUERY_KEYS } from '@/lib/constants';
import type { VisitItem } from '@/types/visit.types';
import type { NCDraft } from '@/types/nc.types';

type SheetState = 'eval' | 'nc-form';

const EMPTY_DRAFT: NCDraft = {
  description: '',
  localPhotos: [],
  existingPhotos: [],
  removedPhotoIds: [],
};

function initDraft(item: VisitItem): NCDraft {
  return {
    description: item.nonConformity?.description ?? '',
    localPhotos: [],
    existingPhotos: item.nonConformity?.photos ?? [],
    removedPhotoIds: [],
  };
}

interface Props {
  item: VisitItem | null;
  visitId: number;
  onClose: () => void;
  isFinalized?: boolean;
}

export const EvaluationSheet = memo(function EvaluationSheet({
  item,
  visitId,
  onClose,
  isFinalized = false,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%', '85%'], []);
  const queryClient = useQueryClient();

  const [sheetState, setSheetState] = useState<SheetState>('eval');
  const [ncDraft, setNcDraft] = useState<NCDraft>(EMPTY_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<'OK' | 'NOK' | null>(null);

  const {
    mutate: evalMutate,
    isPending: isEvalPending,
    error: evalError,
    reset: resetEval,
  } = useEvaluateItem(visitId);

  useEffect(() => {
    if (item) {
      resetEval();
      setPendingStatus(null);
      setValidationError(null);
      setIsSaving(false);

      if (item.status === 'NOK' || isFinalized) {
        setNcDraft(initDraft(item));
        setSheetState('nc-form');
        sheetRef.current?.snapToIndex(1);
      } else {
        setNcDraft(EMPTY_DRAFT);
        setSheetState('eval');
        sheetRef.current?.snapToIndex(0);
      }
    } else {
      sheetRef.current?.close();
    }
  }, [item, isFinalized, resetEval]);

  const handleClose = useCallback(() => {
    if (
      sheetState === 'nc-form' &&
      item?.nonConformity == null &&
      ncDraft.description.trim() === '' &&
      ncDraft.localPhotos.length === 0 &&
      !isFinalized
    ) {
      evalMutate({ itemId: item!.id, status: null });
    }
    onClose();
  }, [sheetState, item, ncDraft, isFinalized, evalMutate, onClose]);

  const handleOK = useCallback(() => {
    if (!item || isEvalPending) return;
    setPendingStatus('OK');
    evalMutate(
      { itemId: item.id, status: 'OK' },
      {
        onSuccess: () => { setPendingStatus(null); onClose(); },
        onError: () => setPendingStatus(null),
      },
    );
  }, [item, evalMutate, isEvalPending, onClose]);

  const handleNOK = useCallback(() => {
    if (!item || isEvalPending) return;

    if (item.status === 'NOK') {
      setNcDraft(initDraft(item));
      setSheetState('nc-form');
      sheetRef.current?.snapToIndex(1);
      return;
    }

    setPendingStatus('NOK');
    evalMutate(
      { itemId: item.id, status: 'NOK' },
      {
        onSuccess: () => {
          setPendingStatus(null);
          setNcDraft(EMPTY_DRAFT);
          setSheetState('nc-form');
          sheetRef.current?.snapToIndex(1);
        },
        onError: () => setPendingStatus(null),
      },
    );
  }, [item, evalMutate, isEvalPending]);

  const handleSave = useCallback(async () => {
    if (!item || isSaving || isFinalized) return;

    const totalPhotos =
      ncDraft.localPhotos.length +
      ncDraft.existingPhotos.length -
      ncDraft.removedPhotoIds.length;

    if (ncDraft.description.trim() === '') {
      setValidationError('Descrição é obrigatória');
      return;
    }
    if (totalPhotos < 1) {
      setValidationError('Adicione ao menos 1 foto');
      return;
    }

    setIsSaving(true);
    setValidationError(null);

    try {
      if (!item.nonConformity) {
        const nc = await nonConformitiesService.create(item.id, ncDraft.description.trim());
        for (const photo of ncDraft.localPhotos) {
          await photosService.add(nc.id, photo);
        }
      } else {
        const ncId = item.nonConformity.id;
        if (ncDraft.description.trim() !== item.nonConformity.description) {
          await nonConformitiesService.patch(ncId, ncDraft.description.trim());
        }
        for (const photoId of ncDraft.removedPhotoIds) {
          await photosService.remove(photoId);
        }
        for (const photo of ncDraft.localPhotos) {
          await photosService.add(ncId, photo);
        }
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIT_DETAIL(visitId) });
      onClose();
    } catch {
      setValidationError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [item, ncDraft, visitId, queryClient, isSaving, isFinalized, onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) =>
      item ? (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ) : null,
    [item],
  );

  const apiError = evalError as AxiosError<{ message: string }> | null;
  const evalErrorMessage = apiError?.response?.data?.message ?? null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={(index) => { if (index === -1) handleClose(); }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.bg2 }}
      handleIndicatorStyle={{ backgroundColor: Colors.t3 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
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

        {sheetState === 'eval' && (
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <Pressable
              onPress={handleOK}
              disabled={isEvalPending}
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
              {isEvalPending && pendingStatus === 'OK' ? (
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

            <Pressable
              onPress={handleNOK}
              disabled={isEvalPending}
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
              {isEvalPending && pendingStatus === 'NOK' ? (
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
        )}

        {sheetState === 'nc-form' && (
          <NCForm
            value={ncDraft}
            onChange={setNcDraft}
            disabled={isFinalized || isSaving}
          />
        )}

        {validationError != null && (
          <Text
            style={{
              color: Colors.nc,
              fontSize: 12,
              fontFamily: 'IBMPlexSans_400Regular',
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {validationError}
          </Text>
        )}

        {evalErrorMessage != null && sheetState === 'eval' && (
          <Text
            style={{
              color: Colors.nc,
              fontSize: 12,
              fontFamily: 'IBMPlexSans_400Regular',
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {evalErrorMessage}
          </Text>
        )}

        {sheetState === 'nc-form' && !isFinalized && (
          <View style={{ marginTop: 20 }}>
            <Button
              label="SALVAR"
              onPress={handleSave}
              loading={isSaving}
              fullWidth
            />
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
