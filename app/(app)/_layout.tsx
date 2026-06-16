import { Redirect, Stack } from 'expo-router';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth.store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function AppLayoutInner() {
  usePushNotifications();
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return <Spinner fullScreen />;
  if (!token) return <Redirect href="/(auth)/login" />;

  return <AppLayoutInner />;
}
