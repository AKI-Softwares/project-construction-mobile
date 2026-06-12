import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';

const schema = z.object({
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '' },
  });

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-bg1">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>
          <Text style={{ color: '#EDF0F5', fontSize: 18, fontFamily: 'IBMPlexSans_600SemiBold', marginBottom: 8 }}>
            Link inválido
          </Text>
          <Text style={{ color: '#7D8FA3', fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', textAlign: 'center', marginBottom: 24 }}>
            Este link de redefinição não é válido. Solicite um novo pelo app.
          </Text>
          <Button label="Ir para o login" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await authService.resetPassword(token, data.newPassword);
      Alert.alert(
        'Senha redefinida',
        'Sua senha foi atualizada. Faça login com a nova senha.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    } catch (error: unknown) {
      const status = (error as AxiosError)?.response?.status;
      if (status === 400) {
        Alert.alert('Link expirado', 'Este link de redefinição expirou ou já foi usado. Solicite um novo.');
      } else {
        Alert.alert('Erro', 'Não foi possível redefinir a senha. Tente novamente.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-7">
            <View className="mb-10">
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: 'IBMPlexSans_700Bold',
                  color: '#EDF0F5',
                  letterSpacing: -0.5,
                  marginBottom: 8,
                }}
              >
                Nova Senha
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'IBMPlexSans_400Regular',
                  color: '#7D8FA3',
                  lineHeight: 18,
                }}
              >
                Escolha uma nova senha para sua conta.
              </Text>
            </View>

            <View className="gap-4">
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nova senha"
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.newPassword?.message}
                  />
                )}
              />

              <View className="mt-2">
                <Button
                  label={isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
