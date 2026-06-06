import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  if (!hasHydrated) return <Spinner fullScreen />;
  return <Redirect href={token ? '/(app)/(tabs)/visits' : '/(auth)/login'} />;
}
