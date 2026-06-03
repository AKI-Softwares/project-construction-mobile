import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Colors } from '@/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="text-[9px] font-mono-semibold text-t3 uppercase tracking-[0.14em]">
        {label}
      </Text>
      <TextInput
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        placeholderTextColor={Colors.t3}
        className="w-full rounded-md bg-bg3 px-[14px] py-3 text-sm text-t1"
        style={{
          borderWidth: 1,
          borderColor: focused ? Colors.amber : Colors.border,
          fontFamily: 'IBMPlexSans_400Regular',
        }}
      />
      {error ? (
        <Text className="text-[11px] text-nc">{error}</Text>
      ) : null}
    </View>
  );
}
