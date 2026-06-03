import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg1">
      <View className="flex-1 items-center justify-center gap-6 px-7">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-amber">
          <Text className="text-xl font-sans-bold text-bg1">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>

        <View className="items-center gap-1">
          <Text className="text-base font-sans-semibold text-t1">{user?.name}</Text>
          <Text className="text-xs text-t2">{user?.email}</Text>
          <Text className="mt-1 font-mono text-[10px] text-t3 uppercase tracking-[0.08em]">
            {user?.role.name}
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          className="rounded-md border border-nc px-8 py-3"
        >
          <Text className="text-xs font-sans-bold uppercase tracking-widest text-nc">
            Sair
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
