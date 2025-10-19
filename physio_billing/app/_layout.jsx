import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBillingStore } from '@/store/billingStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Sets up global navigation stack and theme, and loads persisted billing data on app start.
  const colorScheme = useColorScheme();
  const loadData = useBillingStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="invoice/create" 
          options={{ 
            presentation: 'modal', 
            title: 'Create Invoice',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="invoice/[id]" 
          options={{ 
            presentation: 'modal', 
            title: 'Invoice Details',
            headerShown: true 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

