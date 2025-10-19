import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import TabBarBackground from '@/components/ui/tab-bar-background';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  /*
   * TabLayout renders the bottom tab navigator for the app.
   * Purpose: centralize tab configuration (icons, titles, styles) and
   * apply consistent theming + haptics across all tabs.
   */
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35', // Active icon color
        tabBarInactiveTintColor: '#8E8E93', // Inactive icon color
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false, // Hide text labels under icons
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#1C1C1E',
            borderTopColor: 'transparent',
            borderTopWidth: 0,
            marginHorizontal: 16,
            marginBottom: 12,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          },
          default: {
            backgroundColor: '#1C1C1E',
            borderTopColor: 'transparent',
            borderTopWidth: 0,
            marginHorizontal: 16,
            marginBottom: 8,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
            borderRadius: 20,
            elevation: 8,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <Ionicons name="medical" size={size ?? 26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size ?? 26} color={color} />,
        }}
      />
    </Tabs>
  );
}

