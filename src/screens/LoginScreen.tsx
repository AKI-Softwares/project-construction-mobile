import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { decodeJwtPayload } from '@/lib/jwt';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/hooks/useTheme';
import { NavColors } from '@/theme/colors';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginScreen() {
  const { colors } = useTheme();
  const login = useAuthStore((s) => s.login);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { token } = await authService.login(data);
      const user = await authService.getMe(token);
      const { mustChangePassword } = decodeJwtPayload(token);
      login(token, user, mustChangePassword);
      if (mustChangePassword) {
        router.replace('/(auth)/change-password');
      } else {
        router.replace('/(app)/(tabs)/visits');
      }
    } catch (error: unknown) {
      const status = (error as AxiosError)?.response?.status;
      if (status === 401) {
        Alert.alert('Erro', 'Credenciais inválidas. Verifique e-mail e senha.');
      } else if (status === 403) {
        Alert.alert('Acesso bloqueado', 'Empresa inativa ou pendente de aprovação.');
      } else if (status === 429) {
        Alert.alert('Muitas tentativas', 'Aguarde um momento e tente novamente.');
      } else {
        Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor. Tente novamente.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Conteúdo central */}
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
            {/* Logo CHECKOBRA */}
            <View style={{ alignItems: 'center', marginBottom: 36 }}>
              <View style={{ position: 'relative', width: 80, height: 80, marginBottom: 12 }}>
                <Ionicons name="search" size={80} color={colors.teal} />
                <View style={{ position: 'absolute', top: 14, left: 16 }}>
                  <Ionicons name="bar-chart" size={36} color={NavColors.navBg} />
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 28, fontFamily: 'IBMPlexSans_700Bold', color: colors.teal }}>CHECK</Text>
                <Text style={{ fontSize: 28, fontFamily: 'IBMPlexSans_700Bold', color: colors.t1 }}>OBRA</Text>
              </View>
              <Text style={{ color: colors.t2, fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', marginTop: 4, letterSpacing: 2 }}>
                INSPETOR
              </Text>
            </View>

            {/* Formulário */}
            <View style={{ gap: 16 }}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Senha"
                    placeholder="••••••••"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />
              <View style={{ marginTop: 8 }}>
                <Button
                  label={isSubmitting ? 'Autenticando...' : 'Entrar'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  fullWidth
                />
              </View>
              <Pressable
                style={{ marginTop: 8, alignItems: 'center' }}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={{ color: colors.teal, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular' }}>
                  Esqueceu a senha?
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Rodapé */}
          <View style={{ alignItems: 'center', paddingBottom: 24 }}>
            <Text style={{ color: colors.t3, fontSize: 11, fontFamily: 'IBMPlexSans_400Regular' }}>
              AKI Softwares
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
