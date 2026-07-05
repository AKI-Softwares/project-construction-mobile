import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { pushService } from '@/services/visits.service';
import { useAuthStore } from '@/store/auth.store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token || Platform.OS !== 'android') return;

    let registered = false;

    async function register() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const projectId = (
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId
      ) as string;
      const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
      await pushService.saveToken(pushToken.data).catch(() => {});
      registered = true;
    }

    register();

    return () => {
      if (registered) {
        pushService.removeToken().catch(() => {});
      }
    };
  }, [token]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { visitId?: number };
      if (data?.visitId) {
        router.push(`/(app)/visits/${data.visitId}` as any);
      }
    });
    return () => sub.remove();
  }, [router]);
}
