import { Redirect, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Spinner } from '@/components/ui/Spinner';
import { buildToastConfig } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTheme } from '@/hooks/useTheme';

function AppLayoutInner() {
  const { colors } = useTheme();
  usePushNotifications();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={buildToastConfig(colors)} topOffset={60} />
    </>
  );
}

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) return <Spinner fullScreen />;
  if (!token) return <Redirect href="/(auth)/login" />;

  return <AppLayoutInner />;
}
