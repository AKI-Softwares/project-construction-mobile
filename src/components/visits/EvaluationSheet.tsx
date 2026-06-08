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
