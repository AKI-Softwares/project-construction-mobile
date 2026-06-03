import { ActivityIndicator, Pressable, Text } from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-amber border border-amber',
    text: 'text-bg1',
  },
  outline: {
    container: 'bg-transparent border border-amber',
    text: 'text-amber',
  },
  ghost: {
    container: 'bg-transparent border border-border',
    text: 'text-t2',
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center rounded-md px-4 py-[14px]',
        styles.container,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#0F1520' : '#E8920C'}
        />
      ) : (
        <Text
          className={[
            'text-xs font-sans-bold tracking-widest uppercase',
            styles.text,
          ].join(' ')}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
