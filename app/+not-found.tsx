import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.t1, fontSize: 16, fontFamily: 'IBMPlexSans_400Regular' }}>
          Tela não encontrada.
        </Text>
        <Link href="/(app)/(tabs)/visits" style={{ marginTop: 16, color: colors.teal }}>
          Voltar ao início
        </Link>
      </View>
    </>
  );
}
