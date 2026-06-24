import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: active ? Colors.amber : Colors.t3 }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg1,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: insets.bottom + 8,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.amber,
        tabBarInactiveTintColor: Colors.t3,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: 'IBMPlexSans_400Regular',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visitas',
          tabBarIcon: ({ focused }) => <TabIcon label="◫" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon label="◉" active={focused} />,
        }}
      />
    </Tabs>
  );
}
