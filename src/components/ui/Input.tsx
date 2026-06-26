import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, ...props }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          color: colors.t2,
          fontSize: 13,
          fontFamily: 'IBMPlexSans_400Regular',
        }}
      >
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !visible : false}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholderTextColor={colors.t3}
          style={{
            width: '100%',
            borderRadius: 50,
            backgroundColor: colors.inputBg,
            borderWidth: focused ? 1.5 : 1,
            borderColor: focused ? colors.teal : 'transparent',
            color: colors.t1,
            fontFamily: 'IBMPlexSans_400Regular',
            fontSize: 15,
            paddingHorizontal: 20,
            paddingVertical: 13,
            paddingRight: isPassword ? 48 : 20,
          }}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.t2} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={{ fontSize: 11, color: colors.nc, fontFamily: 'IBMPlexSans_400Regular' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
