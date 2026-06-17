import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { z } from 'zod';
import { decodeJwtPayload } from '@/lib/jwt';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginScreen() {
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
    <SafeAreaView className="flex-1 bg-bg1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ornamento superior direito */}
          <View className="absolute right-6 top-12 opacity-20">
            {[48, 36, 24, 12].map((size) => (
              <View
                key={size}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 1,
                  borderColor: '#344456',
                  position: 'absolute',
                  top: (48 - size) / 2,
                  left: (48 - size) / 2,
                }}
              />
            ))}
          </View>

          {/* Conteúdo central */}
          <View className="flex-1 justify-center px-7">
            {/* Wordmark */}
            <View className="mb-10">
              <View className="mb-3 flex-row items-center gap-1.5">
                <View
                  className="bg-amber"
                  style={{ width: 7, height: 7, borderRadius: 2, transform: [{ rotate: '45deg' }] }}
                />
                <Text className="font-mono text-[9px] text-t3 uppercase tracking-[0.14em]">
                  Sistema de Vistoria Técnica
                </Text>
              </View>

              <View className="flex-row">
                <Text style={{ fontSize: 38, fontFamily: 'IBMPlexSans_700Bold', color: '#EDF0F5', letterSpacing: -1.5, lineHeight: 42 }}>
                  Check
                </Text>
                <Text style={{ fontSize: 38, fontFamily: 'IBMPlexSans_700Bold', color: '#E8920C', letterSpacing: -1.5, lineHeight: 42 }}>
                  Obra
                </Text>
              </View>

              <View className="mt-3 flex-row items-center gap-1.5">
                <View className="bg-amber h-0.5 w-9 rounded" />
                <View className="bg-t3 h-0.5 w-2.5 rounded opacity-50" />
              </View>
            </View>

            {/* Formulário */}
            <View className="gap-4">
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

              <View className="mt-2">
                <Button
                  label={isSubmitting ? 'Autenticando...' : 'Entrar'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  fullWidth
                />
              </View>

              <Pressable
                className="mt-4 items-center"
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text className="border-b border-border pb-0.5 text-xs text-t2">
                  Esqueci minha senha
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Rodapé */}
          <View className="flex-row justify-between px-7 pb-8">
            <Text className="font-mono text-[9px] text-t3 tracking-[0.06em]">v1.0.0</Text>
            <Text className="font-mono text-[9px] text-t3 tracking-[0.04em]">AKI Softwares</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
