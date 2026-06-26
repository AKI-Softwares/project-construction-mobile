import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const containerStyle = (() => {
    if (isDisabled && !loading) return { backgroundColor: colors.border, borderColor: colors.border };
    if (variant === 'primary') return { backgroundColor: colors.teal, borderColor: colors.teal };
    if (variant === 'outline') return { backgroundColor: 'transparent', borderColor: colors.teal };
    return { backgroundColor: 'transparent', borderColor: colors.border };
  })();

  const textColor = (() => {
    if (isDisabled && !loading) return colors.t3;
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'outline') return colors.teal;
    return colors.t2;
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 50,
          borderWidth: 1,
          paddingHorizontal: 20,
          paddingVertical: 14,
          ...containerStyle,
        },
        fullWidth && { width: '100%' },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#FFFFFF' : colors.teal} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: 13,
            fontFamily: 'IBMPlexSans_600SemiBold',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
