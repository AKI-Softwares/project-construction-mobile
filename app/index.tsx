import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  if (!hasHydrated) return <Spinner fullScreen />;
  if (!token) return <Redirect href="/(auth)/login" />;
  if (mustChangePassword) return <Redirect href="/(auth)/change-password" />;
  return <Redirect href="/(app)/(tabs)/visits" />;
}
