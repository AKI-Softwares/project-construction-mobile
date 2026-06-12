import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordScreen() {
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email);
    } finally {
      // sempre mostra sucesso — nunca revela se email existe ou se houve erro de rede
      setSubmitted(true);
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
                Recuperar Senha
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'IBMPlexSans_400Regular',
                  color: '#7D8FA3',
                  lineHeight: 18,
                }}
              >
                {submitted
                  ? 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'
                  : 'Informe seu e-mail para receber as instruções de recuperação.'}
              </Text>
            </View>

            {!submitted && (
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

                <View className="mt-2">
                  <Button
                    label={isSubmitting ? 'Enviando...' : 'Enviar instruções'}
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    fullWidth
                  />
                </View>
              </View>
            )}

            <Pressable
              className="mt-8 items-center"
              onPress={() => router.back()}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'IBMPlexSans_400Regular',
                  color: '#7D8FA3',
                }}
              >
                Voltar ao login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
