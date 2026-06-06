import { Redirect } from 'expo-router';
import { Spinner } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';

// Rota de entrada ("/"). Sem ela o app inicia em uma URL que não casa com
// nenhuma rota (todas estão sob os grupos (auth)/(app)) e cai no +not-found.
export default function Index() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const token = useAuthStore((s) => s.token);

  // Aguarda a reidratação do SecureStore antes de decidir o destino.
  if (!hasHydrated) return <Spinner fullScreen />;

  return <Redirect href={token ? '/(app)/(tabs)/visits' : '/(auth)/login'} />;
}
