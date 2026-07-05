import '../src/lib/polyfills';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  IBMPlexSans_300Light,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
  useFonts as usePlexSans,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  useFonts as usePlexMono,
} from '@expo-google-fonts/ibm-plex-mono';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colorScheme } from 'react-native-css-interop';
import { useThemeStore } from '@/store/theme.store';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

export default function RootLayout() {
  const [sansLoaded, sansError] = usePlexSans({
    IBMPlexSans_300Light,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  const [monoLoaded, monoError] = usePlexMono({
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  const fontError = sansError ?? monoError;
  const loaded = sansLoaded && monoLoaded;
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, fontError]);

  useEffect(() => {
    colorScheme.set(isDark ? 'dark' : 'light');
  }, [isDark]);

  if (!loaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
