import { ActivityIndicator, View } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Spinner({ size = 'large', fullScreen = false }: SpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-bg1">
        <ActivityIndicator size={size} color="#E8920C" />
      </View>
    );
  }
  return <ActivityIndicator size={size} color="#E8920C" />;
}
