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
        borderRadius: 3,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontSize: 10,
          fontFamily: 'IBMPlexMono_600SemiBold',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
