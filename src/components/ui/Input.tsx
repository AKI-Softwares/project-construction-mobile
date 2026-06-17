import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const isPassword = secureTextEntry === true;

  return (
    <View className="gap-1.5">
      <Text className="text-[9px] font-mono-semibold text-t3 uppercase tracking-[0.14em]">
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !visible : false}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholderTextColor={Colors.t3}
          className="w-full rounded-md bg-bg3 text-sm text-t1"
          style={{
            borderWidth: 1,
            borderColor: focused ? Colors.amber : Colors.border,
            fontFamily: 'IBMPlexSans_400Regular',
            paddingHorizontal: 14,
            paddingVertical: 12,
            paddingRight: isPassword ? 44 : 14,
          }}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.t3}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="text-[11px] text-nc">{error}</Text>
      ) : null}
    </View>
  );
}
