import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { showToast } from '@/lib/toast';

const schema = z.object({
  currentPassword: z.string().min(1, 'Obrigatório'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function ChangePasswordScreen() {
  const clearMustChangePassword = useAuthStore((s) => s.clearMustChangePassword);
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isVoluntary = from === 'profile';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      clearMustChangePassword();
      showToast('success', 'Senha alterada com sucesso');
      if (isVoluntary) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)/visits');
      }
    } catch (error: unknown) {
      const status = (error as AxiosError)?.response?.status;
      if (status === 401) {
        showToast('error', 'Senha atual incorreta');
      } else {
        showToast('error', 'Não foi possível alterar a senha');
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
                Alterar Senha
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'IBMPlexSans_400Regular',
                  color: '#7D8FA3',
                  lineHeight: 18,
                }}
              >
                {isVoluntary
                  ? 'Digite sua senha atual e escolha uma nova senha.'
                  : 'Para sua segurança, defina uma nova senha antes de continuar.'}
              </Text>
            </View>

            <View className="gap-4">
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Senha atual"
                    placeholder="••••••••"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.currentPassword?.message}
                  />
                )}
              />

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
