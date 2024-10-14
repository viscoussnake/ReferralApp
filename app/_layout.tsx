import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false }} />
      <Stack.Screen name="InitialSetup" options={{ headerShown: false }} />
      <Stack.Screen 
        name="change-email" 
        options={{ 
          title: 'Change Your Email',
          headerShown: true,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen name="manual-entry" options={{ title: 'Manual Entry', headerShown: true }} />
      <Stack.Screen name="extract-summary" options={{ title: 'Extract Summary', headerShown: true }} />
    </Stack>
  );
}