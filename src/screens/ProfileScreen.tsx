import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme/colors';
import { useAuthStore } from '@/store/auth.store';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/(auth)/login' as any);
  }, [logout, router]);

  const initials = user?.name ? getInitials(user.name) : '?';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{user?.name ?? ''}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          {user?.role?.name ? (
            <Text style={styles.role}>{user.role.name.toUpperCase()}</Text>
          ) : null}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>SESSÃO</Text>

        <Pressable
          onPress={() => router.push('/(app)/change-password?from=profile' as any)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>ALTERAR SENHA</Text>
        </Pressable>

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>SAIR</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: Colors.bg1,
    fontSize: 20,
    fontFamily: 'IBMPlexSans_700Bold',
    letterSpacing: 1,
  },
  info: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 28,
  },
  name: {
    color: Colors.t1,
    fontSize: 18,
    fontFamily: 'IBMPlexSans_600SemiBold',
  },
  email: {
    color: Colors.t2,
    fontSize: 13,
    fontFamily: 'IBMPlexMono_400Regular',
  },
  role: {
    color: Colors.t3,
    fontSize: 10,
    fontFamily: 'IBMPlexMono_600SemiBold',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    color: Colors.t3,
    fontSize: 9,
    fontFamily: 'IBMPlexMono_600SemiBold',
    letterSpacing: 1.08,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  actionButton: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: Colors.t2,
    fontSize: 11,
    fontFamily: 'IBMPlexSans_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  logoutButton: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.nc,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.nc,
    fontSize: 11,
    fontFamily: 'IBMPlexSans_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
