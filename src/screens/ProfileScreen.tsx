import { useCallback } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NavColors } from '@/theme/colors';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth.store';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { colors, isDark, toggle } = useTheme();

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/(auth)/login' as any);
  }, [logout, router]);

  const initials = user?.name ? getInitials(user.name) : '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Tab header — sem back arrow */}
      <View style={{ backgroundColor: NavColors.navBg, paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ color: NavColors.tNav, fontSize: 20, fontFamily: 'IBMPlexSans_600SemiBold' }}>
          Perfil
        </Text>
      </View>

      {/* Content area */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
        {/* Avatar */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.teal,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: colors.bg,
              fontSize: 20,
              fontFamily: 'IBMPlexSans_700Bold',
              letterSpacing: 1,
            }}
          >
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={{ alignItems: 'center', gap: 4, marginBottom: 28 }}>
          <Text style={{ color: colors.t1, fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold' }}>
            {user?.name ?? ''}
          </Text>
          <Text style={{ color: colors.t2, fontSize: 13, fontFamily: 'IBMPlexMono_400Regular' }}>
            {user?.email ?? ''}
          </Text>
          {user?.role?.name ? (
            <Text
              style={{
                color: colors.t3,
                fontSize: 10,
                fontFamily: 'IBMPlexMono_600SemiBold',
                letterSpacing: 0.8,
                marginTop: 4,
              }}
            >
              {user.role.name.toUpperCase()}
            </Text>
          ) : null}
        </View>

        {/* Divider */}
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: colors.border,
            marginBottom: 20,
          }}
        />

        {/* Seção: Aparência */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginTop: 0,
            marginBottom: 20,
            overflow: 'hidden',
            alignSelf: 'stretch',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View>
              <Text style={{ color: colors.t1, fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold' }}>
                Tema escuro
              </Text>
              <Text
                style={{
                  color: colors.t2,
                  fontSize: 12,
                  fontFamily: 'IBMPlexSans_400Regular',
                  marginTop: 2,
                }}
              >
                {isDark ? 'Ativado' : 'Desativado'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.tealDim }}
              thumbColor={isDark ? colors.teal : colors.t3}
            />
          </View>
        </View>

        {/* Seção: Sessão */}
        <Text
          style={{
            alignSelf: 'flex-start',
            color: colors.t3,
            fontSize: 9,
            fontFamily: 'IBMPlexMono_600SemiBold',
            letterSpacing: 1.08,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          SESSÃO
        </Text>

        <Pressable
          onPress={() => router.push('/(app)/change-password?from=profile' as any)}
          style={{
            alignSelf: 'stretch',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            paddingVertical: 12,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: colors.t2,
              fontSize: 11,
              fontFamily: 'IBMPlexSans_700Bold',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            ALTERAR SENHA
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={{
            alignSelf: 'stretch',
            borderWidth: 1,
            borderColor: colors.nc,
            borderRadius: 6,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.nc,
              fontSize: 11,
              fontFamily: 'IBMPlexSans_700Bold',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            SAIR
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
