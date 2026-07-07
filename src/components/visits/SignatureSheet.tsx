import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';
import { reportService } from '@/services/visits.service';
import { showToast } from '@/lib/toast';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  visitId: number;
  onSaved: (signatureUrl: string) => void;
  onCancel?: () => void;
};

export function SignatureSheet({ visitId, onSaved, onCancel }: Props) {
  const ref = useRef<SignatureViewRef>(null);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { colors } = useTheme();

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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        {onCancel ? (
          <Pressable onPress={onCancel} hitSlop={12}>
            <Text style={{ fontSize: 16, color: colors.t2 }}>Cancelar</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.t1 }}>Assinar vistoria</Text>
        <Pressable onPress={handleClear} hitSlop={12}>
          <Text style={{ fontSize: 16, color: colors.t2 }}>Limpar</Text>
        </Pressable>
      </View>

      <View style={{ height: canvasHeight, backgroundColor: '#fff' }}>
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
        borderTopColor: colors.border,
      }}>
        {saving ? (
          <ActivityIndicator size="small" />
        ) : (
          <Pressable
            onPress={handleConfirm}
            style={{ backgroundColor: colors.teal, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Confirmar assinatura</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
