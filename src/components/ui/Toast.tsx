import { BaseToast, type BaseToastProps } from 'react-native-toast-message';
import type { ThemeColors } from '@/theme/colors';

export function buildToastConfig(colors: ThemeColors) {
  const text1Style = {
    fontSize: 13,
    fontFamily: 'IBMPlexSans_400Regular',
    color: colors.t1,
    flexShrink: 1 as const,
  };

  const baseContainer = {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    minHeight: 48,
    height: undefined as undefined,
  };

  return {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ ...baseContainer, borderLeftColor: colors.ok }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Style={text1Style}
        text2={undefined}
      />
    ),
    error: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ ...baseContainer, borderLeftColor: colors.nc }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Style={text1Style}
        text2={undefined}
      />
    ),
    info: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{ ...baseContainer, borderLeftColor: colors.teal }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Style={text1Style}
        text2={undefined}
      />
    ),
  };
}
