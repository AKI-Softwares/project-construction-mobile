import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Spinner({ size = 'large', fullScreen = false }: SpinnerProps) {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size={size} color={colors.teal} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={colors.teal} />;
}
