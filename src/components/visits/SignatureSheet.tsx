import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import SignatureCanvas, { type SignatureViewRef } from 'react-native-signature-canvas';
import { reportService } from '@/services/visits.service';

type Props = {
  visitId: number;
  onSaved: (signatureUrl: string) => void;
  onCancel: () => void;
};

export function SignatureSheet({ visitId, onSaved, onCancel }: Props) {
  const ref = useRef<SignatureViewRef>(null);
  const [saving, setSaving] = useState(false);

  function handleOk(signature: string) {
    const base64 = signature.replace(/^data:image\/png;base64,/, '');
    setSaving(true);
    reportService
      .saveSignature(visitId, base64)
      .then((res) => {
        if (res.signatureUrl) onSaved(res.signatureUrl);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível salvar a assinatura.'))
      .finally(() => setSaving(false));
  }

  function handleConfirm() {
    ref.current?.readSignature();
  }

  function handleClear() {
    ref.current?.clearSignature();
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-200">
        <TouchableOpacity onPress={onCancel}>
          <Text className="text-base text-neutral-500">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-neutral-800">Assinar vistoria</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text className="text-base text-neutral-500">Limpar</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <SignatureCanvas
          ref={ref}
          onOK={handleOk}
          onEmpty={() => Alert.alert('Atenção', 'Por favor, assine antes de confirmar.')}
          descriptionText="Assine no espaço abaixo"
          clearText="Limpar"
          confirmText="Confirmar"
          webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--footer { display: none; }`}
        />
      </View>

      <View className="px-4 py-4 border-t border-neutral-200">
        {saving ? (
          <ActivityIndicator size="small" />
        ) : (
          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-amber-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">Confirmar assinatura</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
