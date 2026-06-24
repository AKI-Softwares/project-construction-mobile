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
