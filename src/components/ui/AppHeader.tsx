import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NavColors } from '@/theme/colors';

interface Props {
  title: string;
  onBack?: () => void;
  backDisabled?: boolean;
}

export function AppHeader({ title, onBack, backDisabled }: Props) {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: NavColors.navBg,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Pressable
        onPress={backDisabled ? undefined : (onBack ?? (() => router.back()))}
        hitSlop={12}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: backDisabled ? 0.3 : 1 }}
      >
        <Ionicons name="chevron-back" size={20} color={NavColors.teal} />
        <Text
          style={{
            color: NavColors.teal,
            fontSize: 18,
            fontFamily: 'IBMPlexSans_600SemiBold',
          }}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
}
