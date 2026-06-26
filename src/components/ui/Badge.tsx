import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
}

export function Badge({ label, color, backgroundColor }: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor,
        borderWidth: 1,
        borderColor: color,
        borderRadius: 50,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontSize: 11,
          fontFamily: 'IBMPlexSans_600SemiBold',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
