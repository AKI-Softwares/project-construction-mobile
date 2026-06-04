import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function VisitDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 bg-bg1">
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="font-mono text-[9px] text-t3 uppercase tracking-[0.12em]">
          Spec M-3
        </Text>
        <Text className="text-base font-sans-semibold text-t1">
          Visita #{id}
        </Text>
        <Text className="text-xs text-t2">Em construção</Text>
      </View>
    </SafeAreaView>
  );
}
