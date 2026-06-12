import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View className="flex-1 items-center justify-center bg-bg1">
        <Text className="text-base text-t1">Tela não encontrada.</Text>
        <Link href="/(app)/(tabs)/visits" className="mt-4 text-amber">
          Voltar ao início
        </Link>
      </View>
    </>
  );
}
