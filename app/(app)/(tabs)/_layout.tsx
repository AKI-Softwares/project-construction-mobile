import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavColors } from '@/theme/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : `${name}-outline` as IoniconName}
      size={22}
      color={focused ? NavColors.teal : NavColors.tNav + '88'}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: NavColors.tabBg,
          borderTopColor: NavColors.navBg,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor:   NavColors.teal,
        tabBarInactiveTintColor: NavColors.tNav + '66',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'IBMPlexSans_400Regular',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visitas',
          tabBarIcon: ({ focused }) => <TabIcon name="clipboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
